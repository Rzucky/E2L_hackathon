/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
const express = require('express');
const jwt = require('jsonwebtoken');
const AccessControl = require('accesscontrol');
const md5 = require('md5');
const cors = require('cors');
const {
  expressCspHeader, INLINE, NONE, SELF,
} = require('express-csp-header');
const Logger = require('./Activity');
const Stats = require('./Stats');
const Threats = require('./Threats');
const Alerts = require('./Alerts');
const MFA = require('./MFA');

// app.use(express.json())

const ac = new AccessControl();

ac.grant('base')
  .readAny('data')
  .readOwn('profile')
  .updateOwn('profile');

ac.grant('admin')
  .extend('base')
  .readAny('profile')
  .readAny('data')
  .readAny('reports')
  .updateAny('profile')
  .deleteAny('profile')
  .createAny('profile')
  .createAny('threat');

class UserManagement {
  constructor(hash) {
    this.app = express();
    this.app.use(expressCspHeader({
      policies: {
        'default-src': [expressCspHeader.NONE],
        'img-src': [expressCspHeader.SELF],
      },
    }));
    this.app.use(cors());

    this.users = [
      { username: 'user3', password: 'password3', role: 'base' },
      { username: 'user1', password: 'password1', role: 'base' },
      { username: 'user2', password: 'password2', role: 'admin' },
    ];
    // this.secretKey = 'mysecretkey';
    this.secretKey = hash;
    this.authMiddleware = this.authMiddleware.bind(this);
    this.login = this.login.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
    this.insertThreat = this.insertThreat.bind(this);
    this.start = this.start.bind(this);
    this.verify = this.verify.bind(this);
    this.simulateUrl = this.simulateUrl.bind(this);
  }

  authMiddleware(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, this.secretKey);
      req.user = decoded;
      console.log('aaa', req.user);
      next();
    } catch (err) {
      console.log(err);
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  async checkThreat(req, res, next) {
    const me = this;
    const { url } = req.body;
    let malicious = false;
    let type = '';
    console.log(url);
    let data = await Threats.checkSimilarity(url);
    if (data.error) {
      return res.status(401).json(data);
    }
    if (data.data.malicious) {
      malicious = true;
      type = 'similarity';
      req.threat = malicious;
      // increase in base
      await Threats.increaseOccurrenceInDb(type);
      // add to alerts
      await Alerts.addAlert(req.user.username, type, url);

      return next();
    }

    data = await Threats.checkThreatTypes(url);
    if (data.error) {
      return res.status(401).json(data);
    }
    if (data.data.malicious) {
      malicious = true;
      type = data.data.threat.type;
      req.threat = malicious;
      // increase in base
      await Threats.increaseOccurrenceInDb(type);
      // add to alerts
      await Alerts.addAlert(req.user.username, type, url);
      return next();
    }
    req.threat = malicious;
    next();
  }

  async verify(req, res) {
    const me = this;
    const { username, code } = req.body;

    const dataCode = await MFA.getCodeFromDB(username);
    if (dataCode.error) {
      return res.status(401).json(dataCode);
    }
    if (code === dataCode.data.code) {
      const userData = await MFA.getUserData(username);
      if (userData.error) {
        return res.status(401).json(userData);
      }

      const token = jwt.sign({ username, role: (userData.data.admin) ? 'admin' : 'base' }, me.secretKey);
      return res.status(200).json({ error: false, token });
    }
    return res.status(401).json({ error: true, message: 'Unsuccessfull MultiFactor Authentication' });
  }

  async getStats(req, res) {
    const me = this;
    const { role } = req.user;

    if (ac.can(role).readAny('data').granted) {
      const data = await Stats.getNumberOfRequests();
      if (data.error) {
        return res.status(401).json(data);
      }
      return res.status(200).json(data);
    }

    return res.status(403).json({ message: 'Forbidden' });
  }

  async login(req, res) {
    const me = this;
    const { username, password } = req.body;

    const userData = await MFA.getUserData(username);
    if (userData.error) {
      return res.status(401).json(userData);
    }
    // const user = this.users.find((u) => u.username === username && u.password === password);
    if (userData.data.username !== username || userData.data.password !== md5(password)) {
      return res.status(401).json({ error: true, message: 'Incorrect username or password' });
    }
    const data = await MFA.saveCodeToDB(username);
    if (data.error) {
      return res.status(401).json(data);
    }

    // await MFA.sendMail(username, data.data.code);

    return res.status(200).json(data);
  }

  async simulateUrl(req, res) {
    const me = this;
    const { url } = req.body;
    try {
      let queryStr = '';
      if (req.threat) {
        queryStr = 'UPDATE public.requests SET bad = bad + 1';
      } else {
        queryStr = 'UPDATE public.requests SET good = good + 1';
      }
      await global.pgdb.query(
        queryStr,
      );
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: true, data: {}, notice: 'Internal error' });
    }
    if (req.threat) {
      return res.status(400).json({ error: true, message: 'Malicious URL, call blocked' });
    }

    return res.status(200).json({ error: false, message: 'All OK' });
  }

  async createProfile(req, res) {
    const me = this;
    console.log(req.body);
    const { username, password, role } = req.body;
    console.log(req.user);
    if (ac.can(req.user.role).createAny('profile').granted) {
      await Logger.logActivity(req.user.username, `Admin ${req.user.username} created ${username}`);

      const risk = (role === 'admin') ? 0 : 5;
      try {
        await global.pgdb.query(
          `INSERT INTO public.users (username, password, risk_factor, admin) 
          VALUES ($1, $2, $3, $4);`,
          [username, md5(password), risk, (role === 'admin')],
        );
        console.log('User created');
      } catch (e) {
        console.log(e);
        return res.status(400).json({ message: 'Error creating user' });
      }

      return res.status(200).json({ message: 'success' });
    }
    return res.status(400).json({ error: true, data: {}, notice: 'NO ACCESS' });
  }

  async getUsers(req, res) {
    const me = this;
    const { username } = req.params;
    const { role } = req.user;
    if (ac.can(role).readAny('profile').granted) {
      const users = [];
      try {
        const dataDb = await global.pgdb.query('SELECT * FROM public.users;');
        if (dataDb) {
          const data = dataDb.rows;
          for (const user of data) {
            const userObj = {
              username: user.username,
              riskFactor: user.risk_factor,
              location: user.location,
              role: (user.admin) ? 'admin' : 'base',
            };
            users.push(userObj);
          }
          console.log('gotten user data from DB', data);
          return res.status(200).json({ error: false, data: { users } });
        }
        throw new Error();
      } catch (e) {
        console.log(e);
        return { error: true, data: {}, notice: 'Internal error' };
      }
    }
    res.status(403).json({ message: 'Forbidden' });
  }

  // TODO NOT WORKING
  async deleteProfile(req, res) {
    const me = this;
    const { username } = req.body;
    const { role } = req.user;

    if (ac.can(role).deleteAny('profile').granted) {
      const userData = await MFA.getUserData(username);
      if (userData.error) {
        return res.status(401).json({ error: true, message: 'User not found' });
      }
      try {
        await global.pgdb.query(
          'DELETE FROM public.users WHERE username = $1;',
          [username],
        );
      } catch (e) {
        console.log(e);
        return res.status(404).json({ error: true, data: {}, notice: 'Internal error' });
      }
      return res.status(200).json({ error: false, message: 'Profile deleted successfully' });
    }

    res.status(403).json({ message: 'Forbidden' });
  }

  async insertThreat(req, res) {
    const me = this;
    const { type, regex, severity } = req.body;
    const { role } = req.user;

    if (ac.can(role).createAny('threat').granted) {
      try {
        await global.pgdb.query(
          `INSERT INTO public.threats (type, regex, occurrence, severity) 
          VALUES ($1, $2, $3, $4);`,
          [type, regex, 0, severity],
        );
        console.log('Threat inserted');
      } catch (e) {
        console.log(e);
        return res.status(400).json({ message: 'Error inserting threat' });
      }
      return res.status(200).json({ error: false, message: 'Threat type inserted successfully' });
    }

    return res.status(403).json({ message: 'Forbidden' });
  }

  async getAlerts(req, res) {
    const me = this;
    const { type, regex, severity } = req.body;
    const { role } = req.user;

    if (ac.can(role).readAny('data').granted) {
      const data = await Alerts.getAlerts();
      if (data.error) {
        return res.status(401).json({ error: true, message: 'Alerts not found' });
      }
      return res.status(200).json(data);
    }
    return res.status(403).json({ message: 'Forbidden' });
  }

  async getReport(req, res) {
    const me = this;
    const { role } = req.user;

    if (ac.can(role).readAny('reports').granted) {
      const data = await Stats.getReports();
      if (data.error) {
        return res.status(401).json({ error: true, message: 'Reports not found' });
      }
      return res.status(200).json(data);
    }
    return res.status(403).json({ message: 'Forbidden' });
  }

  async devcode(req, res) {
    const me = this;
    const { username } = req.params;
    const code = await MFA.getCodeFromDB(username);
    res.status(200).json({ code: code.data.code });
  }

  start() {
    this.app.use(express.json());
    this.app.post('/login', this.login);
    this.app.post('/verify', this.verify);
    this.app.post('/createProfile', this.authMiddleware, this.createProfile);
    this.app.get('/users', this.authMiddleware, this.getUsers);
    this.app.post('/simulateUrl', this.authMiddleware, this.checkThreat, this.simulateUrl);
    this.app.get('/getStats', this.authMiddleware, this.getStats);
    this.app.get('/insertThreat', this.authMiddleware, this.insertThreat);
    this.app.get('/alerts', this.authMiddleware, this.getAlerts);
    this.app.get('/reports', this.authMiddleware, this.getReport);
    this.app.get('/devcode/:username', this.devcode);
    this.app.post('/delete', this.authMiddleware, this.deleteProfile);

    this.app.listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log('User management server started on port 3000');
    });
  }
}

module.exports = UserManagement;

/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
const express = require('express');
const jwt = require('jsonwebtoken');
const AccessControl = require('accesscontrol');
const md5 = require('md5');
const cors = require('cors');
const Logger = require('./Activity');
const Stats = require('./Stats');
const MFA = require('./MFA');

const ac = new AccessControl();

ac.grant('base')
  .readAny('data')
  .readOwn('profile')
  .updateOwn('profile');

ac.grant('admin')
  .extend('base')
  .readAny('profile')
  .readAny('data')
  .updateAny('profile')
  .deleteAny('profile')
  .createAny('profile');

class UserManagement {
  constructor(hash) {
    this.app = express();
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      next();
    });

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

  simulateUrl(req, res) {
    // eslint-disable-next-line no-unused-vars
    const me = this;
    const { url } = req.params;
    // const { role } = req.user;

    return res.status(200).json({ error: false, data: { searchedUrl: url }, notice: 'SUCCESS' });
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

  async deleteProfile(req, res) {
    const { username } = req.params;
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

    if (ac.can(role).deleteOwn('profile').granted && username === req.user.username) {
      const userIndex = this.users.findIndex((u) => u.username === username);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      this.users.splice(userIndex, 1);
      return res.status(200).json({ message: 'Profile deleted successfully' });
    }

    res.status(403).json({ message: 'Forbidden' });
  }

  start() {
    this.app.use(express.json());
    this.app.post('/login', this.login);
    this.app.post('/verify', this.verify);
    this.app.post('/createProfile', this.authMiddleware, this.createProfile);
    this.app.get('/users', this.authMiddleware, this.getUsers);
    this.app.get('/simulateUrl/:url', this.authMiddleware, this.simulateUrl);
    this.app.get('/getStats', this.authMiddleware, this.getStats);
    this.app.post('/delete', this.authMiddleware, this.deleteProfile);

    this.app.listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log('User management server started on port 3000');
    });
  }
}

module.exports = UserManagement;

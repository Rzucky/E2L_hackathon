/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable no-console */
const express = require('express');
const jwt = require('jsonwebtoken');
const AccessControl = require('accesscontrol');
const md5 = require('md5');
const Logger = require('./Activity');
const Stats = require('./Stats');

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
    this.users = [
      { username: 'user3', password: 'password3', role: 'base' },
      { username: 'user1', password: 'password1', role: 'base' },
      { username: 'user2', password: 'password2', role: 'admin' },
    ];
    this.secretKey = 'mysecretkey';
    // this.secretKey = hash;
    this.authMiddleware = this.authMiddleware.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
    this.start = this.start.bind(this);
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

  MFA(user, pass) {
    const me = this;

    // TODO implement

    return { error: false, data: {}, notice: 'SUCCESS' };
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

  login(req, res) {
    const me = this;
    const { username, password } = req.body;
    const user = this.users.find((u) => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }

    const resp = me.MFA(username, password);
    if (resp.error) {
      return res.status(401).json({ message: 'Unsuccessfull MultiFactor Authentication' });
    }

    const token = jwt.sign({ username: user.username, role: user.role }, this.secretKey);
    return res.status(200).json({ token });
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

  getProfile(req, res) {
    const { username } = req.params;
    const { role } = req.user;

    if (ac.can(role).readAny('profile').granted) {
      const user = this.users.find((u) => u.username === username);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ username: user.username, role: user.role });
    }

    if (ac.can(role).readOwn('profile').granted && username === req.user.username) {
      return res.status(200).json({ username, role });
    }

    res.status(403).json({ message: 'Forbidden' });
  }

  updateProfile(req, res) {
    const { username } = req.params;
    const { role } = req.user;

    if (ac.can(role).updateAny('profile').granted) {
      const user = this.users.find((u) => u.username === username);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { newUsername } = req.body;
      user.username = newUsername;
      return res.status(200).json({ message: 'Profile updated successfully' });
    }

    if (ac.can(role).updateOwn('profile').granted && username === req.user.username) {
      const { newUsername } = req.body;
      this.users.find((u) => u.username === username).username = newUsername;
      return res.status(200).json({ message: 'Profile updated successfully' });
    }

    res.status(403).json({ message: 'Forbidden' });
  }

  deleteProfile(req, res) {
    const { username } = req.params;
    const { role } = req.user;

    if (ac.can(role).deleteAny('profile').granted) {
      const userIndex = this.users.findIndex((u) => u.username === username);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      this.users.splice(userIndex, 1);
      return res.status(200).json({ message: 'Profile deleted successfully' });
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
    this.app.post('/createProfile', this.authMiddleware, this.createProfile);
    this.app.get('/users/:username', this.authMiddleware, this.getProfile);
    this.app.get('/simulateUrl/:url', this.authMiddleware, this.simulateUrl);
    this.app.get('/getStats', this.authMiddleware, this.getStats);
    this.app.put('/users/:username', this.authMiddleware, this.updateProfile);
    this.app.delete('/users/:username', this.authMiddleware, this.deleteProfile);

    this.app.listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log('User management server started on port 3000');
    });
  }
}

module.exports = UserManagement;

/* eslint-disable consistent-return */
const express = require('express');
const jwt = require('jsonwebtoken');
const AccessControl = require('accesscontrol');

const ac = new AccessControl();

ac.grant('base')
  .readOwn('profile')
  .updateOwn('profile');

ac.grant('admin')
  .extend('base')
  .readAny('profile')
  .updateAny('profile')
  .deleteAny('profile');

class UserManagement {
  constructor() {
    this.app = express();
    this.users = [
      { username: 'user1', password: 'password1', role: 'base' },
      { username: 'user2', password: 'password2', role: 'admin' },
    ];
    this.secretKey = 'mysecretkey';
    this.authMiddleware = this.authMiddleware.bind(this);
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.deleteProfile = this.deleteProfile.bind(this);
  }

  authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, this.secretKey);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  login(req, res) {
    const { username, password } = req.body;
    const user = this.users.find((u) => u.username === username && u.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Incorrect username or password' });
    }

    const token = jwt.sign({ username: user.username, role: user.role }, this.secretKey);
    return res.status(200).json({ token });
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
    this.app.get('/users/:username', this.authMiddleware, this.getProfile);
    this.app.put('/users/:username', this.authMiddleware, this.updateProfile);
    this.app.delete('/users/:username', this.authMiddleware, this.deleteProfile);

    this.app.listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log('User management server started on port 3000');
    });
  }
}

const userManager = new UserManagement();
userManager.start();

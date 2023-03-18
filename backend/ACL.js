const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { AccessControl } = require('accesscontrol');
const ac = new AccessControl();

// Define roles and permissions
ac.grant('base').readOwn('profile').updateOwn('profile');
ac.grant('admin').extend('base').readAny('profile').updateAny('profile').deleteAny('profile');

// Define users
const users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin' },
  { id: 2, username: 'user', password: 'user123', role: 'base' }
];

// Middleware to verify JWT and user permissions
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'secret_key');
  const userId = decodedToken.userId;
  const user = users.find(u => u.id === userId);
  const permission = ac.can(user.role)[req.method.toLowerCase()](req.route.path);
  if (permission.granted) {
    req.user = user;
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Parse requests
app.use(bodyParser.json());

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    if (result) {
      const token = jwt.sign({ userId: user.id }, 'secret_key', { expiresIn: '1h' });
      return res.status(200).json({ token });
    }
    return res.status(401).json({ message: 'Invalid username or password' });
  });
});

// Get profile endpoint
app.get('/profile', authMiddleware, (req, res) => {
  const user = req.user;
  if (user) {
    res.status(200).json({ username: user.username, role: user.role });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Update profile endpoint
app.put('/profile', authMiddleware, (req, res) => {
  const user = req.user;
  if (user) {
    // Check if user is allowed to update profile
    if (user.role === 'base' && user.id !== req.body.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Update user profile
    const index = users.findIndex(u => u.id === user.id);
    users[index].username = req.body.username;
    users[index].password = req.body.password;
    res.status(200).json({ message: 'Profile updated successfully' });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

// Delete profile endpoint
app.delete('/profile/:id', authMiddleware, (req, res) => {
  const user = req.user;
  if (user) {
    // Check

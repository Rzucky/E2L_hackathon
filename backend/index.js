const UserManagement = require('./UserManagement');

class Start {
  constructor() {
    const us = new UserManagement();
    us.start();
  }
}

// eslint-disable-next-line no-new
new Start();

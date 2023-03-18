const UserManagement = require('./UserManagement');

class Start {
  constructor() {
    UserManagement.start();
  }
}

// eslint-disable-next-line no-new
new Start();

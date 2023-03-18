const UserManagement = require('./UserManagement');
const Simulator = require('./Simulator');

class Start {
  constructor() {
    const us = new UserManagement();
    us.start();
    const sim = new Simulator();
    sim.startRequests();
  }
}

// eslint-disable-next-line no-new
new Start();

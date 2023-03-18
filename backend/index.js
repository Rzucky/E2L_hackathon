const UserManagement = require('./UserManagement');
const Simulator = require('./Simulator');
const Logger = require('./Activity');
require('dotenv').config();

const hash = process.env.HASH;

class Start {
  constructor() {
    global.logger = new Logger();

    const us = new UserManagement(hash);
    us.start();
    // const sim = new Simulator();
    // sim.startRequests();
  }
}

// eslint-disable-next-line no-new
new Start();

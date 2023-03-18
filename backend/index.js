const UserManagement = require('./UserManagement');
const Simulator = require('./Simulator');
require('dotenv').config();

const token = process.env.DEV_TOKEN;
const hash = process.env.HASH;

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

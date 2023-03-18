/* eslint-disable no-console */
const { Pool } = require('pg');
const dayjs = require('dayjs');

class Logger {
  constructor() {
    global.pgdb = new Pool();
    global.pgdb.connect();

    process.on('SIGINT', () => {
      console.log('Received SIGINT signal');
      Logger.cleanup();
      process.exit();
    });

    process.on('SIGTERM', () => {
      console.log('Received SIGTERM signal');
      Logger.cleanup();
      process.exit();
    });
  }

  static cleanup() {
    console.log('Closing database pool');
    global.pgdb.end();
  }

  static async logActivity(username, activity) {
    await global.pgdb.query(`INSERT INTO public.activity_log (username, time, activity) 
          VALUES ($1, $2, $3);`, [username, dayjs().format('YYYY-MM-DD HH:mm:ss'), activity], (err) => {
      if (err) {
        console.error('Error executing query:', err.stack);
      }
    });
  }
}

module.exports = Logger;

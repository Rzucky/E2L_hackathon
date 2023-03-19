/* eslint-disable no-restricted-syntax */
const dayjs = require('dayjs');

class Alerts {
  static async addAlert(username, type, url) {
    try {
      await global.pgdb.query(
        `INSERT INTO public.alerts (username, type, url, time) 
          VALUES ($1, $2, $3, $4);`,
        [username, type, url, dayjs().format('YYYY-MM-DD HH:mm:ss')],
      );
      console.log('Alert inserted');
    } catch (e) {
      console.log(e);
      return { message: 'Error inserting alert' };
    }
    return { error: false, message: 'Alert inserted successfully' };
  }

  static async getAlerts() {
    try {
      const dataDb = await global.pgdb.query('SELECT * FROM public.alerts;');
      if (dataDb) {
        const alerts = [];
        const data = dataDb.rows;
        for await (const alert of data) {
          const data2 = await global.pgdb.query('SELECT * FROM public.threats WHERE type = $1 LIMIT 1;', [alert.type]);
          const sev = data2.rows[0].severity;
          const alertObj = {
            type: alert.type,
            severity: sev,
            time: alert.time,
          };
          alerts.push(alertObj);
        }
        console.log('gotten user data from DB', data);
        return { error: false, data: { alerts } };
      }
      throw new Error();
    } catch (e) {
      console.log(e);
      return { error: true, data: {}, notice: 'Internal error' };
    }
  }

  static async getReports() {
    try {
      const dataDb = await global.pgdb.query(`SELECT a.username, a."time", a."type", t.severity, u."location"  
      FROM public.alerts a JOIN public.threats t ON a."type"  = t."type" 
      JOIN users u ON a.username = u.username ;`);
      if (dataDb) {
        const reports = [];
        const data = dataDb.rows;
        for (const rep of data) {
          const report = {
            username: rep.username,
            time: rep.time,
            type: rep.type,
            severity: rep.severity,
            location: rep.location,
          };
          reports.push(report);
        }
        console.log('gotten report data from DB', data);
        return { error: false, data: { reports } };
      }
      throw new Error();
    } catch (e) {
      console.log(e);
      return { error: true, data: {}, notice: 'Internal error' };
    }
  }
}

module.exports = Alerts;

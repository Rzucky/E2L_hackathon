/* eslint-disable no-restricted-syntax */
class Stats {
  static async getNumberOfRequests() {
    let good = 0;
    let bad = 0;
    let perc = 0;
    try {
      const dataDb = await global.pgdb.query(
        'SELECT * FROM public.requests LIMIT 1;',
      );
      if (dataDb) {
        const data = dataDb.rows[0];
        console.log(data);

        good = data.good;
        bad = data.bad;
        if (good === 0) {
          perc = 0;
        } else {
          perc = `${String(((bad / good) * 100).toFixed(3))}%`;
        }
      }
    } catch (e) {
      console.log(e);
      return { error: true, data: {}, notice: 'Internal error' };
    }

    return { error: false, data: { numberOfGood: good, numberOfBad: bad, percentage: perc } };
  }

  static async getReports() {
    try {
      const dataDb = await global.pgdb.query(`SELECT a.username, a."time", a."type", t.severity, u."location"  
      FROM public.alerts a JOIN public.threats t ON a."type"  = t."type" 
      JOIN users u ON a.username = u.username ;`);
      if (dataDb) {
        const reports = [];
        const data = dataDb.rows;
        const usersData = [];
        const threatsData = [];

        const dataDbU = await global.pgdb.query('SELECT * FROM public.users;');
        if (dataDbU) {
          const dataU = dataDbU.rows;
          for (const user of dataU) {
            usersData.push({
              username: user.username,
              count: 0,
            });
          }
        }
        const dataDbThr = await global.pgdb.query('SELECT * FROM public.threats;');
        if (dataDbThr) {
          const dataU = dataDbThr.rows;
          for (const thr of dataU) {
            threatsData.push({
              type: thr.type,
              count: thr.occurrence,
            });
          }
        }
        for (const rep of data) {
          const report = {
            username: rep.username,
            time: rep.time,
            type: rep.type,
            severity: rep.severity,
            location: rep.location,
          };
          reports.push(report);

          for (const user of usersData) {
            if (user.username === rep.username) {
              user.count += 1;
            }
          }
        }
        console.log('gotten report data from DB', data);
        return { error: false, data: { reports, usersData, threatsData } };
      }
      throw new Error();
    } catch (e) {
      console.log(e);
      return { error: true, data: {}, notice: 'Internal error' };
    }
  }
}

module.exports = Stats;

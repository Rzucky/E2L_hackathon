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
}

module.exports = Stats;

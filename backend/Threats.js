/* eslint-disable no-restricted-syntax */
const stringSimilarity = require('string-similarity');

class Threats {
  static async checkSimilarity(userUrl) {
    try {
      const dataDb = await global.pgdb.query('SELECT * FROM public.urls WHERE malicious = 0;');
      if (dataDb) {
        const data = dataDb.rows;
        console.log('gotten urls from DB', data);
        let malicious = false;
        for (const url of data) {
          const similarity = stringSimilarity.compareTwoStrings(userUrl, url.url);
          if (similarity > 0.75 && similarity !== 1) {
            malicious = true;
          }
        }
        return { error: false, data: { malicious } };
      }
    } catch (e) {
      console.log(e);
      return { error: true, data: {}, notice: 'Internal error' };
    }
  }
}

/* eslint-disable no-restricted-syntax */
const stringSimilarity = require('string-similarity');

class Threats {
  static isRegex(str) {
    try {
      // eslint-disable-next-line no-new
      new RegExp(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  static async increaseOccurrenceInDb(type) {
    try {
      await global.pgdb.query(
        'UPDATE public.threats SET occurrence = occurrence + 1 WHERE type = $1',
        [type],
      );
      return { error: false, data: {} };
    } catch (e) {
      console.log(e);
      return { error: true, data: {}, notice: 'Internal error' };
    }
  }

  static async checkSimilarity(userUrl) {
    try {
      const dataDb = await global.pgdb.query('SELECT * FROM public.urls WHERE malicious = false;');
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
      return { error: true, data: {}, notice: 'Internal error on threat' };
    }
    return { error: true, data: {}, notice: 'Internal error on threat' };
  }

  static async checkThreatTypes(userUrl) {
    try {
      const dataDb = await global.pgdb.query('SELECT * FROM public.threats');
      if (dataDb) {
        const data = dataDb.rows;
        let malicious = false;
        let foundThreat = {};
        for (const threat of data) {
          if (!this.isRegex(threat.regex)) {
            console.log('skipping threat', threat);
            // eslint-disable-next-line no-continue
            continue;
          }
          const resp = new RegExp(threat.regex).test(userUrl);
          console.log(threat, resp, userUrl);
          if (resp) {
            malicious = true;
            foundThreat = threat;
            break;
          }
        }

        return { error: false, data: { malicious, threat: foundThreat } };
      }
    } catch (e) {
      console.log(e);
      return { error: true, data: {}, notice: 'Internal error on threat' };
    }
    return { error: true, data: {}, notice: 'Internal error on threat' };
  }
}

module.exports = Threats;

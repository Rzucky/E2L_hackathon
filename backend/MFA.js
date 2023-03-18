/* eslint-disable no-console */
const sgMail = require('@sendgrid/mail');

class MFA {
  static generateRandomString(length) {
    // eslint-disable-next-line no-unused-vars
    const me = this;
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  static async sendMail(username, code) {
    sgMail.setApiKey(process.env.MAIL_API_KEY);

    const msg = {
      to: username, // Change to your recipient
      from: 'enemies2lovers.hackathon@gmail.com', // Change to your verified sender
      subject: 'E2L code to login',
      text: 'Please use this code to enter E2L',
      html: `<strong>${code}</strong>`,
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  static async saveCodeToDB(username) {
    const code = MFA.generateRandomString(6);
    try {
      await global.pgdb.query(
        'UPDATE public.users SET code = $1 WHERE username = $2;',
        [code, username],
      );
      console.log('Code saved to DB');
    } catch (e) {
      console.log(e);
      return { error: true, data: {}, notice: 'Internal error' };
    }

    return { error: false, data: {} };
  }

  static async getCodeFromDB(username) {
    try {
      const dataDb = await global.pgdb.query('SELECT code FROM public.users WHERE username = $1 LIMIT 1;', [username]);
      if (dataDb) {
        const data = dataDb.rows[0];
        console.log('gotten code from DB', data);
        return { error: false, data };
      }
      throw new Error();
    } catch (e) {
      console.log(e);
      return { error: true, data: {}, notice: 'Internal error' };
    }
  }

  static async getUserData(username) {
    try {
      const dataDb = await global.pgdb.query('SELECT * FROM public.users WHERE username = $1 LIMIT 1;', [username]);
      if (dataDb) {
        const data = dataDb.rows[0];
        console.log('gotten user data from DB', data);
        return { error: false, data };
      }
      throw new Error();
    } catch (e) {
      console.log(e);
      return { error: true, data: {}, notice: 'Internal error' };
    }
  }
}

module.exports = MFA;

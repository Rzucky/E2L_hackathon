const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIxIiwicm9sZSI6ImJhc2UiLCJpYXQiOjE2NzkxMzc4MjF9.UkBgcTcLZ8y5KX7BIyD6-msmRHvrjW1ENssf7Kj5xjw';

class Simulator {
  static url = 'https://e2l-hackathon.onrender.com/simulateUrl';

  constructor() {
    this.startRequests = this.startRequests.bind(this);
  }

  generateRandomString(length) {
    // eslint-disable-next-line no-unused-vars
    const me = this;
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i += 1) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  startRequests() {
    setInterval(() => {
      axios.get(`${this.url}/${this.generateRandomString(12)}`, {
        headers: {
          authorization: token,
        },
      })
        .then((response) => {
          if (response.data.error) {
            console.error(response.data.error);
          }
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }, 1000);
  }
}

module.exports = Simulator;

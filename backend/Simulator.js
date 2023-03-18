const axios = require('axios');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIxIiwicm9sZSI6ImJhc2UiLCJpYXQiOjE2NzkxNDE5ODd9.nZr9jZqB3BvVhD9Iu_gFfD09siY5zwKmc9VHFL9E4rA';
const url = 'https://e2l-hackathon.onrender.com/simulateUrl';

class Simulator {

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
      axios.get(`${url}/${this.generateRandomString(12)}`, {
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

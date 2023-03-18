const express = require('express');
const app = express();
const port = 3000;

// Define your endpoints here
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/users', (req, res) => {
  // TODO: Implement create user logic
});

app.get('/users/:id', (req, res) => {
  // TODO: Implement get user by ID logic
});

app.put('/users/:id', (req, res) => {
  // TODO: Implement update user by ID logic
});

app.delete('/users/:id', (req, res) => {
  // TODO: Implement delete user by ID logic
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

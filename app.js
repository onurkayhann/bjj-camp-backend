const express = require('express');
const app = express();
require('dotenv').config();

app.get('/', (req, res) => {
  res.send('hello from node');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server runs at http://localhost:${port}`);
});

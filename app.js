const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
require('dotenv').config();

// import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// app
const app = express();

// db
mongoose
  .connect(process.env.DATABASE, {})
  .then(() => console.log('DB connected'))
  .catch((err) => console.log('DB Error => ', err));

// middlewares
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(expressValidator());

// routes middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server runs at http://localhost:${port}`);
});

const User = require('../models/user');
const jwt = require('jsonwebtoken'); // this is to generate signed token
const expressJwt = require('express-jwt'); // use to check the authorization
const { errorHandler } = require('../helpers/dbErrorHandler');

let uuidv1 = require('uuidv1');

exports.signup = (req, res) => {
  // console.log('req.body', req.body);
  const user = new User(req.body);
  user.save((err, user) => {
    if (err) {
      return res.status(400).json({
        err: errorHandler(err),
      });
    }
    // hiding the salt and hashed password
    user.salt = undefined;
    user.hashed_password = undefined;

    res.json({
      user,
    });
  });
};

exports.signin = (req, res) => {
  // finding user by their email
  const { email, password } = req.body;
  User.findOne({ email }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User with that email does not exist. Please sign up',
      });
    }

    // if the user is found make sure the email and password matches

    // create authenticate method in user model
    if (!user.authenticate(password)) {
      return res.status(401).json({
        error: "Email and password don't match",
      });
    }

    // generate a signed token with user id and secret
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // persist the token as 't' in cookie with expiry date
    res.cookie('t', token, { expire: new Date() + 9999 });

    // return response with user and token to frontend client
    const { _id, name, email, belt_color, role } = user;
    return res.json({ token, user: { _id, name, email, belt_color, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie('t');
  res.json({ message: 'You are now logged out' });
};

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'], // added later
  userProperty: 'auth',
});
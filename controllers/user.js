const User = require('../models/user');
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

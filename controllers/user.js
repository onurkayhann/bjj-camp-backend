const User = require('../models/user');
const { Order } = require('../models/order');
const { errorHandler } = require('../helpers/dbErrorHandler');

exports.userById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    req.profile = user;
    next();
  });
};

exports.read = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;

  return res.json(req.profile);
};

exports.update = (req, res) => {
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true },
    (err, user) => {
      if (err) {
        return res.status(400).json({
          error: 'You are not authorized to perform this action',
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    }
  );
};

exports.addOrderToUserHistory = (req, res, next) => {
  let history = [];

  req.body.order.camps.forEach((item) => {
    history.push({
      _id: item._id,
      name: item.name,
      description: item.description,
      category: item.category,
      quantity: item.count,
      transaction: req.body.order.transaction_id,
      amount: req.body.order.amount,
    });
  });

  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { history: history } },
    { new: true },
    (error, data) => {
      if (error) {
        return res.status(400).json({
          error: 'Could not update user purchase history',
        });
      }
      next();
    }
  );
};

exports.bookingHistory = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate('user', '_id name')
    .sort('-created')
    .exec((err, orders) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err),
        });
      }
      res.json(orders);
    });
};

// user CRUD

// user GET
exports.list = (req, res) => {
  User.find().exec((err, users) => {
    if (err) {
      return res.status(400).json({
        error: 'Users not found',
      });
    }
    res.json(users);
  });
};

// user DELETE

// exports.remove = (req, res) => {
//   const user = User.findById(req.params.userId);
//   console.log(user);
//   if (user) {
//     user.remove();
//     res.json({ message: 'User removed' });
//   } else {
//     res.status(404);
//     throw new Error('User not found');
//   }
//   res.json(user);
// };

exports.remove = (req, res) => {
  const user = User.findById(req.params.userId);
  user.remove((err) => {
    if (err) {
      return res.status(400).json({
        error: errorHandler(err),
      });
    }
    res.json({
      message: 'User is successfully deleted',
    });
  });
};

exports.adminUpdate = async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      { _id: req.profile.id },
      req.body,
      { new: true }
    );
    if (result) {
      return res.status(200).json({
        success: true,
        message: 'User is successfully updated!',
      });
    }
    await User.save();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error ${error.message}`,
      data: null,
    });
  }
};

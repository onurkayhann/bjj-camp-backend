const express = require('express');
const router = express.Router();

const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');

const {
  userById,
  read,
  update,
  bookingHistory,
  list,
  remove,
  adminUpdate,
} = require('../controllers/user');

router.get('/secret/:userId', requireSignin, isAuth, isAdmin, (req, res) => {
  res.json({
    user: req.profile,
  });
});

router.get('/users', list);
router.delete('/user/:userId', remove);
router.patch('/user/admin/:userId', requireSignin, adminUpdate);

router.get('/user/:userId', requireSignin, isAuth, read);
router.put('/user/:userId', requireSignin, isAuth, update);
router.get('/orders/by/user/:userId', requireSignin, isAuth, bookingHistory);

router.param('userId', userById);

module.exports = router;

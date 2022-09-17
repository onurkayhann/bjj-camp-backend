const express = require('express');
const router = express.Router();

const { signup } = require('../controllers/user');
const { userSignupValdiator } = require('../validator');

router.post('/signup', userSignupValdiator, signup);

module.exports = router;

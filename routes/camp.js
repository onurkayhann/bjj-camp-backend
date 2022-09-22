const express = require('express');
const router = express.Router();

const { create, campById, read } = require('../controllers/camp');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');

router.get('/camp/:campId', read);
router.post('/camp/create/:userId', requireSignin, isAuth, isAdmin, create);

router.param('userId', userById);
router.param('campId', campById);

module.exports = router;

const express = require('express');
const router = express.Router();

const {
  create,
  campById,
  read,
  remove,
  update,
  list,
  listRelated,
  listCategories,
  listBySearch,
  photo,
  listSearch,
} = require('../controllers/camp');
const { requireSignin, isAuth, isAdmin } = require('../controllers/auth');
const { userById } = require('../controllers/user');

router.get('/camp/:campId', read);
router.post('/camp/create/:userId', requireSignin, isAuth, isAdmin, create);
router.delete('/camp/:campId/:userId', requireSignin, isAuth, isAdmin, remove);
router.put('/camp/:campId/:userId', requireSignin, isAuth, isAdmin, update);

router.get('/camps', list);
router.get('/camps/search', listSearch);
router.get('/camps/related/:campId', listRelated);
router.get('/camps/categories', listCategories);
router.post('/camps/by/search', listBySearch);
router.get('/camp/photo/:campId', photo);

router.param('userId', userById);
router.param('campId', campById);

module.exports = router;

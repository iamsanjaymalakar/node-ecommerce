const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const shopController = require('../controllers/shop');


router.get('/', shopController.getIndex);

module.exports = router;
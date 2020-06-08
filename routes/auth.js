const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.route('/login')
    .get(authController.getLogin)
    .post([
        body('email', 'Please enter a valid email.')
            .isEmail()
            .normalizeEmail(),
        body('password', 'Password has to be valid.')
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim()
    ],
        authController.postLogin);


module.exports = router;
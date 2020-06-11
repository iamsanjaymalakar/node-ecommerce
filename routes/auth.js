const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/user');


router.route('/login')
    .get(authController.getLogin)
    .post([
        body('email', 'Please enter a valid email.')
            .isEmail()
            .normalizeEmail(),
        body('password', 'Password has to be valid.')
            .isLength({ min: 6 })
            .withMessage('Password should be atleast 6 characters long.')
            .isAlphanumeric()
            .withMessage('Password should be alphanumeric.')
            .trim()
    ],
        authController.postLogin);


router.route('/signup')
    .get(authController.getSignup)
    .post([
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(userDoc => {
                    if (userDoc) {
                        return Promise.reject(
                            'E-Mail exists already, please pick a different one.'
                        );
                    }
                });
            })
            .normalizeEmail(),
        body(
            'password',
            'Please enter a password with only numbers and text and at least 6 characters.'
        )
            .isLength({ min: 6 })
            .isAlphanumeric()
            .trim(),
        body('confirmPassword')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Passwords have to match!');
                }
                return true;
            })
    ],
        authController.postSignup);


router.post('/logout', authController.postLogout);


module.exports = router;
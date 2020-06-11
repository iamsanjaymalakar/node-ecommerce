const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');


// GET /login
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        prev: {
            email: '',
            password: ''
        },
        errorMessage: null,
        validationErrors: [],
    });
};


// POST /login
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);
    // if there are validation errors rerender the login
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'Login',
            prev: {
                email: email,
                password: password
            },
            errorMessage: null,
            validationErrors: errors.array(),
        });
    }
    // check user in database
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'Login',
                    errorMessage: 'Invalid email or password.',
                    prev: {
                        email: email,
                        password: password
                    },
                    validationErrors: [],
                });
            }
            bcrypt
                .compare(password, user.password)
                .then(match => {
                    if (match) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            // throw new Error(err);
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        prev: {
                            email: email,
                            password: password
                        },
                        errorMessage: 'Invalid email or password.',
                        validationErrors: [],
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => next(new Error(err)));
};


// GET /signup
exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: null,
        prev: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: [],
    });
};


// POST /signup
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);
    // re-render if validation error
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',
            prev: {
                email: email,
                password: password,
                confirmPassword: confirmPassword
            },
            errorMessage: null,
            validationErrors: errors.array(),
        });
    }
    bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: []
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            // return transporter.sendMail({
            //   to: email,
            //   from: 'shop@node-complete.com',
            //   subject: 'Signup succeeded!',
            //   html: '<h1>You successfully signed up!</h1>'
            // });
        })
        .catch(err => next(new Error(err)));
};


//POST /logout
exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

const User = require('../models/user');

// GET /login
exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: null,
        prev: {
            email: '',
            password: ''
        },
        validationErrors: [],
        isAuthenticated: true,
        csrfToken: 'ssss'
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
            errorMessage: errors.array()[0].msg,
            prev: {
                email: email,
                password: password
            },
            validationErrors: errors.array(),
            isAuthenticated: true,
            csrfToken: 'ssss'
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
                    oldInput: {
                        email: email,
                        password: password
                    },
                    validationErrors: [],
                    isAuthenticated: true,
                    csrfToken: 'ssss'
                });
            }
            bcrypt
                .compare(password, user.password)
                .then(mathc => {
                    if (mathc) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'Login',
                        errorMessage: 'Invalid email or password.',
                        oldInput: {
                            email: email,
                            password: password
                        },
                        validationErrors: [],
                        isAuthenticated: true,
                        csrfToken: 'ssss'
                    });
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};



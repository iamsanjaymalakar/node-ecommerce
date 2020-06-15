const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendgridMail = require('@sendgrid/mail');
const { validationResult } = require('express-validator');

const User = require('../models/user');

const SENDGRID_API_KEY = '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';
sendgridMail.setApiKey(SENDGRID_API_KEY);


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
                    prev: {
                        email: email,
                        password: password
                    },
                    errorMessage: 'Invalid email or password.',
                    validationErrors: [],
                });
            }
            bcrypt
                .compare(password, user.password)
                .then(match => {
                    if (match) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        let redirectTo = req.session.redirectTo || '/';
                        delete req.session.redirectTo;
                        return req.session.save(err => {
                            if (err)
                                console.log(err);
                            res.redirect(redirectTo);
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
        prev: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        errorMessage: null,
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
            const msg = {
                to: email,
                from: 'iamsanjaymalakar@gmail.com',
                subject: 'Signup succeeded!',
                html: '<h1>Sign-up successful.</h1>'
            };
            sendgridMail.send(msg)
                .then(() => {
                    console.log('sg ' + email);
                }, error => {
                    console.log('sg ' + error);
                });
        })
        .catch(err => next(new Error(err)));
};


//POST /logout
exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if (err)
            console.log(err);
        res.redirect('/');
    });
};


// GET /reset
exports.getReset = (req, res, next) => {
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        prev: {
            email: ''
        },
        errorMessage: null,
        validationErrors: []
    });
};


// POST /reset
exports.postReset = (req, res, next) => {
    const email = req.body.email;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/reset', {
            path: '/reset',
            pageTitle: 'Reset Password',
            prev: {
                email: email,
            },
            errorMessage: null,
            validationErrors: errors.array(),
        });
    }
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                user.resetToken = token;
                user.resetTokenExp = Date.now() + 3600000;
                return user.save();
            })
            .then(result => {
                res.redirect('/?' + token);
                const msg = {
                    to: email,
                    from: 'iamsanjaymalakar@gmail.com',
                    subject: 'Password reset.',
                    html: '<p>You requested a password reset</p><p>Click this ' +
                        '<a href="http://localhost:3000/reset/' + token +
                        '">link</a> to set a new password.</p>'
                };
                sendgridMail.send(msg)
                    .then(() => {
                        console.log('sg ' + email);
                    }, error => {
                        console.log('sg ' + error);
                    });
            })
            .catch(err => {
                return new Error(err);
            });
    });
};


// GET /reset/:token
exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExp: { $gt: Date.now() } })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/reset', {
                    path: '/reset',
                    pageTitle: 'Reset Password',
                    prev: {
                        email: ''
                    },
                    errorMessage: 'Reset token has been expired, Request again.',
                    validationErrors: []
                });
            }
            res.render('auth/new-password', {
                path: '/new-password',
                pageTitle: 'New Password',
                userId: user._id.toString(),
                passwordToken: token,
                prev: {
                    password: '',
                    confirmPassword: ''
                },
                errorMessage: null,
                validationErrors: []
            });
        })
        .catch(err => {
            return new Error(err);
        });
};


// POST /new-password
exports.postNewPassword = (req, res, next) => {
    const userId = req.body.userId;
    const newPassword = req.body.password;
    const newConfirmPassword = req.body.confirmPassword;
    const passwordToken = req.body.passwordToken;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('auth/new-password', {
            path: '/new-password',
            pageTitle: 'New Password',
            userId: userId,
            passwordToken: passwordToken,
            prev: {
                password: newPassword,
                confirmPassword: newConfirmPassword
            },
            errorMessage: null,
            validationErrors: errors.array()
        });
    }
    let tempUser;
    User.findOne({
        resetToken: passwordToken,
        resetTokenExp: { $gt: Date.now() },
        _id: userId
    }).then(user => {
        if (!user)
            return req.redirect('/reset');
        tempUser = user;
        return bcrypt.hash(newPassword, 12);
    }).then(hashedPassword => {
        tempUser.password = hashedPassword;
        tempUser.resetToken = undefined;
        tempUser.resetTokenExp = undefined;
        return tempUser.save();
    }).then(result => {
        res.redirect('/login');
    }).catch(err => {
        return new Error(err);
    });
};

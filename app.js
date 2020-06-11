const express = require('express');
const mongoose = require('mongoose');
const bp = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrfProtection = require('csurf')();

const authRoutes = require('./routes/auth');

const User = require('./models/user');

const app = express();

const MONGODB_URI = 'mongodb://localhost:27017/ecommerce';

// set ejs as view engine
app.set('view engine', 'ejs');
// define the views folder
app.set('views', 'views');

// set up static path
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(bp.urlencoded({ extended: false }));

//session storage
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});
store.on('error', function (error) {
    console.log(error);
    throw new Error(err);
});

//session
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
        },
        store: store
    })
);

// csrf middleware
app.use(csrfProtection);

// available to all views
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});

// retrieve user object if user is logged in 
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});


app.use(authRoutes);

app.get('/', function (req, res) {
    res.send('Hello ' + JSON.stringify(req.session));
});

app.use((error, req, res, next) => {
    console.log('Global error function');
    res.status(500).render('500', {
        pageTitle: 'Error!',
        path: '/500',
        isAuthenticated: req.session.isLoggedIn
    });
});


// if db connection successfull start listening
mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true, useUnifiedTopology: true
    }).then(res => {
        app.listen(3000, () => {
            console.log('Started');
        });
    }).catch(err => {
        console.log(err);
    });

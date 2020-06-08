const express = require('express');
const mongoose = require('mongoose');
const bp = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/auth');

const user = require('./models/user');
const product = require('./models/product');
// const user = require('./models/user');

const app = express();

// set ejs as view engine
app.set('view engine', 'ejs');
// define the views folder
app.set('views', 'views');

// set up static path
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(bp.urlencoded({ extended: false }));

mongoose.connect('mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true, useUnifiedTopology: true
});


app.use(authRoutes);


// if db connection successfull start listening
mongoose
    .connect('mongodb://localhost:27017/ecommerce', {
        useNewUrlParser: true, useUnifiedTopology: true
    }).then(res => {
        app.listen(3000, () => {
            console.log('Started');
        });
    }).catch(err => {
        console.log(err);
    });

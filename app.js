const express = require('express');
const mongoose = require('mongoose');

const user = require('./models/user');
const product = require('./models/product');
// const user = require('./models/user');


const app = express();

mongoose.connect('mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true, useUnifiedTopology: true
});



app.listen(3000, () => {
    console.log('Started');
})
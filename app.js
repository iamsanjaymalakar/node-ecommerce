const express = require('express');
const mongoose = require('mongoose');

const user = require('./models/user');

const app = express();

mongoose.connect('mongodb://localhost:27017/ecommerce', {
    useNewUrlParser: true, useUnifiedTopology: true
});

var schema = new mongoose.Schema({ name: 'string', size: 'string' });
var Tank = mongoose.model('Tank', schema);
var small = new Tank({ size: 'small' });
small.save();

app.listen(3000, () => {
    console.log('Started');
})
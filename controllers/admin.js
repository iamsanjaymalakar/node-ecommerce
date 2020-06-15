const { validationResult } = require('express-validator');
const Product = require('../models/product');

// GET /admin/add-product
exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
};


// POST /admin/add-product
exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    const errors = [...validationResult(req).array()];
    if (!image) {
        errors.push({
            msg: 'Attached file is not an image.',
            param: 'image'
        })
    }
    if (errors.length) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Add Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                price: price,
                description: description
            },
            errorMessage: null,
            validationErrors: errors
        });
    }
    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageURL: image.path,
        userId: req.user
    });
    product
        .save()
        .then(result => {
            console.log('Created Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            return new Error(err);
        });
};
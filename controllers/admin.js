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
    // const image = req.file;
    const imageURL = req.body.imageURL;
    const price = req.body.price;
    const description = req.body.description;
    // if (!image) {
    //     return res.status(422).render('admin/edit-product', {
    //         pageTitle: 'Add Product',
    //         path: '/admin/add-product',
    //         editing: false,
    //         hasError: true,
    //         product: {
    //             title: title,
    //             price: price,
    //             description: description
    //         },
    //         errorMessage: 'Attached file is not an image.',
    //         validationErrors: []
    //     });
    // }
    const errors = validationResult(req);
    console.log(errors);


    if (!errors.isEmpty()) {
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
            validationErrors: errors.array()
        });
    }

    // // const imageUrl = image.path;

    const product = new Product({
        title: title,
        price: price,
        description: description,
        imageURL: imageURL,
        userId: req.user
    });
    product
        .save()
        .then(result => {
            console.log(result);
            console.log('Created Product');
            res.redirect('/admin/products');
        })
        .catch(err => {
            // return res.status(500).render('admin/edit-product', {
            //   pageTitle: 'Add Product',
            //   path: '/admin/add-product',
            //   editing: false,
            //   hasError: true,
            //   product: {
            //     title: title,
            //     imageUrl: imageUrl,
            //     price: price,
            //     description: description
            //   },
            //   errorMessage: 'Database operation failed, please try again.',
            //   validationErrors: []
            // });
            // res.redirect('/500');
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
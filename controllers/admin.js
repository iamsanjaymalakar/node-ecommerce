const fs = require('fs');
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
            console.log('Created Product.');
            res.redirect('/admin/products');
        })
        .catch(err => new Error(err));
};


// GET /admin/products
exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user._id })
        .then(products => {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        })
        .catch(err => new Error(err));
};


// DELETE /admin/product/:productId
exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return next(new Error('Product not found.'));
            }
            fs.unlink(product.imageURL, err => {
                if (err) {
                    throw (err);
                }
            });
            return Product.deleteOne({
                _id: prodId,
                userId: req.user._id
            });
        })
        .then(() => {
            console.log('Deleted Product.');
            res.status(200).json({ message: 'Success!' });
        })
        .catch(err => {
            res.status(500).json({ message: 'Deleting product failed.' });
        });
};


// GET /admin/edit-product/:productId
exports.getEditProduct = (req, res, next) => {
    if (!req.query.edit) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: true,
                product: product,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            });
        })
        .catch(err => new Error(err));
};


// POST /admin/edit-product
exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: updatedTitle,
                price: updatedPrice,
                description: updatedDesc,
                _id: prodId
            },
            errorMessage: null,
            validationErrors: errors.array()
        });
    }
    Product.findById(prodId)
        .then(product => {
            if (product.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.description = updatedDesc;
            if (image) {
                fs.unlink(product.imageURL, err => {
                    if (err) {
                        throw (err);
                    }
                });
                product.imageURL = image.path;
            }
            return product.save().then(result => {
                console.log('Updated Product!');
                res.redirect('/admin/products');
            });
        })
        .catch(err => new Error(err));
};

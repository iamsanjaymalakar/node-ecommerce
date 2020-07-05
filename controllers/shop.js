const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const pdfkit = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const user = require('../models/user');

const ITEMS_PER_PAGE = 6;


// GET /
exports.getIndex = (req, res, next) => {
    const page = +req.query.page || 1;
    let total;
    Product.find()
        .countDocuments()
        .then(count => {
            total = count;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/index', {
                prods: products,
                pageTitle: 'Shop',
                path: '/',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < total,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(total / ITEMS_PER_PAGE)
            });
        })
        .catch(err => new Error(err));
};


// GET /products
exports.getProducts = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;

    Product.find()
        .countDocuments()
        .then(numProducts => {
            totalItems = numProducts;
            return Product.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(products => {
            res.render('shop/product-list', {
                prods: products,
                pageTitle: 'Products',
                path: '/products',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            });
        })
        .catch(err => new Error(err));
};


// GET /products/:productId
exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            res.render('shop/product-details', {
                product: product,
                pageTitle: product.title,
                path: '/products'
            });
        })
        .catch(err => new Error(err));
};


// GET /cart
exports.getCart = (req, res, next) => {
    let totalPrice = 0;
    let products;
    req.user
        .populate('cart.productId')
        .execPopulate()
        .then(user => {
            products = user.cart;
            if (products.length === 0) {
                console.log('none');
                res.render('shop/cart', {
                    path: '/cart',
                    pageTitle: 'Your Cart',
                    products: products,
                    totalPrice: totalPrice,
                    sessionId: null
                });
                return null;
            }
            products.forEach(p => {
                totalPrice += p.productId.price * p.quantity;
            });
            console.log(totalPrice);
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => {
                    return {
                        name: p.productId.title,
                        description: p.productId.description,
                        amount: parseInt(p.productId.price * 100),
                        currency: 'usd',
                        quantity: p.quantity
                    };
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout-success',
                cancel_url: req.protocol + '://' + req.get('host') + '/cart'
            }, function (err, session) {
                console.log(err);
            });
        }).then(session => {
            console.log('session created');
            console.log(session);
            if (session) {
                res.render('shop/cart', {
                    path: '/cart',
                    pageTitle: 'Your Cart',
                    products: products,
                    totalPrice: totalPrice,
                    sessionId: session.id

                });
            }
        })
        .catch(err => new Error(err));
};


// POST /cart
exports.postCart = (req, res, next) => {
    const productId = req.body.productId;
    const dec = req.body.dec;
    if (req.body.dec) {
        return req.user.reduceFromCart(productId)
            .then(result => {
                res.redirect('/cart');
            })
            .catch(err => new Error(err));
    }
    Product.findById(productId)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => new Error(err));
};


// POST /cart-delete-item
exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user
        .removeFromCart(prodId)
        .then(result => {
            res.redirect('/cart');
        })
        .catch(err => new Error(err));
};


// GET /checkout-success
exports.getCheckoutSuccess = (req, res, next) => {
    req.user
        .populate('cart.productId')
        .execPopulate()
        .then(user => {
            const products = user.cart.map(p => {
                return { quantity: p.quantity, product: { ...p.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products: products
            });
            return order.save();
        })
        .then(result => {
            return req.user.clearCart();
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => new Error(err));
};


// GET /orders
exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', {
                path: '/orders',
                pageTitle: 'Your Orders',
                orders: orders
            });
        })
        .catch(err => new Error(err));
};


// GET orders/:orderId
exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
        .then(order => {
            if (!order) {
                return next(new Error('No order found.'));
            }
            if (order.user.userId.toString() !== req.user._id.toString()) {
                return next(new Error('Unauthorized'));
            }
            const invoiceName = 'invoice-' + orderId + '.pdf';
            const invoicePath = path.join('data', 'invoices', invoiceName);
            const pdfDoc = new pdfkit();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader(
                'Content-Disposition',
                'inline; filename="' + invoiceName + '"'
            );
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            pdfDoc.fontSize(26).text('Invoice', {
                underline: true
            });
            pdfDoc.text('-----------------------');
            let totalPrice = 0;
            order.products.forEach(p => {
                totalPrice += p.quantity * p.product.price;
                pdfDoc
                    .fontSize(14)
                    .text(
                        p.product.title +
                        ' - ' +
                        p.quantity +
                        ' x ' +
                        '$' +
                        p.product.price
                    );
            });
            pdfDoc.text('------------------------------------------');
            pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
            pdfDoc.end();
        })
        .catch(err => next(err));
};
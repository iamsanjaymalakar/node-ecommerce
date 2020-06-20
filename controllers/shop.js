const Product = require('../models/product');
const stripe = require('stripe')(process.env.STRIPE_KEY);
console.log(process.env.STRIPE_KEY);
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
            products.forEach(p => {
                totalPrice += p.productId.price * p.quantity;
            });
            return stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: products.map(p => {
                    return {
                        name: p.productId.title,
                        description: p.productId.description,
                        amount: p.productId.price * 100,
                        currency: 'usd',
                        quantity: p.quantity
                    };
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
            });
        }).then(session => {
            res.render('shop/cart', {
                path: '/cart',
                pageTitle: 'Your Cart',
                products: products,
                totalPrice: totalPrice,
                sessionId: session.id

            });
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
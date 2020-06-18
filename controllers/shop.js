const Product = require('../models/product');
const ITEMS_PER_PAGE = 6;


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
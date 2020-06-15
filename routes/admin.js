const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');
const adminController = require('../controllers/admin');


router.route('/add-product')
    .get(isAuth, adminController.getAddProduct)
    .post([
        body('title', 'Enter a valid title with minimum 3 characters.')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('price', 'Price should be a number.').isFloat(),
        body('description', 'Enter a valid description of product.')
            .isLength({ min: 5, max: 400 })
            .trim()
    ], isAuth, adminController.postAddProduct);


router.route('/products')
    .get(isAuth, adminController.getProducts);


module.exports = router;
const router = require('express').Router();
const isAuth = require('../middleware/is-auth');
const shopController = require('../controllers/shop');


router.get('/', shopController.getIndex);


router.get('/products', shopController.getProducts);


router.get('/products/:productId', shopController.getProduct);


router.route('/cart')
    .get(isAuth, shopController.getCart)
    .post(isAuth, shopController.postCart);


router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);


router.get('/checkout-success', shopController.getCheckoutSuccess);


router.get('/orders', isAuth, shopController.getOrders);


router.get('/orders/:orderId', isAuth, shopController.getInvoice);


module.exports = router;
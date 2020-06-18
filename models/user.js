const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: {
        type: String
    },
    resetTokenExp: {
        type: Date
    },
    cart: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
});


userSchema.methods.addToCart = function (product) {
    // check product exists on cart
    const cartProductIndex = this.cart.findIndex(cartProduct => {
        return cartProduct.productId.toString() === product._id.toString();
    });
    // const updatedCart = [...this.cart];
    if (cartProductIndex === -1) {
        this.cart.push({
            productId: product._id,
            quantity: 1
        });
        // updatedCart.push({
        //     productId: product._id,
        //     quantity: 1
        // });
    } else {
        this.cart[cartProductIndex].quantity++;
        // updatedCart[cartProductIndex].quantity = this.cart[cartProductIndex].quantity + 1;
    }
    // const updatedCart = {
    //     items: updatedCartItems
    // };
    // this.cart = updatedCart;
    return this.save();
};

userSchema.methods.removeFromCart = function (productId) {
    this.cart = this.cart.filter(item => item.productId.toString() !== productId.toString());
    return this.save();
};

userSchema.methods.clearCart = function () {
    this.cart = [];
    return this.save();
};


module.exports = mongoose.model('User', userSchema);
const {CartItem} = require('../models');
const cartDataLayer = require('../dal/cart');

class CartServices{
    constructor(user_id) {
        this.user_id = user_id;
    }

    async addToCart(productId) {
        // check if the cart item already exists in the cart
        // i.e we are getting a cart item belonging to the user
        // and having a certain product id.
        const cartItem = await cartDataLayer
                        .getCartItemByUserAndProduct(this.user_id, productId)
        res.send(cartItem);
        // if the item does not exist, create
        // and save to the cart
        if (!cartItem) {
            let newCartItem = new CartItem();
            newCartItem.set('product_id', productId);
            newCartItem.set('user_id', this.user_id);
            newCartItem.set('quantity', 1);
            await newCartItem.save();
            return newCartItem;
        }
        else {
            // if it exists, take the existing cart item
            // and increases it quantity by 1
            cartItem.set('quantity', cartItem.get('quantity') + 1);
            await cartItem.save();
            return cartItem;
        }


    }
}

module.exports = CartServices;
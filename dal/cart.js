const {CartItem} = require('../models')

const getCartItemByUserAndProduct = async (userId, productId) => {
    const cartItem = await CartItem.collection().where({
            'user_id': userId,
            'product_id': productId
        }).fetch({
            require: false,
            withRelated:['product', 'product.category']
        })
    return cartItem;
}

module.exports = {
    getCartItemByUserAndProduct
}
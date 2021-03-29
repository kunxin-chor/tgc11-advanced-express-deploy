const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const CartServices = require('../services/CartServices')

router.get('/checkout', async(req,res)=>{

    // 1. create line items -- tell Stripe what the customer is paying for
    const cartService = new CartServices(req.session.user.id);
    let allCartItems = cartService.getAll();

    let lineItems = [];
    let meta = [];

    for (let cartItem of allCartItems) {
        const lineItem = {
            'name' : cartItem.related('product').get('name')
        }
    }

    // 2. using Stripe, create the payment

    // 3. register the payment

    // 4. send the payment session ID to a hbs file and use JavaScript to redirect
})

module.exports = router;
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
            'name' : cartItem.related('product').get('name'),
            'amount': cartItem.related('product').get('cost'),
            'quantity': cartItem.get('quantity'),
            'currency': 'SGD'
        }
        // check if the related product has an image
        if (cartItem.related('product').get('image_url')) {
            // if it does, add in to lineitem
            lineItem.images = [cartItem.related('product').get('image_url')]
        }
        lineItems.push(lineItem);
        // keep of track of for each product, what is quantity purchased
        meta.push({
            'product_id': cartItem.get('product_id'),
            'quantity': cartItem.get('quantity')
        })
    }

    // 2. using Stripe, create the payment
    let metaData = JSON.stringify(meta); // why Stringify? because later when we set the meta data, it must be a string
    const payment = {
        payment_method_types:['card'],
        line_items: lineItems,
        success_url: process.env.STRIPE_SUCCESS_URL + '?sessionId={CHECKOUT_SESSION_ID}',
        cancel_url: process.env.STRIPE_ERROR_URL,
        metadata: {
            'orders': metaData
        }
    }

    // 3. register the payment
    let stripeSession = await stripe.checkout.sessions.create(payment);
 

    // 4. send the payment session ID to a hbs file and use JavaScript to redirect
       res.render('checkout/checkout', {
        'sessionId': stripeSession.id,
        'publishableKey': process.env.STRIPE_PUBLISHABLE_KEY
    })
})

module.exports = router;
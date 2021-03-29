const express = require('express')
const router = express.Router();

const CartServices = require('../services/CartServices')

router.get('/', async(req,res)=>{
    let cartServices = new CartServices(req.session.user.id);
    const allItems = await cartServices.getAll();
    res.render('shoppingCart/index', {
        'allItems': allItems.toJSON()
    })
})

router.get('/:product_id/add', async(req,res)=>{
    let cartServices = new CartServices(req.session.user.id);
    await cartServices.addToCart(req.params.product_id);
    req.flash("success_messages", "The product has been added to your cart");
    res.redirect('back');
})

router.get('/:product_id/remove', async(req,res)=>{
    let cartServices = new CartServices(req.session.user.id);

    await cartServices.removeItem(req.params.product_id);
    req.flash("success_messages", "The item has been removed");
    res.redirect('back')
})

router.post('/:product_id/quantity/update', async(req,res)=>{
    let cartServices = new CartServices(req.session.user.id);
    await cartServices.updateQuantity(req.params.product_id, req.body.quantity);
    req.flash("success_messages", "The quantity has been updated");
    res.redirect('back')
})

module.exports = router;
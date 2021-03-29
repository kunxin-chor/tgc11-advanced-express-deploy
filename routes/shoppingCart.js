const express = express();
const router = express.Router();

const CartServices = require('../services/CartServices')

router.get('/:product_id/add', async(req,res)=>{
    let cartServices = new CartServices(req.session.user.id);
    await cartServices.addToCart(req.params.product_id);
    req.flash("success_messages", "The product has been added to your cart");
    res.redirect('back');

})

module.exports = router;
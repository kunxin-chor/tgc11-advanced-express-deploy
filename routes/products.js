// load in Router to setup the routes
const express = require('express');
const router = express.Router();

// import in the Product model
const {Product} = require('../models');
// const models = require('../models');
// to refer to the Product model later,
// we use `models.Product`

// import in the forms
const {createProductForm, bootstrapField} = require('../forms')

router.get('/', async (req,res)=>{

    // How we get the data previously using mysql2:
    //const query = "SELECT * FROM products";
    //const [products] = connection.execute(query)

    let products = await Product.collection().fetch();

    res.render('products/index', {
        'products': products.toJSON()
    })
})

router.get('/create', (req,res)=>{
    const productForm = createProductForm();
    res.render('products/create', {
        'form': productForm.toHTML(bootstrapField)
    })
});

module.exports = router;
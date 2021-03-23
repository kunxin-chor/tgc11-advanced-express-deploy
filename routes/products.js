// load in Router to setup the routes
const express = require('express');
const router = express.Router();

// import in the Product model
const { Product } = require('../models');
// const models = require('../models');
// to refer to the Product model later,
// we use `models.Product`

// import in the forms
const { createProductForm, bootstrapField } = require('../forms')

router.get('/', async (req, res) => {

    // How we get the data previously using mysql2:
    //const query = "SELECT * FROM products";
    //const [products] = connection.execute(query)

    let products = await Product.collection().fetch();

    res.render('products/index', {
        'products': products.toJSON()
    })
})

router.get('/create', (req, res) => {
    const productForm = createProductForm();
    res.render('products/create', {
        'form': productForm.toHTML(bootstrapField)
    })
});

router.post('/create', (req, res) => {
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            // use the Product model to save
            // a new instance of Product
            // (in other words, create a new row in the
            // products table)
            const newProduct = new Product();
            newProduct.set('name', form.data.name);
            newProduct.set('cost', form.data.cost);
            newProduct.set('description', form.data.description);
            await newProduct.save();
            res.redirect('/products')
        },
        'error': (form) => {
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/update', async (req, res) => {
    // 1. get the product that we want to update
    // i.e, select * from products where id = ${product_id}
    const productToEdit = await Product.where({
        'id': req.params.product_id
    }).fetch({
        required: true
    });


    // 2. send the product to the view
    const form = createProductForm();
    form.fields.name.value = productToEdit.get('name');
    form.fields.cost.value = productToEdit.get('cost');
    form.fields.description.value = productToEdit.get('description');

    res.render('products/update', {
        'form': form.toHTML(bootstrapField),
        'product': productToEdit.toJSON()
    })
})

router.post("/:product_id/update", async (req, res) => {
    // 1. get the product that we want to update
    // i.e, select * from products where id = ${product_id}
    const productToEdit = await Product.where({
        'id': req.params.product_id
    }).fetch({
        required: true
    });

    const productForm = createProductForm();

    productForm.handle(req, {
        'success':async(form) => {
            productToEdit.set(form.data);
            productToEdit.save();
            res.redirect('/products')
        },
        'error':async(form) =>{
            res.render('products/update',{
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/delete', async (req,res)=>{
    // 1. get the product that we want to delete
    // i.e, select * from products where id = ${product_id}
    const productToDelete = await Product.where({
        'id': req.params.product_id
    }).fetch({
        required: true
    });

    res.render('products/delete.hbs', {
        'product': productToDelete.toJSON()
    })
})

router.post('/:product_id/delete', async(req,res)=>{
    const productToDelete = await Product.where({
        'id': req.params.product_id
    }).fetch({
        required: true
    });

    // delete the product
    await productToDelete.destroy();
    res.redirect('/products');
})

module.exports = router;
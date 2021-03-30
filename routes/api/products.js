const express = require('express');
const router = express.Router();

const productDataLayer = require('../../dal/product.js')
const {Product} = require('../../models');
const {createProductForm} = require('../../forms')

router.get('/', async(req,res)=>{
    const allProducts = await productDataLayer.getAllProducts();
    res.send(allProducts);
})

router.post('/', async(req,res)=>{
    const allCategories = await productDataLayer.getAllCategories();
    const allTags = await productDataLayer.getAllTags();

    const productForm = createProductForm(allCategories, allTags);
    productForm.handle(req, {
        'success': async (form) => {
            let {tags, ...productData} = form.data;
            const product = new Product(productData);
            await product.save();

            // save the tags
            if (tags) {
                await product.tags().attach(tags.split(','))
            }
            res.send(product);
        },
        'error': (form) => {
            let errors = {};
            for (let key in form.fields) {
                if (form.fields[key].error) {
                    errors[key] = form.fields[key].error;
                }
            }
            res.send(JSON.stringify(errors));
        }
    })
})

module.exports = router;
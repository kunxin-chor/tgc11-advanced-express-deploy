// load in Router to setup the routes
const express = require('express');
const router = express.Router();

// import in the Product model
const { Product, Category, Tag } = require('../models');
// const models = require('../models');
// to refer to the Product model later,
// we use `models.Product`

// import in the forms
const { createProductForm, bootstrapField } = require('../forms')

router.get('/', async (req, res) => {

    // How we get the data previously using mysql2:
    //const query = "SELECT * FROM products";
    //const [products] = connection.execute(query)

    let products = await Product.collection().fetch({
        withRelated: ['category']
    });


    res.render('products/index', {
        'products': products.toJSON()
    })
})

router.get('/create', async (req, res) => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')])

    const productForm = createProductForm(allCategories, allTags);
    res.render('products/create', {
        'form': productForm.toHTML(bootstrapField)
    })
});

router.post('/create', (req, res) => {
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {

            let { tags, ...productData } = form.data;

            // use the Product model to save
            // a new instance of Product
            // (in other words, create a new row in the
            // products table)
            const newProduct = new Product();
            newProduct.set(productData);
            // newProduct.set('name', form.data.name);
            // newProduct.set('cost', form.data.cost);
            // newProduct.set('description', form.data.description);
            // newProduct.set('category_id', form.data.category_id);
            await newProduct.save();

            // check if any tags are selected
            if (tags) {
                await newProduct.tags().attach(tags.split(","))
            }
            // display a success message
            req.flash('success_messages', 'New product has been created successfully');
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
    // get all the possible categories
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')])

    // 1. get the product that we want to update
    // i.e, select * from products where id = ${product_id}
    const productToEdit = await Product.where({
        'id': req.params.product_id
    }).fetch({
        required: true,
        withRelated: ['tags']
    });

    const productJSON = productToEdit.toJSON();
    const selectedTagIds = productJSON.tags.map(t => t.id);

    // 2. send the product to the view


    const form = createProductForm(allCategories, allTags);
    form.fields.name.value = productToEdit.get('name');
    form.fields.cost.value = productToEdit.get('cost');
    form.fields.description.value = productToEdit.get('description');
    // assign the current category_id to the form
    form.fields.category_id.value = productToEdit.get('category_id');
    form.fields.tags.value = selectedTagIds;


    res.render('products/update', {
        'form': form.toHTML(bootstrapField),
        'product': productJSON
    })
})

router.post("/:product_id/update", async (req, res) => {
    // 1. get the product that we want to update
    // i.e, select * from products where id = ${product_id}
    const productToEdit = await Product.where({
        'id': req.params.product_id
    }).fetch({
        required: true,
        withRelated: ['tags']
    });

    const productJSON = productToEdit.toJSON();
    const existingTagsId = productJSON.tags.map(t => t.id);

    const productForm = createProductForm();

    productForm.handle(req, {
        'success': async (form) => {
            let { tags, ...productData } = form.data;
            productToEdit.set(productData);
            productToEdit.save();

            // get the array of the new tag ids
            let newTagsId = tags.split(",")

            // ultra-complex solution
            // // remove all the tags that don't belong to the product           
            // // i.e, find all the tags that WERE part of the product but not in the form            
            // let toRemove = existingTagsId.filter(id => 
            //     newTagsId.includes(id) === false);
            // await productToEdit.tags().detach(toRemove);

            // // add in all the tags selected in the form
            // // i.e select all the tags that are in the form but not added to the product yet
            // let toAdd = newTagsId.filter(id => existingTagsId.includes(id) === false);
            // await productToEdit.tags().attach(toAdd);

            // smart but not as efficient
            productToEdit.tags().detach(existingTagsId);
            productToEdit.tags().attach(newTagsId);

            res.redirect('/products')
        },
        'error': async (form) => {
            res.render('products/update', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:product_id/delete', async (req, res) => {
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

router.post('/:product_id/delete', async (req, res) => {
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
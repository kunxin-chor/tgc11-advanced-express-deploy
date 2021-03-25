// load in Router to setup the routes
const express = require('express');
const router = express.Router();

// import in the Product model
const { Product, Category, Tag } = require('../models');
// const models = require('../models');
// to refer to the Product model later,
// we use `models.Product`

// import in the forms
const { createProductForm, createProductSearchForm, bootstrapField } = require('../forms')

// import in the checkIfAuthenticated middleware
const { checkIfAuthenticated } = require('../middlewares')

router.get('/', async (req, res) => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });
    // manually add to the front of all categories an option of 0 (none selected)
    allCategories.unshift([0, '-------'])

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    const searchForm = createProductSearchForm(allCategories, allTags);

    // creating a base query (i.e, SELECT * FROM products)
    // aka a query builder
    let q = Product.collection();

    searchForm.handle(req, {
        'empty': async (form) => {
            // if the form is empty, we display all the possible products
            // fetch() will execute the query
            let products = await q.fetch({
                withRelated: ['category', 'tags']
            });

            res.render('products/index', {
                'products': products.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async (form) => {
            // if the form is empty, we display all the possible products
            // fetch() will execute the query
            let products = await q.fetch({
                withRelated: ['category', 'tags']
            });

            res.render('products/index', {
                'products': products.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'success': async (form) => {
            if (form.data.name) {
                // adding a WHERE name LIKE '%<name>%'
                q = q.where('name', 'like', '%' + form.data.name + '%')
            }

            if (form.data.category_id !== "0") {
                q = q.where('category_id', '=', form.data.category_id)
            }

            if (form.data.min_cost) {
                q = q.where('cost', '>=', form.data.min_cost)
            }

            if (form.data.max_cost) {
                q = q.where('cost', '<=', form.data.max_cost)
            }

            if (form.data.tags) {
                q = q.query('join', 'products_tags', 'products.id', 'product_id')
                    .where('tag_id', 'in', form.data.tags.split(','))
            }

            let products = await q.fetch({
                withRelated: ['category', 'tags']
            });



            res.render('products/index', {
                'products': products.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        }
    })


})

router.get('/create', async (req, res) => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')])

    const productForm = createProductForm(allCategories, allTags);
    res.render('products/create', {
        'form': productForm.toHTML(bootstrapField),
        'cloudinaryName': process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryPreset': process.env.CLOUDINARY_UPLOAD_PRESET
    })
});

router.post('/create', async (req, res) => {

    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')])

    // inject in all the categories and all the tags
    const productForm = createProductForm(allCategories, allTags);


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
            // ... add to flash messages -- which is stored in the session
            req.flash('success_messages', 'New product has been created successfully');
            res.redirect('/products')
        },
        'error': (form) => {

            req.flash('error_messages', 'Please correct all errors and try again')
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
    form.fields.image_url.value = productToEdit.get('image_url')


    res.render('products/update', {
        'form': form.toHTML(bootstrapField),
        'product': productJSON,
        'cloudinaryName': process.env.CLOUDINARY_NAME,
        'cloudinaryApiKey': process.env.CLOUDINARY_API_KEY,
        'cloudinaryPreset': process.env.CLOUDINARY_UPLOAD_PRESET
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
            req.flash('success_messages', "Product has been updated")
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
    req.flash('success_messages', 'Product has been deleted')
    res.redirect('/products');
})

module.exports = router;
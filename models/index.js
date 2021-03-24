const bookshelf = require('../bookshelf');

// Create a model for the Products table
// The first arugment is the name of the model
// The second arugment is a config object
const Product = bookshelf.model('Product',{
    tableName:'products',  // the Product model (JavaScript class) is using the `products` table
    // make sure the name of the function is the same as the FK
    // without the _id
    category() {
        // the first argument is the name of the model
        // that the current model is related to
        return this.belongsTo('Category')
    },
    tags() {
        return this.belongsToMany('Tag');
    }
});

const Category = bookshelf.model('Category',{
    tableName:'categories',
    // the name of the function must match the name of the model
    // involved in the relationship, but lowercase and in plural
    products() {
        return this.hasMany('Product');
    }
})

const Tag = bookshelf.model('Tag',{
    tableName:'tags',
    products() {
        return this.belongsToMany('Product')
    }
})

const User = bookshelf.model('User',{
    tableName:'users'
})

module.exports = {
    Product, Category, Tag, User
}
const bookshelf = require('../bookshelf');

// Create a model for the Products table
// The first arugment is the name of the model
// The second arugment is a config object
const Product = bookshelf.model('Product',{
    tableName:'products'  // the Product model (JavaScript class) is using the `products` table
});

module.exports = {
    Product
}
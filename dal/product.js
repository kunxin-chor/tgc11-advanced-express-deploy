
const { Category, Tag, Product } = require('../models');

const getAllCategories = async () => {
    const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')]
    });
    return allCategories;
}

const getAllTags = async() => {
        const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
        return allTags;
}

const getProductById = async (productId) => {
     const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated: ['tags']
    });
    return product;
}


module.exports = {
    getAllCategories,
    getAllTags,
    getProductById
}
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 50,
    },
    description: {
        type: String,
        required: true,
    },

    productId: {
        type: String,
        required: true,
        minLength: 4,
    },

    quantity: {
        type: Number,   
        required: true,
    },

    expiryDate: {
        type: String,
        required: true,
    },
    barcode: {
        type: Number,
        required: true,
    },

    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    
    manufacturer: {
        type: Schema.Types.ObjectId,
        ref: 'Manufacturer',
        required: true
    },
    
    imageUrl : {
        type: String,
        required : true,
    }

}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);

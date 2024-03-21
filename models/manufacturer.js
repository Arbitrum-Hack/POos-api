const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ManufacturerSchema = new Schema({
    name: {
        type: 'string',
        required: true,
        minLength: 5,
        maxLength: 50,
    },
    email: {
        type: 'string',
        required: true,
        unique: true,
    },
    password: {
        type: 'string',
        required: true,
        minLength: 5,
        maxLength: 1024,
    },
    industry: {
        type: 'string',
        required: true,
    },
    address: {
        type: 'string',
        required: true,
    },
    
    isEmailVerified: {
        type: 'boolean',
        default: false,
    },
    contractAddress: {
        type: 'string',
        required: false,
    },
    isFirstTimeLogin: {
        type: 'boolean',
        default: false,
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product',
    }],
    idNumber: {
        type: 'string',
        required: true,
    },
    
}, { timestamps: true });

module.exports = mongoose.model('Manufacturer', ManufacturerSchema);

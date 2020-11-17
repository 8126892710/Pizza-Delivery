const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const menu = new Schema({
    item: { type: String, required: 'Name is required.' },
    price: { type: String },
    status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active'
    },
    image: { type: String }
}, {
        timestamps: true, collection: 'menu'
    })
module.exports = mongoose.model('menu', menu)

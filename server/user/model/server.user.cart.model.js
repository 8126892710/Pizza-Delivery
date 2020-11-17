const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cart = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'menu' },
    status: {
        type: String,
        enum: ['pending', 'complete', 'decline'],
        default: 'pending'
    }
}, {
        timestamps: true, collection: 'cart'
    })
module.exports = mongoose.model('cart', cart)

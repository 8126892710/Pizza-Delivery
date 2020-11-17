const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { isEmail } = require('validator');

const user = new Schema({
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    name: { type: String, required: 'Name is required.' },
    email: {
        type: String,
        trim: true,
        unique: true,
        lowercase: true,
        required: 'Email is required.',
        validate: [isEmail, 'Invalid Email.']
    },
    otp: { type: Number },
    password: { type: String },
    status: {
        type: String,
        enum: ['active', 'deactive'],
        default: 'active'
    },
    address: { type: String, required: 'Address is required.' },
    token: { type: String }
}, {
        timestamps: true, collection: 'user'
    })
module.exports = mongoose.model('user', user)

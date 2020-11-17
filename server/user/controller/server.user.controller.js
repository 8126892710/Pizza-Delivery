const userModel = require('../model/server.user.model');
const itemModel = require('../model/server.user.menu.model');
const cartModel = require('../model/server.user.cart.model');
const response = require('../../../config/responder');
const config = require('../../../config/db');
const jwt = require('jsonwebtoken');
const helper = require('../../../config/helper');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');


/** Add user api. */
const createUser = async (req, res) => {
    if (!req.body.name || !req.body.email || !req.body.password || !req.body.address) {
        return response.sendResponse(res, 400, 'Please fill require fields.');
    }
    let bcPassword = await helper.bcryptPassword(req.body.password);
    req.body['password'] = bcPassword;
    req.body['otp'] = helper.generateOTP();
    userModel.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return response.sendResponse(res, 400, 'Email id already exist.');
        } else {
            userModel.create(req.body).then(data => {
                return response.sendResponse(res, 200, 'User created.');
            }).catch(error => {
                return response.sendResponse(res, 400, 'Something went wrong!', error)
            })
        }
    }).catch(error => {
        return response.sendResponse(res, 400, 'Something went wrong!', error)
    })
}
/** Login api for user. */
const login = (req, res) => {
    let query = {};
    if (!req.body.email || !req.body.password)
        return response.sendResponse(res, 400, 'Please fill require fields.')
    if (req.body.email)
        query['email'] = req.body.email
    userModel.findOne(query, async (err, data) => {
        if (err)
            return response.sendResponse(res, 400, 'Something went wrong!', err)
        else if (!data)
            return response.sendResponse(res, 404, 'User not found', {})
        else {
            let verifyPassword = await helper.bcryptVerify(req.body.password, data.password);
            if (verifyPassword == true) {
                jwt.sign({ id: data._id }, config.my_secret_key, (err, token) => {
                    if (err) return response.sendResponse(res, 400, 'Something went wrong!', err)
                    else {
                        userModel.findOneAndUpdate(query, { token: token }, { new: true }, (err, user) => {
                            if (err) return response.sendResponse(res, 400, 'Something went wrong!', err)
                            else
                                return response.sendResponse(res, 200, 'Success', user)
                        })
                    }
                })
            } else {
                return response.sendResponse(res, 400, 'Password not match.')
            }
        }
    })
}

/**Update user detail. */
const editUser = (req, res) => {
    userModel.findOneAndUpdate({ _id: req.user._id }, req.body, { new: true }, (err, user) => {
        if (err)
            return response.sendResponse(res, 400, 'Something went wrong!', err);
        else if (user == null)
            return response.sendResponse(res, 400, 'Wrong user id!', err);
        else
            return response.sendResponse(res, 200, 'Successfully updated.');
    })
}

/**Logout api. */
const logout = (req, res) => {
    userModel.findOneAndUpdate({ _id: req.user._id }, { token: "" }, { new: true }, (err, user) => {
        if (err)
            return response.sendResponse(res, 400, 'Something went wrong!', err);
        else
            return response.sendResponse(res, 200, 'Logout successfully');
    })
}
/**User detail api. */
const userDetail = (req, res) => {
    userModel.findOne({ _id: mongoose.Types.ObjectId(req.user._id) }).exec((error, data) => {
        if (error)
            return response.sendResponse(res, 400, 'Error to find user.');
        else if (!data)
            return response.sendResponse(res, 404, 'User not found.', data);
        else
            return response.sendResponse(res, 200, 'User Detail.', data);
    })
}
/**User detail api. */
const deleteUser = (req, res) => {
    userModel.remove({ _id: req.user._id }).exec((error, data) => {
        if (error)
            return response.sendResponse(res, 400, 'Error to find user.');
        else
            return response.sendResponse(res, 200, 'User Deleted.');
    })
}
/** Add menu item api. */
const addItem = async (req, res) => {
    if (!req.body.item || !req.body.price) {
        return response.sendResponse(res, 400, 'Please fill require fields.');
    }
    itemModel.create(req.body).then(data => {
        if (req.files.length > 0) {
            if (req.files[0].fieldname == 'image') {
                data['image'] = `/uploads/image/${req.files[0].fieldname}-` + data._id + path.extname(req.files[0].originalname);
                fs.rename(path.resolve('uploads', 'image', req.files[0].filename), path.resolve('uploads', 'image', 'image-' + data._id + path.extname(req.files[0].originalname)), (err) => {
                    if (err) console.log('ERROR: ' + err);
                });
            }
        }
        data.save({}, (err, data) => {
            if (err) {
                return response.sendResponse(res, 400, 'Error to save file name.');
            } else {
                return response.sendResponse(res, 200, 'Item created.');
            }
        })
    }).catch(error => {
        return response.sendResponse(res, 400, 'Something went wrong!', error)
    })
}
/**Menu item list api. */
const itemList = (req, res) => {
    let query = {};
    if (req.query.itemId)
        query['_id'] = mongoose.Types.ObjectId(req.query.itemId);
    itemModel.find(query).exec((error, data) => {
        if (error)
            return response.sendResponse(res, 400, 'Error to find item.');
        else if (data.length < 1)
            return response.sendResponse(res, 404, 'Item not found.', data);
        else
            return response.sendResponse(res, 200, 'Item Detail.', data);
    })
}
/**Add order api. */
const addOrder = async (req, res) => {
    if (!req.body.userId || !req.body.menuId) {
        return response.sendResponse(res, 400, 'Please fill require fields.');
    }
    cartModel.create(req.body).then(data => {
        return response.sendResponse(res, 200, 'Order created.');
    }).catch(error => {
        return response.sendResponse(res, 400, 'Something went wrong!', error)
    })
}
/**Order list api. */
const orderList = (req, res) => {
    if (!req.query.userId) {
        return response.sendResponse(res, 400, 'User id is required.');
    }
    let query = {};
    if (req.query.userId)
        query['userId'] = mongoose.Types.ObjectId(req.query.userId);
    if (req.query.status)
        query['status'] = req.query.status
    cartModel.find(query).populate({
        path: 'menuId',
        model: 'menu',
        select: 'item price status image'
    }).exec((error, data) => {
        if (error)
            return response.sendResponse(res, 400, 'Error to find item.');
        else if (data.length < 1)
            return response.sendResponse(res, 404, 'Item not found.', data);
        else
            return response.sendResponse(res, 200, 'Item Detail.', data);
    })
}
/**Order place api. */
const orderComplete = (req, res) => {
    cartModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(req.query.id) }, { status: "complete" }, { new: true }, (err, user) => {
        if (err)
            return response.sendResponse(res, 400, 'Something went wrong!', err);
        else if (user == null)
            return response.sendResponse(res, 400, 'Wrong user id!', err);
        else {
            userModel.findOne({ _id: user.userId }, (error, user) => {
                if (error) {
                    return response.sendResponse(res, 400, 'Something went wrong!', error);
                } else if (!user) {
                    return response.sendResponse(res, 404, 'User not found of this order');
                } else {
                    helper.sendReceipt(user.email, `An invoice from your friendly hackers`, `A fake invoice should be attached, it is just an empty text file after all`, (err, data) => {
                        if (err)
                            return response.sendResponse(res, 400, 'Error to send mail.', err);
                        else
                            return response.sendResponse(res, 200, 'Order successfuly placed.');
                    })
                }
            })
        }
    })
}
module.exports = {
    createUser, login, editUser, logout, userDetail, deleteUser, addItem, itemList, addOrder, orderList, orderComplete
}

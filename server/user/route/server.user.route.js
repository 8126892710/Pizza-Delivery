const app = require('express').Router();
const userCtrl = require('../controller/server.user.controller');
const helper = require('../../../config/helper');

app.post('/login', userCtrl.login);
app.get('/logout', helper.verifyJWT, userCtrl.logout);
app.post('/register', userCtrl.createUser);
app.post('/updateUser', helper.verifyJWT, userCtrl.editUser);
app.get('/userDetail', helper.verifyJWT, userCtrl.userDetail);
app.delete('/deleteUser', helper.verifyJWT, userCtrl.deleteUser);
app.post('/menu/addItem', helper.upload.any(), userCtrl.addItem);
app.get('/menu/itemList', userCtrl.itemList);
app.post('/menu/addItem', userCtrl.addItem);
app.post('/menu/addOrder', helper.verifyJWT, userCtrl.addOrder);
app.get('/menu/orderList', helper.verifyJWT, userCtrl.orderList);
app.get('/menu/orderComplete', userCtrl.orderComplete);

module.exports = app;

const userModel = require('../server/user/model/server.user.model');
const response = require('../config/responder');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");
const async = require("async");
const bcrypt = require('bcrypt');
const config = require('./db');
const multer = require('multer');
const path = require('path');
const Mailgun = require('mailgun-js');

//Your api key, from Mailgun’s Control Panel
var api_key = 'MAILGUN-API-KEY';

//Your domain, from the Mailgun Control Panel
var domain = 'whatever@sendbox123.mailgun.org';

//Your sending email address
var from_who = 'umesh.k231993@gmail.com';



/** verify user token api. */
const verifyJWT = (req, res, next) => {
    var token = req.headers["x-access-token"]
    if (!token)
        return response.sendResponse(res, 401, "Invalid token.");
    else {
        jwt.verify(token, config.my_secret_key, (err, decoded) => {
            if (err) {
                return response.sendResponse(res, 401, 'Invalid token', err)
            } else {
                userModel.findOne({ _id: decoded.id }).lean().exec(function (err, user) {
                    req.user = user;
                    if (user != null) {
                        if (token == user.token)
                            return next();
                        return response.sendResponse(res, 401, 'Invalid token.');
                    } else {
                        return response.sendResponse(res, 401, 'User does not exist.');
                    }
                })
            }
        });
    }
}
/**OTP generate function. */
function generateOTP() {
    var text = "";
    var possible = "0123456789";

    for (var i = 0; i < 6; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return JSON.parse(text);
}

//To Encrypt the password
async function bcryptPassword(password) {
    return new Promise(async (resolve, reject) => {
        try {
            let salt = await bcrypt.genSalt(10)
            let hash = await bcrypt.hash(password, salt)
            resolve(hash)
        }
        catch (e) {
            reject(e)
        }
    })

}

// To decrypt the password 
async function bcryptVerify(password, dbPassword) {
    return new Promise(async (resolve, reject) => {
        try {
            let result = await bcrypt.compare(password, dbPassword)
            resolve(result)
        }
        catch (e) {
            reject(e)
        }
    })
}
/**Upload menu item image. */
var upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname == 'image') {
                cb(null, path.resolve('uploads', 'image'));
            }
        },
        filename: function (req, file, cb) {
            if (file.fieldname == 'image')
                cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    })
})
/**Send order receipt to user email. */
function sendReceipt(email, subject, text, cb) {
    //Which file to send? I made an empty invoice.txt file in the root directory
    //We required the path module here..to find the full path to attach the file!
    var fp = path.join(__dirname, 'invoice.text');
    //Settings
    var mailgun = new Mailgun({ apiKey: api_key, domain: domain });
    var data = {
        from: from_who,
        to: email,
        subject: subject,
        text: text,
        attachment: fp
    };
    //Sending the email with attachment
    mailgun.messages().send(data, function (error, body) {
        if (error) {
            cb(error, null)
        }
        else {
            cb(null, body)
        }
    });
}
module.exports = {
    upload, verifyJWT, generateOTP, bcryptPassword, bcryptVerify, sendReceipt
}

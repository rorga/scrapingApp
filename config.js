// config.js
require('dotenv').config();

const CryptoJS = require('crypto-js');
const password = process.env.password;
const secretKey = process.env.secretKey;

// Cifrar la contraseña
const encryptedPassword = CryptoJS.AES.encrypt(password, secretKey).toString();

module.exports = encryptedPassword;
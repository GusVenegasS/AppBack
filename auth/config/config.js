'use strict'
//config.js
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') })
module.exports = {
    getSecret: function () {
        return process.env.JWT_SECRET;
    },
}   
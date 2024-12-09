'use strict'
require('dotenv').config(); // Cargar variables de entorno

//config.js
module.exports = {
    getDB: function () {
        return process.env.MONGO_URI
    },
    getPort: function () {
        return process.env.PORT;
    },
    getSecret: function () {
        return process.env.JWT_SECRET;
    },
}
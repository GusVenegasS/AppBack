const express = require('express');
const app = express();
const routes = require('./routes/userRoutes');
const cors = require('cors');

// Habilitar CORS
app.use(cors());
app.options('*', cors());

app.use(express.json());
app.use('/api', routes);  // Usar las rutas

module.exports = app;
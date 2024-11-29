const express = require('express');
const app = express();
const routes = require('./routes/userRoutes');
const cors = require('cors');

// Habilitar CORS
app.use(cors({
  origin: 'http://localhost:3000', // Dirección del frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  credentials: true, // Para cookies o autenticación basada en sesiones
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use('/api', routes);  // Usar las rutas

module.exports = app;
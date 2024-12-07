require('dotenv').config(); // Cargar variables de entorno
const http = require('http'); // Crear un servidor HTTP
const app = require('./app'); // Importar la app configurada
const mongoose = require('mongoose');

// Conexión a la base de datos
mongoose.connect(process.env.MONGO_URI, {
})
  .then(() => console.log('Conexión a MongoDB exitosa'))
  .catch(err => console.error('Error al conectar a MongoDB:', err));

// Crear el servidor HTTP
const server = http.createServer(app);

// Iniciar el servidor usando el puerto de las variables de entorno
const PORT = process.env.PORT || 5001; // Usa el puerto desde .env

server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
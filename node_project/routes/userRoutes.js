const express = require('express');
const { createStudents, login, getUserProfile, getPeriodos, actualizarTelefono,cambiarContrasena} = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Rutas
router.post('/students', authenticate, createStudents);
router.get('/user/profile', authenticate, getUserProfile);
router.patch('/telefono', authenticate, actualizarTelefono);
router.post('/cambiar-contrasena', cambiarContrasena);
router.get('/periodos', getPeriodos);
router.post('/login', login);

module.exports = router;

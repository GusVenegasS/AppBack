const express = require('express');
const { createStudents, login, getUserProfile, getPeriodos, actualizarTelefono,cambiarContrasena, updateProfilePhoto, changePassword} = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Rutas
router.post('/students', authenticate, createStudents);
router.get('/user/profile', authenticate, getUserProfile);
router.put('/profile-photo', authenticate, updateProfilePhoto);
router.patch('/telefono', authenticate, actualizarTelefono);
router.post('/olvidar-contrasena', cambiarContrasena);
router.patch('/cambiar-contrasena', authenticate, changePassword);
router.get('/periodos', getPeriodos);
router.post('/login', login);

module.exports = router;

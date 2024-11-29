const express = require('express');
const { createStudents, login, getUserProfile } = require('../controllers/userController');
const authenticate = require('../middlewares/authenticate');

const router = express.Router();

// Rutas
router.post('/students', authenticate, createStudents);
router.get('/user/profile', authenticate, getUserProfile);
router.post('/login', login);

module.exports = router;

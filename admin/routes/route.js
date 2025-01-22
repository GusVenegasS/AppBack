//route.js
var express = require('express');
var admin = require('../controllers/admin');
var token = require('../middlewares/authenticate')
var router = express.Router();

router.post('/crearPeriodo', token, admin.crearPeriodo);
router.get('/obtenerBrigadas', token, admin.obtenerBrigadas);
router.get('/usuarios', token, admin.obtenerUsuarios);
router.get('/verTarea', token, admin.obtenerTarea);
router.get('/verificarPeriodo', token, admin.verificarPeriodo);
router.get('/reporteAsistencia', token, admin.reporteAsistencias);
router.put('/finalizarPeriodo', token, admin.finalizarPeriodo);

module.exports = router;
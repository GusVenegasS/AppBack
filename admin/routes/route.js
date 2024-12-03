//route.js
var express = require('express');
var admin = require('../controllers/admin');
var token = require('../../node_project/middlewares/authenticate')
var router = express.Router();

router.post('/crearPeriodo', admin.crearPeriodo);
router.get('/obtenerBrigadas', admin.obtenerBrigadas);
router.get('/usuarios', admin.obtenerUsuarios);
router.get('/verTarea', admin.obtenerTarea);
router.get('/verificarPeriodo', admin.verificarPeriodo);
router.get('/reporteAsistencia', admin.reporteAsistencias);
router.put('/finalizarPeriodo', admin.finalizarPeriodo);

module.exports = router;
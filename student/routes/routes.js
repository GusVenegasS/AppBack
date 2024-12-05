var express = require('express');
var studentController = require('../controllers/student')
var token = require('../../node_project/middlewares/authenticate')
var router = express.Router();
// Ruta para obtener brigadas por periodo académico
router.get('/brigadas', token, studentController.getBrigadas);

router.get('/brigadas/disponibles', token, studentController.getBrigadasDisponibles);

// Ruta para seleccionar brigadas
router.post('/brigadas/seleccionar', token,studentController.selectBrigadas);

//ruta para ver las brigadas a la sque pertenece un usuario
router.get('/usuarios/:usuario_id/brigadas/:periodoAcademico',token, studentController.getUsuariosBrigadas);

// Ruta para obtener los estudiantes de una brigada específica
router.get('/brigada/estudiantes', token,studentController.getBrigadaEstudiantes);

// Ruta para completar una tarea
router.post('/tareas/completar',token, studentController.completarTarea);

// Ruta para obtener las tareas de las brigadas del usuario en el periodo académico indicado
router.get('/tareas/brigada', token,studentController.getTareasPorBrigada);

//ruta para ver una tarea completada
router.get('/tareas/completada/:tarea_id',token, studentController.getTareaCompletada);

module.exports = router;
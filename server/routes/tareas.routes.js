const express = require('express');
const router = express.Router();
const tareasController = require('../controllers/tareas.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');
const validarRequest = require('../middlewares/validation.middleware');
const { tareaValidators } = require('../utils/validators');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Crear una tarea (director y maestro)
router.post('/', verificarRol('director', 'maestro'), tareaValidators.create, validarRequest, tareasController.crearTarea);

// Registrar entregas de una tarea (director y maestro)
router.post('/entregas', verificarRol('director', 'maestro'), tareasController.registrarEntregas);

// Obtener tareas de un grupo
router.get('/', tareasController.obtenerTareasPorGrupo);

// Obtener entregas de una tarea específica
router.get('/:tarea_id/entregas', tareasController.obtenerEntregasTarea);

// Obtener resumen de un alumno
router.get('/resumen', tareasController.obtenerResumenAlumno);

module.exports = router;

const express = require('express');
const router = express.Router();
const asistenciasController = require('../controllers/asistencias.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');
const validarRequest = require('../middlewares/validation.middleware');
const { asistenciaValidators } = require('../utils/validators');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Registrar asistencias del día (director y maestro)
router.post('/', verificarRol('director', 'maestro'), asistenciaValidators.create, validarRequest, asistenciasController.registrarAsistencias);

// Obtener asistencias por fecha
router.get('/', asistenciasController.obtenerAsistenciasPorFecha);

// Obtener resumen de un alumno
router.get('/resumen', asistenciasController.obtenerResumenAlumno);

module.exports = router;

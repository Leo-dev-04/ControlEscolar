const express = require('express');
const router = express.Router();
const conductaController = require('../controllers/conducta.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');
const validarRequest = require('../middlewares/validation.middleware');
const { conductaValidators } = require('../utils/validators');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Registrar conductas del día (director y maestro)
router.post('/', verificarRol('director', 'maestro'), conductaValidators.create, validarRequest, conductaController.registrarConductas);

// Obtener conductas por fecha
router.get('/', conductaController.obtenerConductasPorFecha);

// Obtener resumen de un alumno
router.get('/resumen', conductaController.obtenerResumenAlumno);

// Obtener resumen del día
router.get('/resumen-dia', conductaController.obtenerResumenDia);

module.exports = router;

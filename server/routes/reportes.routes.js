const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');
const validarRequest = require('../middlewares/validation.middleware');
const { reporteValidators, commonValidators } = require('../utils/validators');

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get('/', reportesController.getAll);
// IMPORTANTE: rutas específicas ANTES de rutas con parámetro genérico /:id
router.get('/alumno/:alumnoId', reportesController.getByAlumno);
router.get('/:id', commonValidators.id, validarRequest, reportesController.getById);
router.post('/generar', verificarRol('director', 'maestro'), reporteValidators.generar, validarRequest, reportesController.generarReportes);
router.delete('/:id', verificarRol('director'), commonValidators.id, validarRequest, reportesController.delete);

module.exports = router;

const express = require('express');
const router = express.Router();
const gruposController = require('../controllers/grupos.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');
const validarRequest = require('../middlewares/validation.middleware');
const { grupoValidators, commonValidators } = require('../utils/validators');

// Todas las rutas requieren autenticación
router.use(verificarToken);

router.get('/', gruposController.obtenerTodos);
router.get('/:id', commonValidators.id, validarRequest, gruposController.obtenerPorId);
router.post('/', verificarRol('director'), grupoValidators.create, validarRequest, gruposController.crear);
router.put('/:id', verificarRol('director'), commonValidators.id, validarRequest, gruposController.actualizar);
router.delete('/:id', verificarRol('director'), commonValidators.id, validarRequest, gruposController.eliminar);

module.exports = router;

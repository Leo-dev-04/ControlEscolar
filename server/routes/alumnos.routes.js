const express = require('express');
const router = express.Router();
const alumnosController = require('../controllers/alumnos.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');
const validarRequest = require('../middlewares/validation.middleware');
const { alumnoValidators, commonValidators } = require('../utils/validators');

// Todas las rutas requieren autenticación

// GET /api/alumnos - Obtener todos los alumnos con paginación
router.get(
    '/',
    verificarToken,
    commonValidators.pagination,
    validarRequest,
    alumnosController.getAll
);

// GET /api/alumnos/grupo/:grupoId - Obtener alumnos por grupo
router.get(
    '/grupo/:grupoId',
    verificarToken,
    commonValidators.id,
    commonValidators.pagination,
    validarRequest,
    alumnosController.getByGrupo
);

// GET /api/alumnos/:id - Obtener alumno por ID
router.get(
    '/:id',
    verificarToken,
    commonValidators.id,
    validarRequest,
    alumnosController.getById
);

// POST /api/alumnos - Crear nuevo alumno (director y maestro)
router.post(
    '/',
    verificarToken,
    verificarRol('director', 'maestro'),
    alumnoValidators.create,
    validarRequest,
    alumnosController.create
);

// PUT /api/alumnos/:id - Actualizar alumno (director y maestro)
router.put(
    '/:id',
    verificarToken,
    verificarRol('director', 'maestro'),
    alumnoValidators.update,
    validarRequest,
    alumnosController.update
);

// DELETE /api/alumnos/:id - Eliminar alumno (solo director)
router.delete(
    '/:id',
    verificarToken,
    verificarRol('director'),
    commonValidators.id,
    validarRequest,
    alumnosController.delete
);

// PUT /api/alumnos/:id/regenerar-qr - Regenerar QR token (solo director)
router.put(
    '/:id/regenerar-qr',
    verificarToken,
    verificarRol('director'),
    alumnosController.regenerateQr
);

module.exports = router;

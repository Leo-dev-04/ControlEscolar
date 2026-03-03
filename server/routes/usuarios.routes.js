const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Rutas de gestión de usuarios (Solo Director)
router.get('/', verificarRol('director'), usuariosController.getAll);
router.get('/:id', verificarRol('director'), usuariosController.getById);
router.post('/', verificarRol('director'), usuariosController.create);
router.put('/:id', verificarRol('director'), usuariosController.update);
router.delete('/:id', verificarRol('director'), usuariosController.delete);

// Rutas de asignación de grupos
router.put('/:id/grupos', verificarRol('director'), usuariosController.assignGroups);
router.get('/:id/grupos', verificarRol('director'), usuariosController.getAssignedGroups);

module.exports = router;

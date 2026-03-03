const express = require('express');
const router = express.Router();
const rezagoController = require('../controllers/rezago.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

// Solo directores pueden ver el rezago
router.use(verificarToken);
router.get('/', verificarRol('director'), rezagoController.getResumen);

module.exports = router;

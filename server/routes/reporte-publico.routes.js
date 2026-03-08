const express = require('express');
const router = express.Router();
const reportePublicoController = require('../controllers/reporte-publico.controller');

// Ruta PÚBLICA - No requiere autenticación
// GET /api/reporte/:qr_token
router.get('/:qr_token', reportePublicoController.getByToken);

module.exports = router;

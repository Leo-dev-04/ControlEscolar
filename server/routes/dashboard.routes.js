const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.use(verificarToken);
router.get('/', dashboardController.getResumen);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validarRequest = require('../middlewares/validation.middleware');
const { usuarioValidators } = require('../utils/validators');
const { loginLimiter } = require('../middlewares/rateLimiter.middleware');
const { verificarToken } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/auth/login
 * @desc    Autenticar usuario y obtener token
 * @access  Public
 */
router.post(
    '/login',
    loginLimiter,
    usuarioValidators.login,
    validarRequest,
    authController.login
);


/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario actual
 * @access  Private
 */
router.get(
    '/me',
    verificarToken,
    authController.me
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Cambiar contraseña del usuario actual
 * @access  Private
 */
router.post(
    '/change-password',
    verificarToken,
    authController.changePassword
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar token JWT
 * @access  Private
 */
router.post(
    '/refresh',
    verificarToken,
    authController.refresh
);

module.exports = router;

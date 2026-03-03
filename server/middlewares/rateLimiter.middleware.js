const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');
const { RATE_LIMIT } = require('../config/constants');

/**
 * Rate limiter general para todas las rutas de la API
 */
const generalLimiter = rateLimit({
    windowMs: RATE_LIMIT.WINDOW_MS,
    max: RATE_LIMIT.MAX_REQUESTS,
    message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Rate limit excedido para IP: ${req.ip} en ruta: ${req.path}`);
        res.status(429).json({
            success: false,
            message: 'Demasiadas solicitudes, por favor intenta de nuevo más tarde'
        });
    }
});

/**
 * Rate limiter estricto para login
 * Previene ataques de fuerza bruta
 */
const loginLimiter = rateLimit({
    windowMs: RATE_LIMIT.LOGIN.WINDOW_MS,
    max: RATE_LIMIT.LOGIN.MAX_ATTEMPTS,
    message: {
        success: false,
        message: 'Demasiados intentos de inicio de sesión, por favor intenta de nuevo en 15 minutos'
    },
    skipSuccessfulRequests: true, // No contar intentos exitosos
    handler: (req, res) => {
        logger.warn(`Rate limit de login excedido para IP: ${req.ip}, email: ${req.body.email}`);
        res.status(429).json({
            success: false,
            message: 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos'
        });
    }
});

/**
 * Rate limiter para envío de emails
 * Previene spam y abuso de recursos
 */
const emailLimiter = rateLimit({
    windowMs: RATE_LIMIT.EMAIL.WINDOW_MS,
    max: RATE_LIMIT.EMAIL.MAX_SENDS,
    message: {
        success: false,
        message: 'Límite de envío de correos alcanzado. Por favor intenta de nuevo en una hora'
    },
    handler: (req, res) => {
        logger.warn(`Rate limit de email excedido para usuario: ${req.usuario?.email || 'desconocido'}`);
        res.status(429).json({
            success: false,
            message: 'Límite de envío de correos alcanzado. Por favor intenta de nuevo en una hora'
        });
    }
});

/**
 * Rate limiter flexible - configuración personalizable
 */
function createCustomLimiter(windowMs, maxRequests, message) {
    return rateLimit({
        windowMs,
        max: maxRequests,
        message: {
            success: false,
            message: message || 'Demasiadas solicitudes'
        },
        handler: (req, res) => {
            logger.warn(`Rate limit custom excedido: ${req.path}, IP: ${req.ip}`);
            res.status(429).json({
                success: false,
                message: message || 'Demasiadas solicitudes'
            });
        }
    });
}

module.exports = {
    generalLimiter,
    loginLimiter,
    emailLimiter,
    createCustomLimiter
};

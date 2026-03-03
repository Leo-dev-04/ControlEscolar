const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const { USER_ROLES } = require('../config/constants');

/**
 * Middleware para verificar JWT token
 */
function verificarToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            logger.warn('Intento de acceso sin token');
            return ApiResponse.unauthorized(res, 'Token no proporcionado');
        }

        // Formato: "Bearer TOKEN"
        const token = authHeader.split(' ')[1];

        if (!token) {
            logger.warn('Formato de token inválido');
            return ApiResponse.unauthorized(res, 'Formato de token inválido');
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adjuntar información del usuario al request
        req.usuario = {
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol,
            nombre: decoded.nombre
        };

        logger.debug(`Usuario autenticado: ${decoded.email}`);
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            logger.warn('Token expirado');
            return ApiResponse.unauthorized(res, 'Token expirado');
        }

        if (error.name === 'JsonWebTokenError') {
            logger.warn('Token inválido');
            return ApiResponse.unauthorized(res, 'Token inválido');
        }

        logger.error('Error verificando token:', error);
        return ApiResponse.error(res, 'Error de autenticación', 500);
    }
}

/**
 * Middleware para verificar roles del usuario
 * @param {...string} rolesPermitidos - Roles que pueden acceder
 */
function verificarRol(...rolesPermitidos) {
    return (req, res, next) => {
        try {
            if (!req.usuario) {
                logger.warn('verificarRol llamado sin usuario autenticado');
                return ApiResponse.unauthorized(res, 'No autorizado');
            }

            const rolUsuario = req.usuario.rol;

            if (!rolesPermitidos.includes(rolUsuario)) {
                logger.warn(`Usuario ${req.usuario.email} con rol ${rolUsuario} intentó acceder a recurso restringido a ${rolesPermitidos.join(', ')}`);
                return ApiResponse.forbidden(res, 'No tienes permisos para realizar esta acción');
            }

            next();
        } catch (error) {
            logger.error('Error verificando rol:', error);
            return ApiResponse.error(res, 'Error de autorización', 500);
        }
    };
}

/**
 * Middleware opcional - verifica token si existe pero no lo requiere
 */
function verificarTokenOpcional(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.usuario = {
            id: decoded.id,
            email: decoded.email,
            rol: decoded.rol,
            nombre: decoded.nombre
        };

        next();

    } catch (error) {
        // Si el token es inválido, simplemente continuar sin usuario
        next();
    }
}

module.exports = {
    verificarToken,
    verificarRol,
    verificarTokenOpcional
};

const UsuarioService = require('../services/usuarios.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Login de usuario
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const resultado = await UsuarioService.autenticar(email, password);

        if (!resultado.success) {
            return ApiResponse.unauthorized(res, resultado.message);
        }

        return ApiResponse.success(
            res,
            {
                token: resultado.token,
                usuario: resultado.usuario
            },
            'Login exitoso',
            200
        );

    } catch (error) {
        logger.error('Error en login:', error);
        return ApiResponse.error(res, 'Error en el proceso de autenticación', 500);
    }
};

/**
 * Registrar nuevo usuario (solo admin)
 */
exports.register = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        const resultado = await UsuarioService.crear({
            nombre,
            email,
            password,
            rol
        });

        if (!resultado.success) {
            return ApiResponse.error(res, resultado.message, 400);
        }

        return ApiResponse.success(
            res,
            { id: resultado.id },
            'Usuario creado exitosamente',
            201
        );

    } catch (error) {
        logger.error('Error en registro:', error);
        return ApiResponse.error(res, 'Error creando usuario', 500);
    }
};

/**
 * Obtener información del usuario actual
 */
exports.me = async (req, res) => {
    try {
        const userId = req.usuario.id;

        const usuario = await UsuarioService.obtenerPorId(userId);

        if (!usuario) {
            return ApiResponse.notFound(res, 'Usuario no encontrado');
        }

        return ApiResponse.success(res, usuario, 'Información de usuario');

    } catch (error) {
        logger.error('Error obteniendo perfil:', error);
        return ApiResponse.error(res, 'Error obteniendo información del usuario', 500);
    }
};

/**
 * Cambiar contraseña
 */
exports.changePassword = async (req, res) => {
    try {
        const userId = req.usuario.id;
        const { passwordAntigua, passwordNueva } = req.body;

        const resultado = await UsuarioService.actualizarPassword(
            userId,
            passwordAntigua,
            passwordNueva
        );

        if (!resultado.success) {
            return ApiResponse.error(res, resultado.message, 400);
        }

        return ApiResponse.success(res, null, 'Contraseña actualizada exitosamente');

    } catch (error) {
        logger.error('Error cambiando contraseña:', error);
        return ApiResponse.error(res, 'Error actualizando contraseña', 500);
    }
};

/**
 * Refrescar token
 */
exports.refresh = async (req, res) => {
    try {
        // El usuario ya está en req.usuario gracias al middleware
        const usuario = await UsuarioService.obtenerPorId(req.usuario.id);

        if (!usuario || !usuario.activo) {
            return ApiResponse.unauthorized(res, 'Usuario no válido');
        }

        // Generar nuevo token
        const jwt = require('jsonwebtoken');
        const { JWT } = require('../config/constants');

        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol,
                nombre: usuario.nombre
            },
            process.env.JWT_SECRET,
            { expiresIn: JWT.EXPIRES_IN }
        );

        return ApiResponse.success(
            res,
            { token, usuario },
            'Token actualizado'
        );

    } catch (error) {
        logger.error('Error refrescando token:', error);
        return ApiResponse.error(res, 'Error actualizando token', 500);
    }
};

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Middleware para procesar resultados de validación de express-validator
 * Debe usarse después de los validadores
 */
function validarRequest(req, res, next) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const erroresFormateados = errors.array().map(error => ({
            campo: error.path || error.param,
            mensaje: error.msg,
            valor: error.value
        }));

        logger.warn('Error de validación:', {
            path: req.path,
            method: req.method,
            errores: erroresFormateados,
            body: req.body
        });

        return ApiResponse.validationError(res, erroresFormateados);
    }

    next();
}

module.exports = validarRequest;

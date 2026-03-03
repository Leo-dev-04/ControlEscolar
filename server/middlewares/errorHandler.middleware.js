const logger = require('../utils/logger');

/**
 * Middleware global para manejo de errores
 * Debe ser el último middleware en server.js
 */
function errorHandler(err, req, res, next) {
    // Log completo del error
    logger.error('Error no manejado:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,
        usuario: req.usuario?.email || 'No autenticado',
        timestamp: new Date().toISOString()
    });

    // Determinar código de estado
    const statusCode = err.statusCode || err.status || 500;

    // En producción, ocultar detalles internos
    const esProduccion = process.env.NODE_ENV === 'production';

    const respuesta = {
        success: false,
        message: esProduccion
            ? 'Error interno del servidor'
            : err.message || 'Error interno del servidor'
    };

    // En desarrollo, incluir stack trace
    if (!esProduccion && err.stack) {
        respuesta.stack = err.stack;
    }

    // Si hay errores de validación específicos
    if (err.errors) {
        respuesta.errors = err.errors;
    }

    res.status(statusCode).json(respuesta);
}

/**
 * Middleware para rutas no encontradas
 */
function notFoundHandler(req, res, next) {
    logger.warn(`Ruta no encontrada: ${req.method} ${req.path}`);

    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.path}`
    });
}

/**
 * Wrapper para async/await en rutas
 * Captura errores de funciones async y los pasa al errorHandler
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};

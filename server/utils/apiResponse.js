/**
 * Clase para estandarizar respuestas de la API
 */
class ApiResponse {
    /**
     * Respuesta exitosa
     * @param {Object} res - Objeto response de Express
     * @param {*} data - Datos a retornar
     * @param {String} message - Mensaje opcional
     * @param {Number} statusCode - Código HTTP (default: 200)
     */
    static success(res, data = null, message = 'Operación exitosa', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    /**
     * Respuesta con paginación
     * @param {Object} res - Objeto response de Express
     * @param {Array} data - Datos paginados
     * @param {Object} pagination - Info de paginación
     * @param {String} message - Mensaje opcional
     */
    static paginated(res, data, pagination, message = 'Datos obtenidos correctamente') {
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: pagination.total,
                totalPages: pagination.totalPages
            }
        });
    }

    /**
     * Respuesta de error
     * @param {Object} res - Objeto response de Express
     * @param {String} message - Mensaje de error
     * @param {Number} statusCode - Código HTTP (default: 500)
     * @param {*} errors - Errores específicos (opcional)
     */
    static error(res, message, statusCode = 500, errors = null) {
        const response = {
            success: false,
            message
        };

        if (errors) {
            response.errors = errors;
        }

        return res.status(statusCode).json(response);
    }

    /**
     * Respuesta de validación fallida
     * @param {Object} res - Objeto response de Express
     * @param {Array} errors - Array de errores de validación
     */
    static validationError(res, errors) {
        return res.status(400).json({
            success: false,
            message: 'Error de validación',
            errors
        });
    }

    /**
     * Respuesta de no autorizado
     * @param {Object} res - Objeto response de Express
     * @param {String} message - Mensaje de error
     */
    static unauthorized(res, message = 'No autorizado') {
        return res.status(401).json({
            success: false,
            message
        });
    }

    /**
     * Respuesta de prohibido
     * @param {Object} res - Objeto response de Express
     * @param {String} message - Mensaje de error
     */
    static forbidden(res, message = 'Acceso denegado') {
        return res.status(403).json({
            success: false,
            message
        });
    }

    /**
     * Respuesta de no encontrado
     * @param {Object} res - Objeto response de Express
     * @param {String} message - Mensaje de error
     */
    static notFound(res, message = 'Recurso no encontrado') {
        return res.status(404).json({
            success: false,
            message
        });
    }
}

module.exports = ApiResponse;

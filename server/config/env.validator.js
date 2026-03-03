const logger = require('../utils/logger');

/**
 * Valida que todas las variables de entorno requeridas estén presentes
 * y tengan el formato correcto
 */
function validarVariablesEntorno() {
    const requeridas = [
        'DB_HOST',
        'DB_USER',
        'DB_NAME',
        'JWT_SECRET'
    ];

    // DB_PASSWORD puede estar vacío (común en XAMPP), pero debe existir
    if (process.env.DB_PASSWORD === undefined) {
        const error = 'Variable de entorno DB_PASSWORD no está definida (puede estar vacía pero debe existir)';
        logger.error(error);
        throw new Error(error);
    }

    const faltantes = requeridas.filter(key => !process.env[key]);

    if (faltantes.length > 0) {
        const error = `Variables de entorno faltantes: ${faltantes.join(', ')}`;
        logger.error(error);
        throw new Error(error);
    }

    // Validar longitud mínima de JWT_SECRET
    if (process.env.JWT_SECRET.length < 32) {
        const error = 'JWT_SECRET debe tener al menos 32 caracteres para ser seguro';
        logger.error(error);
        throw new Error(error);
    }

    // Validar formato de puerto si existe
    if (process.env.PORT && isNaN(parseInt(process.env.PORT))) {
        const error = 'PORT debe ser un número válido';
        logger.error(error);
        throw new Error(error);
    }

    // Validar configuración SMTP si el envío automático está habilitado
    if (process.env.AUTO_SEND_ENABLED === 'true') {
        const smtpRequeridas = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'];
        const smtpFaltantes = smtpRequeridas.filter(key => !process.env[key]);

        if (smtpFaltantes.length > 0) {
            logger.warn(`AUTO_SEND_ENABLED está activado pero faltan: ${smtpFaltantes.join(', ')}`);
        }
    }

    logger.info('✅ Variables de entorno validadas correctamente');
}

module.exports = validarVariablesEntorno;

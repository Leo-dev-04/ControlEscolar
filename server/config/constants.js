/**
 * Constantes de la aplicación
 * Centraliza todos los valores mágicos y configuraciones
 */

module.exports = {
    // Paginación
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 20,
        MAX_LIMIT: 100
    },

    // Email
    EMAIL: {
        DELAY_BETWEEN_SENDS_MS: parseInt(process.env.EMAIL_DELAY_MS) || 1000,
        BATCH_SIZE: 10
    },

    // Rate Limiting
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutos
        MAX_REQUESTS: 100,

        LOGIN: {
            WINDOW_MS: 15 * 60 * 1000, // 15 minutos
            MAX_ATTEMPTS: 5
        },

        EMAIL: {
            WINDOW_MS: 60 * 60 * 1000, // 1 hora
            MAX_SENDS: 10
        }
    },

    // JWT
    JWT: {
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
        REFRESH_EXPIRES_IN: '7d'
    },

    // Cron
    CRON: {
        REPORTES_SEMANALES: process.env.CRON_REPORTE || '0 18 * * 5' // Viernes 6pm
    },

    // Códigos de estado HTTP
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_ERROR: 500
    },

    // Roles de usuario
    USER_ROLES: {
        MAESTRO: 'maestro',
        DIRECTOR: 'director'
    },

    // Colores de conducta
    CONDUCTA_COLORES: {
        VERDE: 'verde',
        AMARILLO: 'amarillo',
        ROJO: 'rojo'
    },

    // Bcrypt
    BCRYPT_ROUNDS: 10
};

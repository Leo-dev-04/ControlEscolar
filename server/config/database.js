const mysql = require('mysql2');
require('dotenv').config();
const logger = require('../utils/logger');

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Promisify para usar async/await
const promisePool = pool.promise();

// Verificar conexión y forzar UTF-8
pool.getConnection((err, connection) => {
  if (err) {
    logger.error('❌ Error conectando a la base de datos:', {
      message: err.message,
      code: err.code,
      errno: err.errno
    });

    if (err.code === 'ECONNREFUSED') {
      logger.error('MySQL no está corriendo. Por favor inicia el servidor MySQL.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      logger.error('Credenciales de base de datos incorrectas. Verifica DB_USER y DB_PASSWORD.');
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      logger.error(`Base de datos '${process.env.DB_NAME}' no existe. Por favor créala primero.`);
    }

    return;
  }

  // Establecer charset UTF-8 para esta sesión
  connection.query('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci', (setErr) => {
    if (setErr) logger.warn('No se pudo establecer charset UTF-8:', setErr.message);
    else logger.info('🔤 Charset UTF-8 configurado correctamente');
    logger.info('✅ Conexión a MySQL establecida correctamente');
    logger.info(`📊 Base de datos: ${process.env.DB_NAME}`);
    connection.release();
  });
});


// Manejar errores del pool
pool.on('error', (err) => {
  logger.error('Error inesperado en pool de MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    logger.error('Conexión a MySQL perdida. Reconectando...');
  } else {
    throw err;
  }
});

module.exports = promisePool;


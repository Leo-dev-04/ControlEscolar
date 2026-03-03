const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Validar variables de entorno al inicio
const validarVariablesEntorno = require('./config/env.validator');
try {
  validarVariablesEntorno();
} catch (error) {
  console.error('❌ Error fatal:', error.message);
  process.exit(1);
}

// Importar logger DESPUÉS de validar env
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler.middleware');
const { generalLimiter } = require('./middlewares/rateLimiter.middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - restrictivo
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Middlewares de parsing - usando Express nativo (body-parser eliminado)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting general
app.use('/api/', generalLimiter);

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const alumnosRoutes = require('./routes/alumnos.routes');
const gruposRoutes = require('./routes/grupos.routes');
const asistenciasRoutes = require('./routes/asistencias.routes');
const tareasRoutes = require('./routes/tareas.routes');
const conductaRoutes = require('./routes/conducta.routes');
const reportesRoutes = require('./routes/reportes.routes');
const rezagoRoutes = require('./routes/rezago.routes');

// Usar rutas
app.use('/api/auth', authRoutes); // Autenticación (público)
app.use('/api/usuarios', usuariosRoutes); // Requiere autenticación
app.use('/api/alumnos', alumnosRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/asistencias', asistenciasRoutes);
app.use('/api/tareas', tareasRoutes);
app.use('/api/conducta', conductaRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/rezago', rezagoRoutes);

// Ruta de prueba - pública
app.get('/', (req, res) => {
  res.json({
    message: 'API Sistema Control Escolar Primaria',
    version: '2.0.0',
    security: 'JWT Authentication enabled',
    docs: '/api-docs' // Para cuando implementemos Swagger
  });
});

// Health check - público
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test database connection - público (pero no expone credenciales)
app.get('/api/test-db', async (req, res) => {
  try {
    const db = require('./config/database');
    const [rows] = await db.query('SELECT COUNT(*) as total FROM alumnos WHERE activo = TRUE');
    res.json({
      success: true,
      message: 'Conexión a base de datos exitosa',
      total_alumnos: rows[0].total
    });
  } catch (error) {
    logger.error('Error en test-db:', error);
    res.status(500).json({
      success: false,
      error: 'Error de conexión a base de datos'
    });
  }
});

// Manejo de rutas no encontradas (404)
app.use(notFoundHandler);

// Middleware de manejo de errores (DEBE ser el último)
app.use(errorHandler);

// Iniciar cron job para envío automático
if (process.env.AUTO_SEND_ENABLED === 'true') {
  try {
    const { iniciarCronJob } = require('./cron/envio-automatico');
    iniciarCronJob();
    logger.info('✅ Cron job de reportes iniciado');
  } catch (error) {
    logger.error('❌ Error iniciando cron job:', error);
  }
} else {
  logger.info('⏸️  Envío automático deshabilitado (AUTO_SEND_ENABLED=false)');
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Dar tiempo al logger para escribir y luego salir
  setTimeout(() => process.exit(1), 1000);
});

// Iniciar servidor
app.listen(PORT, () => {
  logger.info('════════════════════════════════════════════════');
  logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔒 Autenticación: JWT habilitada`);
  logger.info(`🌐 CORS: ${corsOptions.origin}`);
  logger.info('════════════════════════════════════════════════');
});

module.exports = app; // Para testing

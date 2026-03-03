const cron = require('node-cron');
const { generarYEnviarReportesSemanales, obtenerFechasSemanaActual } = require('../services/reportes.service');
const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Cron job para envío automático de reportes semanales
 * Configuración dinámica mediante variables de entorno:
 * - AUTO_SEND_ENABLED: true/false
 * - AUTO_SEND_DAY: 1-7 (1=Lunes, 7=Domingo)
 * - AUTO_SEND_HOUR: 0-23
 * - AUTO_SEND_MINUTE: 0-59
 * - AUTO_SEND_TIMEZONE: Zona horaria (ej: America/Mexico_City)
 */

function iniciarCronJob() {
  // Leer configuración del .env
  const enabled = process.env.AUTO_SEND_ENABLED === 'true';
  const day = parseInt(process.env.AUTO_SEND_DAY) || 5; // Default: Viernes
  const hour = parseInt(process.env.AUTO_SEND_HOUR) || 18; // Default: 6 PM
  const minute = parseInt(process.env.AUTO_SEND_MINUTE) || 0;
  const timezone = process.env.AUTO_SEND_TIMEZONE || 'America/Mexico_City';

  if (!enabled) {
    logger.info('⚠️  Envío automático de reportes DESHABILITADO');
    logger.info('   Para habilitar, configura AUTO_SEND_ENABLED=true en .env');
    return;
  }

  // Construir expresión cron: 'minuto hora * * día-semana'
  const cronExpression = `${minute} ${hour} * * ${day}`;

  logger.info('⚙️  Configurando envío automático de reportes...');
  logger.info(`   Expresión cron: ${cronExpression}`);

  cron.schedule(cronExpression, async () => {
    logger.info('════════════════════════════════════════════════');
    logger.info('⏰ ENVÍO AUTOMÁTICO DE REPORTES SEMANALES');
    logger.info('📅 Fecha: ' + new Date().toLocaleString('es-MX', { timeZone: timezone }));
    logger.info('════════════════════════════════════════════════');

    try {
      // Obtener todos los grupos activos
      const [grupos] = await db.query('SELECT id, nombre, grado, seccion FROM grupos WHERE activo = TRUE');

      if (grupos.length === 0) {
        logger.warn('⚠️  No hay grupos activos para procesar');
        return;
      }

      logger.info(`📊 Procesando ${grupos.length} grupo(s)...`);

      // Calcular fechas de la semana actual
      const { inicio, fin } = obtenerFechasSemanaActual();
      logger.info(`📅 Periodo: ${inicio} a ${fin}`);

      let totalReportes = 0;
      let totalExitosos = 0;
      let totalErrores = 0;

      // Generar y enviar reportes para cada grupo
      for (const grupo of grupos) {
        logger.info(`📚 Grupo: ${grupo.grado}° ${grupo.seccion} - ${grupo.nombre}`);

        try {
          const resultado = await generarYEnviarReportesSemanales(grupo.id, inicio, fin);

          totalReportes += resultado.reportesGenerados || 0;
          totalExitosos += resultado.emailsEnviados || 0;
          totalErrores += resultado.emailsFallidos || 0;

          logger.info(`✅ Grupo procesado: ${resultado.emailsEnviados || 0} enviados, ${resultado.emailsFallidos || 0} errores`);
        } catch (error) {
          logger.error(`❌ Error procesando grupo ${grupo.nombre}:`, { message: error.message });
          totalErrores++;
        }
      }

      // Resumen final
      logger.info('════════════════════════════════════════════════');
      logger.info('📊 RESUMEN DEL ENVÍO AUTOMÁTICO');
      logger.info(`✉️  Total de reportes: ${totalReportes}`);
      logger.info(`✅ Enviados exitosamente: ${totalExitosos}`);
      logger.info(`❌ Errores: ${totalErrores}`);
      logger.info('════════════════════════════════════════════════');

      if (totalExitosos > 0) {
        logger.info('🎉 Envío automático completado exitosamente');
      } else {
        logger.warn('⚠️  No se enviaron reportes. Verifica la configuración de email.');
      }

    } catch (error) {
      logger.error('❌ ERROR CRÍTICO EN ENVÍO AUTOMÁTICO:', { message: error.message, stack: error.stack });
    }
  }, {
    timezone: timezone
  });

  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const diaNombre = dias[day] || 'desconocido';
  const horaFormateada = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  logger.info(`✅ Cron job configurado: Envío automático cada ${diaNombre} a las ${horaFormateada}`);
  logger.info(`⏰ Zona horaria: ${timezone}`);
  logger.info('📅 Próxima ejecución: ' + getNextExecution(day, hour, minute, timezone));
}

function getNextExecution(targetDay, targetHour, targetMinute, timezone) {
  const now = new Date();
  const currentDay = now.getDay();

  // Calcular días hasta el próximo día objetivo
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget < 0) {
    daysUntilTarget += 7;
  } else if (daysUntilTarget === 0) {
    // Si es hoy, verificar si ya pasó la hora
    const targetTime = new Date(now);
    targetTime.setHours(targetHour, targetMinute, 0, 0);
    if (now >= targetTime) {
      daysUntilTarget = 7; // Esperar a la próxima semana
    }
  }

  const nextExecution = new Date(now);
  nextExecution.setDate(now.getDate() + daysUntilTarget);
  nextExecution.setHours(targetHour, targetMinute, 0, 0);

  return nextExecution.toLocaleString('es-MX', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

module.exports = { iniciarCronJob };

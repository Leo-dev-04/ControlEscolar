const cron = require('node-cron');
const { generarReportesSemanales, obtenerFechasSemanaActual } = require('../services/reportes.service');
const logger = require('../utils/logger');

function iniciarCronReportes() {
    // Cada viernes a las 18:00
    cron.schedule('0 18 * * 5', async () => {
        logger.info('⏰ [CRON] Iniciando generación automática de reportes semanales...');
        try {
            const { inicio, fin } = obtenerFechasSemanaActual();
            const resultado = await generarReportesSemanales(null, inicio, fin);
            logger.info(`✅ [CRON] Reportes generados: ${resultado.reportesGenerados} alumnos en ${resultado.grupos} grupos`);
        } catch (error) {
            logger.error('❌ [CRON] Error al generar reportes automáticos:', error);
        }
    }, {
        timezone: 'America/Mexico_City'
    });

    logger.info('📅 Cron programado: reportes automáticos cada viernes a las 18:00 (CDMX)');
}

module.exports = { iniciarCronReportes };

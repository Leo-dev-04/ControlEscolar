const db = require('../config/database');
const { consolidarSemanaAlumno, obtenerFechasSemanaActual } = require('../services/reportes.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * GET /api/reporte/:qr_token
 * Endpoint público para que los padres consulten el reporte del alumno
 */
exports.getByToken = async (req, res) => {
    try {
        const { qr_token } = req.params;

        if (!qr_token || qr_token.length < 16) {
            return ApiResponse.error(res, 'Token inválido', 400);
        }

        // Buscar alumno por qr_token (solo datos no sensibles)
        const [rows] = await db.query(`
      SELECT 
        a.id, a.nombre, a.apellidos,
        g.grado, g.seccion as grupo, g.nombre as grupo_nombre, g.escuela
      FROM alumnos a
      INNER JOIN grupos g ON a.grupo_id = g.id
      WHERE a.qr_token = ? AND a.activo = TRUE
    `, [qr_token]);

        if (rows.length === 0) {
            return ApiResponse.notFound(res, 'Reporte no encontrado. Verifica que el enlace sea correcto.');
        }

        const alumno = rows[0];

        // Obtener fechas de la semana actual
        const { inicio, fin } = obtenerFechasSemanaActual();

        // Consolidar datos de la semana
        const semana = await consolidarSemanaAlumno(alumno.id, inicio, fin);

        // También obtener el último reporte guardado (si existe)
        const [reportes] = await db.query(`
      SELECT * FROM reportes_semanales 
      WHERE alumno_id = ? 
      ORDER BY fecha_inicio DESC 
      LIMIT 1
    `, [alumno.id]);

        const ultimoReporte = reportes.length > 0 ? reportes[0] : null;

        // Usar datos en tiempo real o del último reporte guardado
        const datosReporte = {
            total_asistencias: semana.total_asistencias,
            total_faltas: semana.total_faltas,
            total_retardos: semana.total_retardos,
            total_tareas: semana.total_tareas,
            tareas_entregadas: semana.tareas_entregadas,
            conducta_verde: semana.conducta_verde,
            conducta_amarillo: semana.conducta_amarillo,
            conducta_rojo: semana.conducta_rojo,
            observaciones_conducta: semana.observaciones_conducta,
            fecha_inicio: inicio,
            fecha_fin: fin
        };

        return ApiResponse.success(res, {
            alumno: {
                nombre: alumno.nombre,
                apellidos: alumno.apellidos,
                grado: alumno.grado,
                grupo: alumno.grupo,
                grupo_nombre: alumno.grupo_nombre,
                escuela: alumno.escuela
            },
            reporte: datosReporte,
            ultimo_reporte: ultimoReporte ? {
                fecha_inicio: ultimoReporte.fecha_inicio,
                fecha_fin: ultimoReporte.fecha_fin,
                total_asistencias: ultimoReporte.total_asistencias,
                total_faltas: ultimoReporte.total_faltas,
                total_retardos: ultimoReporte.total_retardos,
                total_tareas: ultimoReporte.total_tareas,
                tareas_entregadas: ultimoReporte.tareas_entregadas,
                conducta_verde: ultimoReporte.conducta_verde,
                conducta_amarillo: ultimoReporte.conducta_amarillo,
                conducta_rojo: ultimoReporte.conducta_rojo,
                observaciones_conducta: ultimoReporte.observaciones_conducta
            } : null,
            fecha_consulta: new Date().toISOString()
        }, 'Reporte obtenido correctamente');

    } catch (error) {
        logger.error('Error al obtener reporte público:', error);
        return ApiResponse.error(res, 'Error al obtener el reporte', 500);
    }
};

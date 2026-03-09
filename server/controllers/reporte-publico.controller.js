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
        const { inicio, fin } = obtenerFechasSemanaActual();

        // Datos en tiempo real de la semana actual
        const semana = await consolidarSemanaAlumno(alumno.id, inicio, fin);

        // Historial: últimos 4 reportes guardados
        const [historial] = await db.query(`
      SELECT fecha_inicio, fecha_fin, total_asistencias, total_faltas, total_retardos,
             total_tareas, tareas_entregadas, conducta_verde, conducta_amarillo, conducta_rojo,
             observaciones_conducta
      FROM reportes_semanales 
      WHERE alumno_id = ? 
      ORDER BY fecha_inicio DESC 
      LIMIT 4
    `, [alumno.id]);

        return ApiResponse.success(res, {
            alumno: {
                nombre: alumno.nombre,
                apellidos: alumno.apellidos,
                grado: alumno.grado,
                grupo: alumno.grupo,
                grupo_nombre: alumno.grupo_nombre,
                escuela: alumno.escuela
            },
            reporte: {
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
            },
            historial: historial,
            fecha_consulta: new Date().toISOString()
        }, 'Reporte obtenido correctamente');

    } catch (error) {
        logger.error('Error al obtener reporte público:', error);
        return ApiResponse.error(res, 'Error al obtener el reporte', 500);
    }
};

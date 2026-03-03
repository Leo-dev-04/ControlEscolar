const db = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Umbrales de rezago
const UMBRAL_ASISTENCIA = 0.40;  // < 40%
const UMBRAL_TAREAS = 0.30;  // < 30%
const UMBRAL_CONDUCTA = 0.30;  // días rojos > 30%

exports.getResumen = async (req, res) => {
    try {
        // Obtener la semana más reciente con reportes
        const [semanaRows] = await db.query(`
      SELECT MAX(fecha_inicio) AS ultima_semana FROM reportes_semanales
    `);
        const ultimaSemana = semanaRows[0]?.ultima_semana;

        if (!ultimaSemana) {
            return ApiResponse.success(res, {
                semana: null,
                alumnos: [],
                resumen: { total: 0, rezago_asistencia: 0, rezago_tareas: 0, rezago_conducta: 0, riesgo_alto: 0 }
            }, 'No hay reportes generados aún');
        }

        // Traer todos los reportes de esa semana con info del alumno y grupo
        const [rows] = await db.query(`
      SELECT
        r.id                    AS reporte_id,
        r.alumno_id,
        r.fecha_inicio,
        r.fecha_fin,
        r.total_asistencias,
        r.total_faltas,
        r.total_retardos,
        r.tareas_entregadas,
        r.total_tareas,
        r.conducta_verde,
        r.conducta_amarillo,
        r.conducta_rojo,
        r.observaciones_conducta,
        CONCAT(a.nombre, ' ', a.apellidos) AS alumno_nombre,
        a.nombre                AS nombre,
        a.apellidos             AS apellidos,
        a.email_padre,
        g.nombre                AS grupo_nombre,
        g.grado,
        g.seccion,
        g.escuela
      FROM reportes_semanales r
      INNER JOIN alumnos a ON r.alumno_id = a.id
      INNER JOIN grupos g ON a.grupo_id = g.id
      WHERE r.fecha_inicio = ?
      ORDER BY g.escuela, g.grado, g.seccion, a.apellidos
    `, [ultimaSemana]);

        // Calcular métricas y flags de rezago
        const alumnos = rows.map(r => {
            const totalDias = (r.total_asistencias || 0) + (r.total_faltas || 0);
            const pctAsist = totalDias > 0 ? r.total_asistencias / totalDias : 0;
            const pctTareas = r.total_tareas > 0 ? r.tareas_entregadas / r.total_tareas : 0;
            const totalConductaDias = (r.conducta_verde || 0) + (r.conducta_amarillo || 0) + (r.conducta_rojo || 0);
            const pctRojos = totalConductaDias > 0 ? r.conducta_rojo / totalConductaDias : 0;

            const rezago_asistencia = pctAsist < UMBRAL_ASISTENCIA;
            const rezago_tareas = pctTareas < UMBRAL_TAREAS;
            const rezago_conducta = pctRojos > UMBRAL_CONDUCTA;
            const nivel_riesgo = [rezago_asistencia, rezago_tareas, rezago_conducta].filter(Boolean).length;

            return {
                ...r,
                pct_asistencia: Math.round(pctAsist * 100),
                pct_tareas: Math.round(pctTareas * 100),
                pct_rojos: Math.round(pctRojos * 100),
                rezago_asistencia,
                rezago_tareas,
                rezago_conducta,
                nivel_riesgo,
            };
        });

        // Solo los que tienen al menos un indicador en rezago
        const enRezago = alumnos.filter(a => a.nivel_riesgo > 0);

        // Ordenar: mayor riesgo primero
        enRezago.sort((a, b) => b.nivel_riesgo - a.nivel_riesgo);

        const resumen = {
            total: enRezago.length,
            rezago_asistencia: enRezago.filter(a => a.rezago_asistencia).length,
            rezago_tareas: enRezago.filter(a => a.rezago_tareas).length,
            rezago_conducta: enRezago.filter(a => a.rezago_conducta).length,
            riesgo_alto: enRezago.filter(a => a.nivel_riesgo >= 2).length,
        };

        return ApiResponse.success(res, {
            semana: ultimaSemana,
            alumnos: enRezago,
            resumen,
        }, 'Datos de rezago obtenidos correctamente');

    } catch (error) {
        logger.error('Error al obtener datos de rezago:', error);
        return ApiResponse.error(res, 'Error al obtener datos de rezago', 500);
    }
};

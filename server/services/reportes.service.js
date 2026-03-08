const db = require('../config/database');
const logger = require('../utils/logger');

async function consolidarSemanaAlumno(alumnoId, fechaInicio, fechaFin) {
    try {
        const sqlAsistencias = "SELECT SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) as presentes, SUM(CASE WHEN estado = 'falta' THEN 1 ELSE 0 END) as faltas, SUM(CASE WHEN estado = 'retardo' THEN 1 ELSE 0 END) as retardos FROM asistencias WHERE alumno_id = ? AND fecha BETWEEN ? AND ?";
        const [asistencias] = await db.query(sqlAsistencias, [alumnoId, fechaInicio, fechaFin]);

        const sqlTareas = 'SELECT COUNT(DISTINCT t.id) as total_tareas, SUM(CASE WHEN et.entregada = TRUE THEN 1 ELSE 0 END) as entregadas FROM tareas t INNER JOIN alumnos a ON a.grupo_id = t.grupo_id LEFT JOIN entregas_tareas et ON t.id = et.tarea_id AND et.alumno_id = ? WHERE a.id = ? AND t.fecha_entrega BETWEEN ? AND ?';
        const [tareas] = await db.query(sqlTareas, [alumnoId, alumnoId, fechaInicio, fechaFin]);

        const sqlConducta = "SELECT SUM(CASE WHEN color = 'verde' THEN 1 ELSE 0 END) as verde, SUM(CASE WHEN color = 'amarillo' THEN 1 ELSE 0 END) as amarillo, SUM(CASE WHEN color = 'rojo' THEN 1 ELSE 0 END) as rojo, GROUP_CONCAT(observaciones SEPARATOR '; ') as observaciones FROM conducta WHERE alumno_id = ? AND fecha BETWEEN ? AND ?";
        const [conducta] = await db.query(sqlConducta, [alumnoId, fechaInicio, fechaFin]);

        return {
            total_asistencias: asistencias[0].presentes || 0,
            total_faltas: asistencias[0].faltas || 0,
            total_retardos: asistencias[0].retardos || 0,
            total_tareas: tareas[0].total_tareas || 0,
            tareas_entregadas: tareas[0].entregadas || 0,
            conducta_verde: conducta[0].verde || 0,
            conducta_amarillo: conducta[0].amarillo || 0,
            conducta_rojo: conducta[0].rojo || 0,
            observaciones_conducta: conducta[0].observaciones || ''
        };
    } catch (error) {
        logger.error('Error consolidando semana:', error);
        throw error;
    }
}

async function generarReportesGrupo(grupoId, fechaInicio, fechaFin) {
    try {
        const sqlAlumnos = 'SELECT a.*, g.nombre as grupo_nombre, g.grado, g.seccion as grupo FROM alumnos a INNER JOIN grupos g ON a.grupo_id = g.id WHERE a.grupo_id = ? AND a.activo = TRUE';
        const [alumnos] = await db.query(sqlAlumnos, [grupoId]);

        const reportesGenerados = [];

        for (const alumno of alumnos) {
            const datos = await consolidarSemanaAlumno(alumno.id, fechaInicio, fechaFin);

            const sqlExistente = 'SELECT id FROM reportes_semanales WHERE alumno_id = ? AND fecha_inicio = ?';
            const [existente] = await db.query(sqlExistente, [alumno.id, fechaInicio]);

            let reporteId;

            if (existente.length > 0) {
                const sqlUpdate = 'UPDATE reportes_semanales SET fecha_fin = ?, total_asistencias = ?, total_faltas = ?, total_tareas = ?, tareas_entregadas = ?, conducta_verde = ?, conducta_amarillo = ?, conducta_rojo = ?, observaciones_conducta = ? WHERE id = ?';
                await db.query(sqlUpdate, [fechaFin, datos.total_asistencias, datos.total_faltas, datos.total_tareas, datos.tareas_entregadas, datos.conducta_verde, datos.conducta_amarillo, datos.conducta_rojo, datos.observaciones_conducta, existente[0].id]);
                reporteId = existente[0].id;
            } else {
                const sqlInsert = 'INSERT INTO reportes_semanales (alumno_id, fecha_inicio, fecha_fin, total_asistencias, total_faltas, total_tareas, tareas_entregadas, conducta_verde, conducta_amarillo, conducta_rojo, observaciones_conducta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const [resultado] = await db.query(sqlInsert, [alumno.id, fechaInicio, fechaFin, datos.total_asistencias, datos.total_faltas, datos.total_tareas, datos.tareas_entregadas, datos.conducta_verde, datos.conducta_amarillo, datos.conducta_rojo, datos.observaciones_conducta]);
                reporteId = resultado.insertId;
            }

            reportesGenerados.push({
                reporteId: reporteId,
                alumno: alumno,
                datos: datos
            });
        }

        return reportesGenerados;
    } catch (error) {
        logger.error('Error generando reportes:', error);
        throw error;
    }
}

async function generarReportesSemanales(grupoId, fechaInicio, fechaFin) {
    try {
        logger.info('Iniciando generación de reportes');

        let grupos;
        if (grupoId) {
            const sqlGrupo = 'SELECT id, nombre FROM grupos WHERE id = ? AND activo = TRUE';
            const [grupoEspecifico] = await db.query(sqlGrupo, [grupoId]);
            grupos = grupoEspecifico;
        } else {
            const sqlTodosGrupos = 'SELECT id, nombre FROM grupos WHERE activo = TRUE';
            const [todosGrupos] = await db.query(sqlTodosGrupos);
            grupos = todosGrupos;
        }

        const resumenTotal = {
            grupos: grupos.length,
            reportesGenerados: 0
        };

        for (const grupo of grupos) {
            logger.info('Procesando grupo: ' + grupo.nombre);

            const reportes = await generarReportesGrupo(grupo.id, fechaInicio, fechaFin);
            resumenTotal.reportesGenerados += reportes.length;
        }

        logger.info('Proceso completado');
        logger.info('Grupos procesados: ' + resumenTotal.grupos);
        logger.info('Reportes generados: ' + resumenTotal.reportesGenerados);

        return resumenTotal;
    } catch (error) {
        logger.error('Error en proceso de reportes:', error);
        throw error;
    }
}

function obtenerFechasSemanaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();

    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));

    const viernes = new Date(lunes);
    viernes.setDate(lunes.getDate() + 4);

    return {
        inicio: lunes.toISOString().split('T')[0],
        fin: viernes.toISOString().split('T')[0]
    };
}

module.exports = {
    consolidarSemanaAlumno,
    generarReportesGrupo,
    generarReportesSemanales,
    obtenerFechasSemanaActual
};

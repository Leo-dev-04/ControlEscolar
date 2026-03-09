const db = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

exports.getResumen = async (req, res) => {
    try {
        const usuario = req.usuario;
        const hoy = new Date().toISOString().split('T')[0];

        // Filtro por maestro
        const filtroMaestro = usuario.rol === 'maestro' ? 'AND g.maestro_id = ?' : '';
        const params = filtroMaestro ? [usuario.id] : [];

        // 1. Total alumnos activos
        const [alumnosResult] = await db.query(`
      SELECT COUNT(*) as total FROM alumnos a 
      INNER JOIN grupos g ON a.grupo_id = g.id
      WHERE a.activo = TRUE ${filtroMaestro}
    `, params);

        // 2. Asistencia de hoy
        const [asistHoy] = await db.query(`
      SELECT 
        COUNT(*) as registrados,
        SUM(CASE WHEN asi.estado = 'presente' THEN 1 ELSE 0 END) as presentes,
        SUM(CASE WHEN asi.estado = 'falta' THEN 1 ELSE 0 END) as faltas,
        SUM(CASE WHEN asi.estado = 'retardo' THEN 1 ELSE 0 END) as retardos
      FROM asistencias asi
      INNER JOIN alumnos a ON asi.alumno_id = a.id
      INNER JOIN grupos g ON a.grupo_id = g.id
      WHERE asi.fecha = ? ${filtroMaestro}
    `, [hoy, ...params]);

        // 3. Conductas rojas de hoy
        const [conductaRoja] = await db.query(`
      SELECT a.nombre, a.apellidos, c.observaciones, g.grado, g.seccion
      FROM conducta c
      INNER JOIN alumnos a ON c.alumno_id = a.id
      INNER JOIN grupos g ON a.grupo_id = g.id
      WHERE c.fecha = ? AND c.color = 'rojo' ${filtroMaestro}
      ORDER BY g.grado, g.seccion, a.apellidos
    `, [hoy, ...params]);

        // 4. Tareas de esta semana
        const diaSemana = new Date().getDay();
        const lunes = new Date();
        lunes.setDate(lunes.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        const viernes = new Date(lunes);
        viernes.setDate(lunes.getDate() + 4);
        const fechaLunes = lunes.toISOString().split('T')[0];
        const fechaViernes = viernes.toISOString().split('T')[0];

        const [tareasSemana] = await db.query(`
      SELECT COUNT(*) as total,
        SUM(CASE WHEN et.entregada = TRUE THEN 1 ELSE 0 END) as entregadas
      FROM tareas t
      INNER JOIN grupos g ON t.grupo_id = g.id
      LEFT JOIN entregas_tareas et ON t.id = et.tarea_id
      WHERE t.fecha_entrega BETWEEN ? AND ? ${filtroMaestro}
    `, [fechaLunes, fechaViernes, ...params]);

        // 5. Últimos reportes generados
        const [ultimosReportes] = await db.query(`
      SELECT COUNT(*) as total,
        MAX(r.created_at) as ultimo
      FROM reportes_semanales r
      INNER JOIN alumnos a ON r.alumno_id = a.id
      INNER JOIN grupos g ON a.grupo_id = g.id
      WHERE 1=1 ${filtroMaestro}
    `, params);

        const asist = asistHoy[0];
        const totalAlumnos = alumnosResult[0].total;
        const sinRegistrar = totalAlumnos - (asist.registrados || 0);

        return ApiResponse.success(res, {
            total_alumnos: totalAlumnos,
            asistencia_hoy: {
                registrados: asist.registrados || 0,
                presentes: asist.presentes || 0,
                faltas: asist.faltas || 0,
                retardos: asist.retardos || 0,
                sin_registrar: sinRegistrar > 0 ? sinRegistrar : 0
            },
            conducta_roja_hoy: conductaRoja,
            tareas_semana: {
                total_entregas: tareasSemana[0].total || 0,
                entregadas: tareasSemana[0].entregadas || 0,
            },
            reportes: {
                total: ultimosReportes[0].total || 0,
                ultimo: ultimosReportes[0].ultimo
            }
        }, 'Dashboard obtenido');
    } catch (error) {
        logger.error('Error en dashboard:', error);
        return ApiResponse.error(res, 'Error al obtener dashboard', 500);
    }
};

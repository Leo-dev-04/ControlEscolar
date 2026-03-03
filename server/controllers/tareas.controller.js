const db = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const tareasController = {
  // Crear una nueva tarea
  async crearTarea(req, res) {
    try {
      const { grupo_id, titulo, descripcion, fecha_asignacion, fecha_entrega } = req.body;
      const maestro_id = req.usuario?.id || req.body.maestro_id;

      if (!grupo_id || !titulo || !fecha_entrega) {
        return ApiResponse.error(res, 'Se requiere grupo_id, titulo y fecha_entrega', 400);
      }

      const [result] = await db.query(
        `INSERT INTO tareas (grupo_id, titulo, descripcion, fecha_asignacion, fecha_entrega, maestro_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          grupo_id,
          titulo,
          descripcion || null,
          fecha_asignacion || new Date().toISOString().split('T')[0],
          fecha_entrega,
          maestro_id
        ]
      );

      return ApiResponse.success(res, { tarea_id: result.insertId }, 'Tarea creada correctamente', 201);
    } catch (error) {
      logger.error('Error al crear tarea:', error);
      return ApiResponse.error(res, 'Error al crear tarea', 500);
    }
  },

  // Registrar entregas de una tarea
  async registrarEntregas(req, res) {
    try {
      const { tarea_id, entregas } = req.body;

      if (!tarea_id || !entregas || !Array.isArray(entregas)) {
        return ApiResponse.error(res, 'Se requiere tarea_id y entregas (array)', 400);
      }

      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Eliminar entregas existentes
        await connection.query('DELETE FROM entregas_tareas WHERE tarea_id = ?', [tarea_id]);

        // Insertar nuevas entregas
        for (const entrega of entregas) {
          await connection.query(
            `INSERT INTO entregas_tareas (tarea_id, alumno_id, entregada, fecha_entrega, observaciones)
             VALUES (?, ?, ?, ?, ?)`,
            [
              tarea_id,
              entrega.alumno_id,
              entrega.entregada,
              entrega.entregada ? new Date() : null,
              entrega.observaciones || null
            ]
          );
        }

        await connection.commit();
        connection.release();

        return ApiResponse.success(res, { total: entregas.length }, 'Entregas registradas correctamente');
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      logger.error('Error al registrar entregas:', error);
      return ApiResponse.error(res, 'Error al registrar entregas', 500);
    }
  },

  // Obtener tareas de un grupo
  async obtenerTareasPorGrupo(req, res) {
    try {
      const { grupo_id, fecha_inicio, fecha_fin } = req.query;

      if (!grupo_id) {
        return ApiResponse.error(res, 'Se requiere grupo_id', 400);
      }

      let query = `
        SELECT 
          t.*,
          COUNT(et.id) as total_alumnos,
          SUM(CASE WHEN et.entregada = TRUE THEN 1 ELSE 0 END) as total_entregadas
        FROM tareas t
        LEFT JOIN entregas_tareas et ON t.id = et.tarea_id
        WHERE t.grupo_id = ?
      `;
      const params = [grupo_id];

      if (fecha_inicio && fecha_fin) {
        query += ' AND t.fecha_asignacion BETWEEN ? AND ?';
        params.push(fecha_inicio, fecha_fin);
      }

      query += ' GROUP BY t.id ORDER BY t.fecha_asignacion DESC';

      const [rows] = await db.query(query, params);
      return ApiResponse.success(res, rows, 'Tareas obtenidas correctamente');
    } catch (error) {
      logger.error('Error al obtener tareas:', error);
      return ApiResponse.error(res, 'Error al obtener tareas', 500);
    }
  },

  // Obtener entregas de una tarea específica
  async obtenerEntregasTarea(req, res) {
    try {
      const { tarea_id } = req.params;

      const [rows] = await db.query(
        `SELECT 
          et.*,
          a.nombre,
          a.apellidos
        FROM entregas_tareas et
        INNER JOIN alumnos a ON et.alumno_id = a.id
        WHERE et.tarea_id = ?
        ORDER BY a.apellidos, a.nombre`,
        [tarea_id]
      );

      return ApiResponse.success(res, rows, 'Entregas obtenidas correctamente');
    } catch (error) {
      logger.error('Error al obtener entregas:', error);
      return ApiResponse.error(res, 'Error al obtener entregas', 500);
    }
  },

  // Obtener resumen de tareas de un alumno
  async obtenerResumenAlumno(req, res) {
    try {
      const { alumno_id, fecha_inicio, fecha_fin } = req.query;

      if (!alumno_id || !fecha_inicio || !fecha_fin) {
        return ApiResponse.error(res, 'Se requiere alumno_id, fecha_inicio y fecha_fin', 400);
      }

      const [rows] = await db.query(
        `SELECT 
          COUNT(DISTINCT t.id) as total_tareas,
          SUM(CASE WHEN et.entregada = TRUE THEN 1 ELSE 0 END) as tareas_entregadas,
          SUM(CASE WHEN et.entregada = FALSE THEN 1 ELSE 0 END) as tareas_no_entregadas
        FROM tareas t
        INNER JOIN alumnos a ON t.grupo_id = a.grupo_id
        LEFT JOIN entregas_tareas et ON t.id = et.tarea_id AND et.alumno_id = a.id
        WHERE a.id = ? AND t.fecha_asignacion BETWEEN ? AND ?`,
        [alumno_id, fecha_inicio, fecha_fin]
      );

      return ApiResponse.success(res, rows[0], 'Resumen de tareas obtenido');
    } catch (error) {
      logger.error('Error al obtener resumen de tareas:', error);
      return ApiResponse.error(res, 'Error al obtener resumen de tareas', 500);
    }
  }
};

module.exports = tareasController;

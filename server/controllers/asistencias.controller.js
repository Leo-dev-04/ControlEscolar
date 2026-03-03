const db = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const asistenciasController = {
  // Guardar asistencia del día para un grupo
  async registrarAsistencias(req, res) {
    try {
      const { fecha, grupo_id, asistencias } = req.body;
      const registrado_por = req.usuario?.id || req.body.registrado_por;

      // Validar datos
      if (!fecha || !grupo_id || !asistencias || !Array.isArray(asistencias)) {
        return ApiResponse.error(res, 'Datos incompletos. Se requiere fecha, grupo_id y asistencias.', 400);
      }

      // Iniciar transacción
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Eliminar asistencias existentes de ese día para ese grupo
        await connection.query(
          `DELETE a FROM asistencias a
           INNER JOIN alumnos al ON a.alumno_id = al.id
           WHERE al.grupo_id = ? AND a.fecha = ?`,
          [grupo_id, fecha]
        );

        // Insertar nuevas asistencias
        for (const asistencia of asistencias) {
          const estado = asistencia.estado || 'presente';
          await connection.query(
            `INSERT INTO asistencias (alumno_id, fecha, estado, observaciones, registrado_por)
             VALUES (?, ?, ?, ?, ?)`,
            [
              asistencia.alumno_id,
              fecha,
              estado,
              asistencia.observaciones || null,
              registrado_por
            ]
          );
        }

        await connection.commit();
        connection.release();

        return ApiResponse.success(res, { total: asistencias.length }, 'Asistencias registradas correctamente');
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      logger.error('Error al registrar asistencias:', error);
      return ApiResponse.error(res, 'Error al registrar asistencias', 500);
    }
  },

  // Obtener asistencias de un grupo en una fecha
  async obtenerAsistenciasPorFecha(req, res) {
    try {
      const { grupo_id, fecha } = req.query;

      if (!grupo_id || !fecha) {
        return ApiResponse.error(res, 'Se requiere grupo_id y fecha', 400);
      }

      const [rows] = await db.query(
        `SELECT 
          a.id,
          a.alumno_id,
          al.nombre,
          al.apellidos,
          a.fecha,
          a.estado,
          a.observaciones
        FROM asistencias a
        INNER JOIN alumnos al ON a.alumno_id = al.id
        WHERE al.grupo_id = ? AND a.fecha = ?
        ORDER BY al.apellidos, al.nombre`,
        [grupo_id, fecha]
      );

      return ApiResponse.success(res, rows, 'Asistencias obtenidas correctamente');
    } catch (error) {
      logger.error('Error al obtener asistencias:', error);
      return ApiResponse.error(res, 'Error al obtener asistencias', 500);
    }
  },

  // Obtener resumen de asistencias de un alumno en un rango de fechas
  async obtenerResumenAlumno(req, res) {
    try {
      const { alumno_id, fecha_inicio, fecha_fin } = req.query;

      if (!alumno_id || !fecha_inicio || !fecha_fin) {
        return ApiResponse.error(res, 'Se requiere alumno_id, fecha_inicio y fecha_fin', 400);
      }

      const [rows] = await db.query(
        `SELECT 
          COUNT(*) as total_dias,
          SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) as dias_asistio,
          SUM(CASE WHEN estado = 'falta' THEN 1 ELSE 0 END) as dias_falto,
          SUM(CASE WHEN estado = 'retardo' THEN 1 ELSE 0 END) as dias_retardo
        FROM asistencias
        WHERE alumno_id = ? AND fecha BETWEEN ? AND ?`,
        [alumno_id, fecha_inicio, fecha_fin]
      );

      return ApiResponse.success(res, rows[0], 'Resumen de asistencias obtenido');
    } catch (error) {
      logger.error('Error al obtener resumen de asistencias:', error);
      return ApiResponse.error(res, 'Error al obtener resumen de asistencias', 500);
    }
  }
};

module.exports = asistenciasController;

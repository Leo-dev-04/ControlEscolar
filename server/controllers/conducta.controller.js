const db = require('../config/database');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const conductaController = {
  // Registrar conductas del día para un grupo
  async registrarConductas(req, res) {
    try {
      const { fecha, grupo_id, conductas } = req.body;
      const registrado_por = req.usuario?.id || req.body.registrado_por;

      if (!fecha || !grupo_id || !conductas || !Array.isArray(conductas)) {
        return ApiResponse.error(res, 'Se requiere fecha, grupo_id y conductas (array)', 400);
      }

      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Eliminar conductas existentes del día para ese grupo
        await connection.query(
          `DELETE c FROM conducta c
           INNER JOIN alumnos a ON c.alumno_id = a.id
           WHERE a.grupo_id = ? AND c.fecha = ?`,
          [grupo_id, fecha]
        );

        // Insertar nuevas conductas
        for (const conducta of conductas) {
          await connection.query(
            `INSERT INTO conducta (alumno_id, fecha, color, observaciones, registrado_por)
             VALUES (?, ?, ?, ?, ?)`,
            [
              conducta.alumno_id,
              fecha,
              conducta.color,
              conducta.observaciones || null,
              registrado_por
            ]
          );
        }

        await connection.commit();
        connection.release();

        return ApiResponse.success(res, { total: conductas.length }, 'Conductas registradas correctamente');
      } catch (error) {
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      logger.error('Error al registrar conductas:', error);
      return ApiResponse.error(res, 'Error al registrar conductas', 500);
    }
  },

  // Obtener conductas de un grupo en una fecha
  async obtenerConductasPorFecha(req, res) {
    try {
      const { grupo_id, fecha } = req.query;

      if (!grupo_id || !fecha) {
        return ApiResponse.error(res, 'Se requiere grupo_id y fecha', 400);
      }

      const [rows] = await db.query(
        `SELECT 
          c.id,
          c.alumno_id,
          a.nombre,
          a.apellidos,
          c.fecha,
          c.color,
          c.observaciones
        FROM conducta c
        INNER JOIN alumnos a ON c.alumno_id = a.id
        WHERE a.grupo_id = ? AND c.fecha = ?
        ORDER BY a.apellidos, a.nombre`,
        [grupo_id, fecha]
      );

      return ApiResponse.success(res, rows, 'Conductas obtenidas correctamente');
    } catch (error) {
      logger.error('Error al obtener conductas:', error);
      return ApiResponse.error(res, 'Error al obtener conductas', 500);
    }
  },

  // Obtener resumen de conducta de un alumno en un rango de fechas
  async obtenerResumenAlumno(req, res) {
    try {
      const { alumno_id, fecha_inicio, fecha_fin } = req.query;

      if (!alumno_id || !fecha_inicio || !fecha_fin) {
        return ApiResponse.error(res, 'Se requiere alumno_id, fecha_inicio y fecha_fin', 400);
      }

      const [rows] = await db.query(
        `SELECT 
          COUNT(*) as total_registros,
          SUM(CASE WHEN color = 'verde' THEN 1 ELSE 0 END) as dias_verde,
          SUM(CASE WHEN color = 'amarillo' THEN 1 ELSE 0 END) as dias_amarillo,
          SUM(CASE WHEN color = 'rojo' THEN 1 ELSE 0 END) as dias_rojo,
          GROUP_CONCAT(
            CASE WHEN observaciones IS NOT NULL AND observaciones != '' 
            THEN CONCAT(DATE_FORMAT(fecha, '%d/%m'), ': ', observaciones) 
            END 
            SEPARATOR ' | '
          ) as observaciones_semana
        FROM conducta
        WHERE alumno_id = ? AND fecha BETWEEN ? AND ?`,
        [alumno_id, fecha_inicio, fecha_fin]
      );

      return ApiResponse.success(res, rows[0], 'Resumen de conducta obtenido');
    } catch (error) {
      logger.error('Error al obtener resumen de conducta:', error);
      return ApiResponse.error(res, 'Error al obtener resumen de conducta', 500);
    }
  },

  // Obtener resumen del día por grupo
  async obtenerResumenDia(req, res) {
    try {
      const { grupo_id, fecha } = req.query;

      if (!grupo_id || !fecha) {
        return ApiResponse.error(res, 'Se requiere grupo_id y fecha', 400);
      }

      const [rows] = await db.query(
        `SELECT 
          color,
          COUNT(*) as cantidad
        FROM conducta c
        INNER JOIN alumnos a ON c.alumno_id = a.id
        WHERE a.grupo_id = ? AND c.fecha = ?
        GROUP BY color`,
        [grupo_id, fecha]
      );

      // Formatear respuesta
      const resumen = {
        verde: 0,
        amarillo: 0,
        rojo: 0
      };

      rows.forEach(row => {
        resumen[row.color] = row.cantidad;
      });

      return ApiResponse.success(res, resumen, 'Resumen del día obtenido');
    } catch (error) {
      logger.error('Error al obtener resumen del día:', error);
      return ApiResponse.error(res, 'Error al obtener resumen del día', 500);
    }
  }
};

module.exports = conductaController;

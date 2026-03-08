const db = require('../config/database');
const { generarReportesSemanales, obtenerFechasSemanaActual } = require('../services/reportes.service');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

exports.getAll = async (req, res) => {
  try {
    const [reportes] = await db.query(`
      SELECT r.*, 
             CONCAT(a.nombre, ' ', a.apellidos) as alumno_nombre,
             g.nombre as grupo_nombre,
             g.grado,
             g.seccion
      FROM reportes_semanales r
      INNER JOIN alumnos a ON r.alumno_id = a.id
      INNER JOIN grupos g ON a.grupo_id = g.id
      ORDER BY r.fecha_inicio DESC
    `);
    return ApiResponse.success(res, reportes, 'Reportes obtenidos correctamente');
  } catch (error) {
    logger.error('Error al obtener reportes:', error);
    return ApiResponse.error(res, 'Error al obtener reportes', 500);
  }
};

exports.getById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM reportes_semanales WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return ApiResponse.notFound(res, 'Reporte no encontrado');
    }
    return ApiResponse.success(res, rows[0], 'Reporte encontrado');
  } catch (error) {
    logger.error('Error al obtener reporte:', error);
    return ApiResponse.error(res, 'Error al obtener reporte', 500);
  }
};

exports.getByAlumno = async (req, res) => {
  try {
    const [reportes] = await db.query(
      'SELECT * FROM reportes_semanales WHERE alumno_id = ? ORDER BY fecha_inicio DESC',
      [req.params.alumnoId]
    );
    return ApiResponse.success(res, reportes, 'Reportes del alumno obtenidos');
  } catch (error) {
    logger.error('Error al obtener reportes del alumno:', error);
    return ApiResponse.error(res, 'Error al obtener reportes del alumno', 500);
  }
};

exports.generarReportes = async (req, res) => {
  try {
    const { grupo_id } = req.body;

    if (!grupo_id) {
      return ApiResponse.error(res, 'Se requiere grupo_id', 400);
    }

    // Calcular fechas de la semana actual
    const { inicio, fin } = obtenerFechasSemanaActual();

    const resultado = await generarReportesSemanales(grupo_id, inicio, fin);
    return ApiResponse.success(res, resultado, 'Reportes generados correctamente');
  } catch (error) {
    logger.error('Error al generar reportes:', error);
    return ApiResponse.error(res, 'Error al generar reportes', 500);
  }
};

exports.delete = async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM reportes_semanales WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return ApiResponse.notFound(res, 'Reporte no encontrado');
    }
    return ApiResponse.success(res, null, 'Reporte eliminado exitosamente');
  } catch (error) {
    logger.error('Error al eliminar reporte:', error);
    return ApiResponse.error(res, 'Error al eliminar reporte', 500);
  }
};

const Alumno = require('../models/Alumno.model');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');
const db = require('../config/database');

/**
 * Obtener todos los alumnos con paginación (filtrado por rol)
 */
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const usuario = req.usuario;

    // Si es maestro, filtrar por sus grupos asignados
    if (usuario && usuario.rol === 'maestro') {
      const pageNum = parseInt(page) || 1;
      const limitNum = Math.min(parseInt(limit) || 100, 200);
      const offset = (pageNum - 1) * limitNum;

      const [countResult] = await db.query(
        `SELECT COUNT(*) as total FROM alumnos a
         INNER JOIN grupos g ON a.grupo_id = g.id
         WHERE a.activo = TRUE AND g.maestro_id = ?`,
        [usuario.id]
      );
      const total = countResult[0].total;

      const [rows] = await db.query(`
        SELECT 
          a.id, a.nombre, a.apellidos, a.fecha_nacimiento,
          a.parent_email, a.parent_nombre, a.parent_telefono,
          g.id as grupo_id, g.nombre as grupo_nombre, g.grado, g.seccion as grupo
        FROM alumnos a
        INNER JOIN grupos g ON a.grupo_id = g.id
        WHERE a.activo = TRUE AND g.maestro_id = ?
        ORDER BY g.grado, g.seccion, a.apellidos, a.nombre
        LIMIT ? OFFSET ?
      `, [usuario.id, limitNum, offset]);

      return ApiResponse.paginated(
        res,
        rows,
        { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
        'Alumnos obtenidos correctamente'
      );
    }

    // Director ve todos los alumnos
    const resultado = await Alumno.findAll(page, limit);

    return ApiResponse.paginated(
      res,
      resultado.data,
      resultado.pagination,
      'Alumnos obtenidos correctamente'
    );
  } catch (error) {
    logger.error('Error en getAll alumnos:', error);
    return ApiResponse.error(res, 'Error obteniendo alumnos', 500);
  }
};

/**
 * Obtener alumno por ID
 */
exports.getById = async (req, res) => {
  try {
    const alumno = await Alumno.findById(req.params.id);

    if (!alumno) {
      return ApiResponse.notFound(res, 'Alumno no encontrado');
    }

    return ApiResponse.success(res, alumno, 'Alumno encontrado');
  } catch (error) {
    logger.error(`Error en getById alumno (${req.params.id}):`, error);
    return ApiResponse.error(res, 'Error obteniendo alumno', 500);
  }
};

/**
 * Crear nuevo alumno
 */
exports.create = async (req, res) => {
  try {
    const { nombre, apellidos, grupo_id, fecha_nacimiento, parent_email, parent_nombre, parent_telefono } = req.body;

    // Validar campos obligatorios
    const camposFaltantes = [];
    if (!nombre || !nombre.trim()) camposFaltantes.push('Nombre');
    if (!apellidos || !apellidos.trim()) camposFaltantes.push('Apellidos');
    if (!grupo_id) camposFaltantes.push('Grupo');
    if (!fecha_nacimiento) camposFaltantes.push('Fecha de Nacimiento');
    if (!parent_nombre || !parent_nombre.trim()) camposFaltantes.push('Nombre del Tutor');
    if (!parent_email || !parent_email.trim()) camposFaltantes.push('Email del Tutor');
    if (!parent_telefono || !parent_telefono.trim()) camposFaltantes.push('Teléfono del Tutor');

    if (camposFaltantes.length > 0) {
      return ApiResponse.error(
        res,
        `Los siguientes campos son obligatorios: ${camposFaltantes.join(', ')}`,
        400
      );
    }

    const id = await Alumno.create(req.body);

    return ApiResponse.success(
      res,
      { id },
      'Alumno creado exitosamente',
      201
    );
  } catch (error) {
    logger.error('Error en create alumno:', error);

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return ApiResponse.error(res, 'El grupo especificado no existe', 400);
    }

    if (error.code === 'ER_DUP_ENTRY') {
      return ApiResponse.error(res, 'Ya existe un alumno con ese email', 400);
    }

    return ApiResponse.error(res, 'Error creando alumno', 500);
  }
};

/**
 * Actualizar alumno
 */
exports.update = async (req, res) => {
  try {
    const { nombre, apellidos, grupo_id, fecha_nacimiento, parent_email, parent_nombre, parent_telefono } = req.body;

    // Validar campos obligatorios
    const camposFaltantes = [];
    if (!nombre || !nombre.trim()) camposFaltantes.push('Nombre');
    if (!apellidos || !apellidos.trim()) camposFaltantes.push('Apellidos');
    if (!grupo_id) camposFaltantes.push('Grupo');
    if (!fecha_nacimiento) camposFaltantes.push('Fecha de Nacimiento');
    if (!parent_nombre || !parent_nombre.trim()) camposFaltantes.push('Nombre del Tutor');
    if (!parent_email || !parent_email.trim()) camposFaltantes.push('Email del Tutor');
    if (!parent_telefono || !parent_telefono.trim()) camposFaltantes.push('Teléfono del Tutor');

    if (camposFaltantes.length > 0) {
      return ApiResponse.error(
        res,
        `Los siguientes campos son obligatorios: ${camposFaltantes.join(', ')}`,
        400
      );
    }

    const affectedRows = await Alumno.update(req.params.id, req.body);

    if (affectedRows === 0) {
      return ApiResponse.notFound(res, 'Alumno no encontrado');
    }

    return ApiResponse.success(res, null, 'Alumno actualizado exitosamente');
  } catch (error) {
    logger.error(`Error en update alumno (${req.params.id}):`, error);

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return ApiResponse.error(res, 'El grupo especificado no existe', 400);
    }

    return ApiResponse.error(res, 'Error actualizando alumno', 500);
  }
};

/**
 * Eliminar alumno (soft delete)
 */
exports.delete = async (req, res) => {
  try {
    const affectedRows = await Alumno.delete(req.params.id);

    if (affectedRows === 0) {
      return ApiResponse.notFound(res, 'Alumno no encontrado');
    }

    return ApiResponse.success(res, null, 'Alumno eliminado exitosamente');
  } catch (error) {
    logger.error(`Error en delete alumno (${req.params.id}):`, error);
    return ApiResponse.error(res, 'Error eliminando alumno', 500);
  }
};

/**
 * Obtener alumnos por grupo
 */
exports.getByGrupo = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const grupoId = req.params.grupoId;

    const resultado = await Alumno.findByGrupo(grupoId, page, limit);

    return ApiResponse.paginated(
      res,
      resultado.data,
      resultado.pagination,
      `Alumnos del grupo obtenidos correctamente`
    );
  } catch (error) {
    logger.error(`Error en getByGrupo (${req.params.grupoId}):`, error);
    return ApiResponse.error(res, 'Error obteniendo alumnos del grupo', 500);
  }
};

/**
 * Regenerar QR token de un alumno
 */
exports.regenerateQr = async (req, res) => {
  try {
    const newToken = await Alumno.regenerateQrToken(req.params.id);

    if (!newToken) {
      return ApiResponse.notFound(res, 'Alumno no encontrado');
    }

    return ApiResponse.success(res, { qr_token: newToken }, 'QR regenerado exitosamente');
  } catch (error) {
    logger.error(`Error en regenerateQr (${req.params.id}):`, error);
    return ApiResponse.error(res, 'Error regenerando QR', 500);
  }
};


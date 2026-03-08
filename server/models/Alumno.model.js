const db = require('../config/database');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { PAGINATION } = require('../config/constants');

/**
 * Genera un token QR único de 64 caracteres hexadecimales
 */
function generarQrToken() {
  return crypto.randomBytes(32).toString('hex');
}

class Alumno {
  /**
   * Obtener todos los alumnos con paginación
   */
  static async findAll(page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
    try {
      page = parseInt(page) || 1;
      limit = Math.min(parseInt(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
      const offset = (page - 1) * limit;

      const [countResult] = await db.query(
        'SELECT COUNT(*) as total FROM alumnos WHERE activo = TRUE'
      );
      const total = countResult[0].total;

      const [rows] = await db.query(`
        SELECT 
          a.id,
          a.nombre,
          a.apellidos,
          a.fecha_nacimiento,
          a.parent_email,
          a.parent_nombre,
          a.parent_telefono,
          a.qr_token,
          g.id as grupo_id,
          g.nombre as grupo_nombre,
          g.grado,
          g.seccion as grupo,
          g.escuela
        FROM alumnos a
        INNER JOIN grupos g ON a.grupo_id = g.id
        WHERE a.activo = TRUE
        ORDER BY g.escuela, g.grado, g.seccion, a.apellidos, a.nombre
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error en findAll:', error);
      throw error;
    }
  }

  /**
   * Obtener alumno por ID
   */
  static async findById(id) {
    try {
      const [rows] = await db.query(`
        SELECT 
          a.*,
          g.nombre as grupo_nombre,
          g.grado,
          g.seccion as grupo
        FROM alumnos a
        INNER JOIN grupos g ON a.grupo_id = g.id
        WHERE a.id = ?
      `, [id]);

      return rows[0];
    } catch (error) {
      logger.error(`Error en findById (${id}):`, error);
      throw error;
    }
  }

  /**
   * Crear nuevo alumno (genera qr_token automáticamente)
   */
  static async create(alumno) {
    try {
      const { nombre, apellidos, fecha_nacimiento, grupo_id, parent_email, parent_nombre, parent_telefono, curp } = alumno;
      const qr_token = generarQrToken();

      const [result] = await db.query(
        `INSERT INTO alumnos (nombre, apellidos, fecha_nacimiento, grupo_id, parent_email, parent_nombre, parent_telefono, curp, qr_token)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre, apellidos, fecha_nacimiento, grupo_id, parent_email, parent_nombre, parent_telefono, curp || null, qr_token]
      );

      logger.info(`Alumno creado: ${nombre} ${apellidos} (ID: ${result.insertId})`);
      return result.insertId;
    } catch (error) {
      logger.error('Error en create:', error);
      throw error;
    }
  }

  /**
   * Actualizar alumno
   */
  static async update(id, alumno) {
    try {
      const { nombre, apellidos, fecha_nacimiento, grupo_id, parent_email, parent_nombre, parent_telefono, curp } = alumno;

      const [result] = await db.query(
        `UPDATE alumnos 
         SET nombre = ?, apellidos = ?, fecha_nacimiento = ?, grupo_id = ?, 
             parent_email = ?, parent_nombre = ?, parent_telefono = ?, curp = ?
         WHERE id = ?`,
        [nombre, apellidos, fecha_nacimiento, grupo_id, parent_email, parent_nombre, parent_telefono, curp || null, id]
      );

      logger.info(`Alumno actualizado: ID ${id}`);
      return result.affectedRows;
    } catch (error) {
      logger.error(`Error en update (${id}):`, error);
      throw error;
    }
  }

  /**
   * Eliminar alumno (soft delete)
   */
  static async delete(id) {
    try {
      const [result] = await db.query('UPDATE alumnos SET activo = FALSE WHERE id = ?', [id]);

      logger.info(`Alumno desactivado: ID ${id}`);
      return result.affectedRows;
    } catch (error) {
      logger.error(`Error en delete (${id}):`, error);
      throw error;
    }
  }

  /**
   * Obtener alumnos por grupo con paginación
   */
  static async findByGrupo(grupoId, page = 1, limit = PAGINATION.DEFAULT_LIMIT) {
    try {
      page = parseInt(page) || 1;
      limit = Math.min(parseInt(limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
      const offset = (page - 1) * limit;

      const [countResult] = await db.query(
        'SELECT COUNT(*) as total FROM alumnos WHERE grupo_id = ? AND activo = TRUE',
        [grupoId]
      );
      const total = countResult[0].total;

      const [rows] = await db.query(`
        SELECT a.*, g.nombre as grupo_nombre, g.grado, g.seccion as grupo
        FROM alumnos a
        INNER JOIN grupos g ON a.grupo_id = g.id
        WHERE a.grupo_id = ? AND a.activo = TRUE
        ORDER BY a.apellidos, a.nombre
        LIMIT ? OFFSET ?
      `, [grupoId, limit, offset]);

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error(`Error en findByGrupo (${grupoId}):`, error);
      throw error;
    }
  }

  /**
   * Regenerar token QR de un alumno
   */
  static async regenerateQrToken(id) {
    try {
      const newToken = generarQrToken();
      const [result] = await db.query(
        'UPDATE alumnos SET qr_token = ? WHERE id = ? AND activo = TRUE',
        [newToken, id]
      );

      if (result.affectedRows === 0) {
        return null;
      }

      logger.info(`QR token regenerado para alumno ID ${id}`);
      return newToken;
    } catch (error) {
      logger.error(`Error en regenerateQrToken (${id}):`, error);
      throw error;
    }
  }
}

module.exports = Alumno;

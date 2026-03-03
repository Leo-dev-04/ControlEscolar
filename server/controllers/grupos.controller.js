const db = require('../config/database');

const gruposController = {
  // Obtener todos los grupos activos (filtrado por rol)
  async obtenerTodos(req, res) {
    try {
      const usuario = req.usuario;
      let query = `
        SELECT 
          g.*,
          u.nombre as maestro_nombre,
          COUNT(a.id) as total_alumnos
        FROM grupos g
        LEFT JOIN usuarios u ON g.maestro_id = u.id
        LEFT JOIN alumnos a ON g.id = a.grupo_id AND a.activo = TRUE
        WHERE g.activo = TRUE
      `;
      const params = [];

      // Si es maestro, solo mostrar sus grupos asignados
      if (usuario && usuario.rol === 'maestro') {
        query += ' AND g.maestro_id = ?';
        params.push(usuario.id);
      }

      query += ' GROUP BY g.id ORDER BY g.escuela, g.grado, g.seccion';

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error('Error al obtener grupos:', error);
      res.status(500).json({ error: 'Error al obtener grupos' });
    }
  },

  // Obtener un grupo por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const [rows] = await db.query(`
        SELECT 
          g.*,
          u.nombre as maestro_nombre,
          u.email as maestro_email
        FROM grupos g
        LEFT JOIN usuarios u ON g.maestro_id = u.id
        WHERE g.id = ?
      `, [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Grupo no encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error al obtener grupo:', error);
      res.status(500).json({ error: 'Error al obtener grupo' });
    }
  },

  // Crear un nuevo grupo
  async crear(req, res) {
    try {
      const { nombre, grado, seccion, maestro_id, ciclo_escolar, escuela } = req.body;

      if (!grado || !seccion || !escuela) {
        return res.status(400).json({
          error: 'Se requiere grado, sección y escuela'
        });
      }

      const nombreGrupo = `${grado}° ${seccion}`;

      const [result] = await db.query(
        `INSERT INTO grupos (nombre, escuela, grado, seccion, maestro_id, ciclo_escolar)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombreGrupo, escuela, grado, seccion, maestro_id || null, ciclo_escolar || '2024-2025']
      );

      res.json({
        success: true,
        id: result.insertId,
        message: 'Grupo creado correctamente'
      });
    } catch (error) {
      console.error('Error al crear grupo:', error);
      res.status(500).json({ error: 'Error al crear grupo' });
    }
  },

  // Actualizar un grupo
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, grado, seccion, maestro_id, ciclo_escolar, escuela } = req.body;

      const nombreGrupo = `${grado}° ${seccion}`;

      const [result] = await db.query(
        `UPDATE grupos 
         SET nombre = ?, escuela = ?, grado = ?, seccion = ?, maestro_id = ?, ciclo_escolar = ?
         WHERE id = ?`,
        [nombreGrupo, escuela, grado, seccion, maestro_id, ciclo_escolar, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Grupo no encontrado' });
      }

      res.json({
        success: true,
        message: 'Grupo actualizado correctamente'
      });
    } catch (error) {
      console.error('Error al actualizar grupo:', error);
      res.status(500).json({ error: 'Error al actualizar grupo' });
    }
  },

  // Desactivar un grupo
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      const [result] = await db.query(
        'UPDATE grupos SET activo = FALSE WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Grupo no encontrado' });
      }

      res.json({
        success: true,
        message: 'Grupo desactivado correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      res.status(500).json({ error: 'Error al eliminar grupo' });
    }
  }
};

module.exports = gruposController;

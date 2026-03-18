const UsuarioService = require('../services/usuarios.service');

exports.getAll = async (req, res) => {
  try {
    const usuarios = await UsuarioService.obtenerTodos();
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const usuario = await UsuarioService.obtenerPorId(req.params.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await UsuarioService.crear(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.status(201).json({ id: result.id, message: 'Usuario creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await UsuarioService.actualizar(req.params.id, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    res.json({ message: 'Usuario actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    await UsuarioService.eliminar(req.params.id);
    res.json({ message: 'Usuario desactivado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.destroy = async (req, res) => {
  try {
    const result = await UsuarioService.eliminarPermanente(req.params.id);
    if (!result.success) {
      return res.status(404).json({ error: result.message });
    }
    res.json({ message: 'Usuario eliminado permanentemente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignGroups = async (req, res) => {
  try {
    const { gruposIds } = req.body;
    if (!Array.isArray(gruposIds)) {
      return res.status(400).json({ error: 'gruposIds debe ser un array' });
    }

    await UsuarioService.asignarGrupos(req.params.id, gruposIds);
    res.json({ message: 'Grupos asignados exitosamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAssignedGroups = async (req, res) => {
  try {
    const grupos = await UsuarioService.obtenerGruposAsignados(req.params.id);
    res.json(grupos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

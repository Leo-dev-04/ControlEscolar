import api from './api'

export const usuariosService = {
    // Obtener todos los usuarios
    getAll: async () => {
        return await api.get('/usuarios')
    },

    // Obtener usuario por ID
    getById: async (id) => {
        return await api.get(`/usuarios/${id}`)
    },

    // Crear usuario
    create: async (datos) => {
        return await api.post('/usuarios', datos)
    },

    // Actualizar usuario
    update: async (id, datos) => {
        return await api.put(`/usuarios/${id}`, datos)
    },

    // Eliminar (desactivar) usuario
    delete: async (id) => {
        return await api.delete(`/usuarios/${id}`)
    },

    // Asignar grupos
    assignGroups: async (id, gruposIds) => {
        return await api.put(`/usuarios/${id}/grupos`, { gruposIds })
    },

    // Obtener grupos asignados
    getAssignedGroups: async (id) => {
        return await api.get(`/usuarios/${id}/grupos`)
    }
}

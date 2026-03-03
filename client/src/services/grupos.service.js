import api from './api';

export const gruposService = {
  obtenerTodos: () => api.get('/grupos'),
  obtenerPorId: (id) => api.get(`/grupos/${id}`),
  crear: (grupo) => api.post('/grupos', grupo),
  actualizar: (id, grupo) => api.put(`/grupos/${id}`, grupo),
  eliminar: (id) => api.delete(`/grupos/${id}`)
};

export default gruposService;

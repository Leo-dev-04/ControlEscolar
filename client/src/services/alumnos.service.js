import api from './api'

export const alumnosService = {
  getAll: () => api.get('/alumnos'),
  getById: (id) => api.get(`/alumnos/${id}`),
  create: (data) => api.post('/alumnos', data),
  update: (id, data) => api.put(`/alumnos/${id}`, data),
  delete: (id) => api.delete(`/alumnos/${id}`),
  regenerarQr: (id) => api.put(`/alumnos/${id}/regenerar-qr`)
}

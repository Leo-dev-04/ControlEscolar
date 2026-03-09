import api from './api'

export const reportesService = {
  getAll: () => api.get('/reportes'),
  getById: (id) => api.get(`/reportes/${id}`),
  getByAlumno: (alumnoId) => api.get(`/reportes/alumno/${alumnoId}`),
  generar: (data) => api.post('/reportes/generar', data),
  delete: (id) => api.delete(`/reportes/${id}`)
}

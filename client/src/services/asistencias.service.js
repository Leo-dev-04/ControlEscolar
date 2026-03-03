import api from './api';

export const asistenciasService = {
  registrar: (data) => api.post('/asistencias', data),
  obtenerPorFecha: (grupoId, fecha) => api.get('/asistencias', { params: { grupo_id: grupoId, fecha } }),
  obtenerResumen: (alumnoId, fechaInicio, fechaFin) => 
    api.get('/asistencias/resumen', { params: { alumno_id: alumnoId, fecha_inicio: fechaInicio, fecha_fin: fechaFin } })
};

export default asistenciasService;

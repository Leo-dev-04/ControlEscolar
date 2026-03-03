import api from './api';

export const conductaService = {
  registrar: (data) => api.post('/conducta', data),
  obtenerPorFecha: (grupoId, fecha) => api.get('/conducta', { params: { grupo_id: grupoId, fecha } }),
  obtenerResumen: (alumnoId, fechaInicio, fechaFin) =>
    api.get('/conducta/resumen', { params: { alumno_id: alumnoId, fecha_inicio: fechaInicio, fecha_fin: fechaFin } }),
  obtenerResumenDia: (grupoId, fecha) =>
    api.get('/conducta/resumen-dia', { params: { grupo_id: grupoId, fecha } })
};

export default conductaService;

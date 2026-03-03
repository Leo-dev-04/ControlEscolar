import api from './api';

export const tareasService = {
  crear: (tarea) => api.post('/tareas', tarea),
  registrarEntregas: (data) => api.post('/tareas/entregas', data),
  obtenerPorGrupo: (grupoId, fechaInicio, fechaFin) => 
    api.get('/tareas', { params: { grupo_id: grupoId, fecha_inicio: fechaInicio, fecha_fin: fechaFin } }),
  obtenerEntregas: (tareaId) => api.get(`/tareas/${tareaId}/entregas`),
  obtenerResumen: (alumnoId, fechaInicio, fechaFin) =>
    api.get('/tareas/resumen', { params: { alumno_id: alumnoId, fecha_inicio: fechaInicio, fecha_fin: fechaFin } })
};

export default tareasService;

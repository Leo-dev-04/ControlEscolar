-- Script para crear índices de optimización en la base de datos
-- Esto permite que el sistema responda más rápido cuando la cantidad de información crezca

-- 1. Optimizar búsqueda de alumnos por grupo
CREATE INDEX idx_alumnos_grupo ON alumnos(grupo_id);

-- 2. Optimizar búsqueda de asistencias por grupo y fecha
CREATE INDEX idx_asistencias_grupo_fecha ON asistencias(grupo_id, fecha);
CREATE INDEX idx_asistencias_alumno ON asistencias(alumno_id);

-- 3. Optimizar búsqueda de tareas
CREATE INDEX idx_tareas_grupo ON tareas(grupo_id);
CREATE INDEX idx_entregas_tarea ON entregas_tareas(tarea_id);
CREATE INDEX idx_entregas_alumno ON entregas_tareas(alumno_id);

-- 4. Optimizar búsqueda de conducta
CREATE INDEX idx_conducta_grupo_fecha ON conducta(grupo_id, fecha);
CREATE INDEX idx_conducta_alumno ON conducta(alumno_id);

-- 5. Optimizar búsqueda de grupos por maestro y por grado
CREATE INDEX idx_grupos_maestro ON grupos(maestro_id);
CREATE INDEX idx_grupos_grado_seccion ON grupos(grado, seccion);

-- 6. Reportes semanales
CREATE INDEX idx_reportes_grupo ON reportes_semanales(grupo_id);
CREATE INDEX idx_reportes_alumno ON reportes_semanales(alumno_id);

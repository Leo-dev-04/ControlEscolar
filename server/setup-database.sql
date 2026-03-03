-- Eliminar base de datos anterior si existe
DROP DATABASE IF EXISTS control_escolar_db;

-- Crear base de datos
CREATE DATABASE control_escolar_db;
USE control_escolar_db;

-- Tabla de Usuarios
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'maestro', 'director') NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_rol (rol),
  INDEX idx_activo (activo)
);

-- Tabla de Grupos
CREATE TABLE grupos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  escuela VARCHAR(100) NOT NULL DEFAULT 'Gabino Barreda',
  grado INT NOT NULL,
  seccion VARCHAR(10) NOT NULL,
  maestro_id INT,
  ciclo_escolar VARCHAR(20) DEFAULT '2025-2026',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (maestro_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_escuela (escuela),
  INDEX idx_grado_seccion (grado, seccion),
  INDEX idx_maestro (maestro_id),
  INDEX idx_activo (activo)
);

-- Tabla de Alumnos
CREATE TABLE alumnos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  fecha_nacimiento DATE,
  grupo_id INT NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  parent_nombre VARCHAR(100),
  parent_telefono VARCHAR(20),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE RESTRICT,
  INDEX idx_grupo (grupo_id),
  INDEX idx_activo (activo),
  INDEX idx_parent_email (parent_email),
  INDEX idx_apellidos (apellidos)
);

-- Tabla de Asistencias Diarias
CREATE TABLE asistencias (
  id INT PRIMARY KEY AUTO_INCREMENT,
  alumno_id INT NOT NULL,
  fecha DATE NOT NULL,
  estado ENUM('presente','falta','retardo') DEFAULT 'presente',
  observaciones TEXT,
  registrado_por INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id),
  UNIQUE KEY uk_alumno_fecha (alumno_id, fecha),
  INDEX idx_fecha (fecha),
  INDEX idx_alumno_fecha (alumno_id, fecha),
  INDEX idx_estado (estado)
);

-- Tabla de Tareas
CREATE TABLE tareas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  grupo_id INT NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha_asignacion DATE NOT NULL,
  fecha_entrega DATE NOT NULL,
  maestro_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
  FOREIGN KEY (maestro_id) REFERENCES usuarios(id),
  INDEX idx_grupo (grupo_id),
  INDEX idx_fecha_entrega (fecha_entrega),
  INDEX idx_grupo_fecha (grupo_id, fecha_entrega)
);

-- Tabla de Entregas de Tareas
CREATE TABLE entregas_tareas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tarea_id INT NOT NULL,
  alumno_id INT NOT NULL,
  entregada BOOLEAN DEFAULT TRUE,
  fecha_entrega TIMESTAMP,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  UNIQUE KEY uk_tarea_alumno (tarea_id, alumno_id),
  INDEX idx_alumno (alumno_id),
  INDEX idx_tarea (tarea_id)
);

-- Tabla de Conducta
CREATE TABLE conducta (
  id INT PRIMARY KEY AUTO_INCREMENT,
  alumno_id INT NOT NULL,
  fecha DATE NOT NULL,
  color ENUM('verde', 'amarillo', 'rojo') DEFAULT 'verde',
  observaciones TEXT,
  registrado_por INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  FOREIGN KEY (registrado_por) REFERENCES usuarios(id),
  UNIQUE KEY uk_alumno_fecha (alumno_id, fecha),
  INDEX idx_fecha (fecha),
  INDEX idx_alumno_fecha (alumno_id, fecha),
  INDEX idx_color (color)
);

-- Tabla de Reportes Semanales
CREATE TABLE reportes_semanales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  alumno_id INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  total_asistencias INT DEFAULT 0,
  total_faltas INT DEFAULT 0,
  total_retardos INT DEFAULT 0,
  total_tareas INT DEFAULT 0,
  tareas_entregadas INT DEFAULT 0,
  conducta_verde INT DEFAULT 0,
  conducta_amarillo INT DEFAULT 0,
  conducta_rojo INT DEFAULT 0,
  observaciones_conducta TEXT,
  fecha_envio TIMESTAMP NULL,
  enviado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
  UNIQUE KEY uk_alumno_fecha_inicio (alumno_id, fecha_inicio),
  INDEX idx_alumno (alumno_id),
  INDEX idx_fecha_inicio (fecha_inicio),
  INDEX idx_enviado (enviado)
);

-- Tabla de Log de Envíos
CREATE TABLE email_log (
  id INT PRIMARY KEY AUTO_INCREMENT,
  reporte_id INT NOT NULL,
  destinatario VARCHAR(255) NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  enviado BOOLEAN DEFAULT FALSE,
  fecha_envio TIMESTAMP NULL,
  error TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporte_id) REFERENCES reportes_semanales(id) ON DELETE CASCADE,
  INDEX idx_reporte (reporte_id),
  INDEX idx_enviado (enviado),
  INDEX idx_fecha_envio (fecha_envio)
);

-- Insertar datos de prueba con contraseñas hasheadas
-- Contraseñas: admin123, maestra123, maestro123 (hasheadas con bcrypt)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Administrador', 'admin@escuela.com', '$2a$10$eJF8Qwwr.Zht.jzDOorxAOi4RLH6b1B2QsPnPJbICwQlOtISPk9dC', 'admin'),
('Profesora Ana García', 'ana.garcia@escuela.com', '$2a$10$szoZkOVgm6fs5BpVqRs3S.dStf7XQ2HaHy2ARrYgCroH0I6rBKsxe', 'maestro'),
('Profesor Carlos López', 'carlos.lopez@escuela.com', '$2a$10$rRLZm5NRUpAws8eoIGLCf.2P924qAbHay0hU5RenT.QdHRhO6Gnt2', 'maestro');

INSERT INTO grupos (nombre, grado, seccion, maestro_id, ciclo_escolar) VALUES
('Primero A', 1, 'A', 2, '2025-2026'),
('Segundo B', 2, 'B', 3, '2025-2026'),
('Tercero A', 3, 'A', 2, '2025-2026');

INSERT INTO alumnos (nombre, apellidos, fecha_nacimiento, grupo_id, parent_email, parent_nombre) VALUES
('Juan', 'Pérez García', '2018-03-15', 1, 'padre.juan@gmail.com', 'Roberto Pérez'),
('María', 'López Hernández', '2018-06-20', 1, 'mama.maria@gmail.com', 'Laura Hernández'),
('Pedro', 'Martínez Silva', '2017-09-10', 2, 'papa.pedro@gmail.com', 'José Martínez'),
('Ana', 'González Ruiz', '2017-12-05', 2, 'mama.ana@gmail.com', 'Carmen Ruiz'),
('Luis', 'Ramírez Torres', '2016-04-18', 3, 'papa.luis@gmail.com', 'Miguel Ramírez');

SELECT 'Base de datos creada exitosamente con seguridad mejorada' as mensaje;
SELECT COUNT(*) as total_usuarios FROM usuarios;
SELECT COUNT(*) as total_grupos FROM grupos;
SELECT COUNT(*) as total_alumnos FROM alumnos;


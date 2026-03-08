-- ============================================
-- Migración: Eliminar email, agregar QR tokens
-- Ejecutar en la base de datos de producción
-- ============================================

-- 1. Agregar campo qr_token a alumnos
ALTER TABLE alumnos
ADD COLUMN qr_token VARCHAR(64) UNIQUE AFTER parent_telefono;

-- 2. Generar tokens para alumnos existentes
-- Cada alumno recibe un token único de 64 caracteres hex
UPDATE alumnos SET qr_token = CONCAT(
  HEX(FLOOR(RAND() * 4294967295)),
  HEX(FLOOR(RAND() * 4294967295)),
  HEX(FLOOR(RAND() * 4294967295)),
  HEX(FLOOR(RAND() * 4294967295)),
  HEX(FLOOR(RAND() * 4294967295)),
  HEX(FLOOR(RAND() * 4294967295)),
  HEX(FLOOR(RAND() * 4294967295)),
  HEX(FLOOR(RAND() * 4294967295))
) WHERE qr_token IS NULL;

-- Asegurar que cada token sea único (re-generar duplicados si los hay)
UPDATE alumnos a1
JOIN (
  SELECT MIN(id) as keep_id, qr_token
  FROM alumnos
  GROUP BY qr_token
  HAVING COUNT(*) > 1
) dupes ON a1.qr_token = dupes.qr_token AND a1.id != dupes.keep_id
SET a1.qr_token = CONCAT(
  HEX(FLOOR(RAND() * 4294967295)),
  HEX(FLOOR(RAND() * 4294967295)),
  HEX(FLOOR(RAND() * 4294967295)),
  HEX(FLOOR(RAND() * 4294967295)),
  LPAD(HEX(a1.id), 8, '0')
);

-- 3. Agregar índice para búsquedas por token
CREATE INDEX idx_qr_token ON alumnos(qr_token);

-- 4. Eliminar tabla de log de emails
DROP TABLE IF EXISTS email_log;

-- 5. Quitar columnas de email de reportes_semanales
ALTER TABLE reportes_semanales
DROP COLUMN IF EXISTS enviado,
DROP COLUMN IF EXISTS fecha_envio;

SELECT 'Migración completada exitosamente' as resultado;

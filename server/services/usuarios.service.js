const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { BCRYPT_ROUNDS, JWT } = require('../config/constants');
const logger = require('../utils/logger');

/**
 * Servicio de autenticación y gestión de usuarios
 */
class UsuarioService {
    /**
     * Autenticar usuario por email y contraseña
     */
    static async autenticar(email, password) {
        try {
            // Buscar usuario por email
            const [usuarios] = await db.query(
                'SELECT id, nombre, email, password, rol, activo FROM usuarios WHERE email = ?',
                [email]
            );

            if (usuarios.length === 0) {
                logger.warn(`Intento de login fallido: usuario no encontrado - ${email}`);
                return { success: false, message: 'Credenciales inválidas' };
            }

            const usuario = usuarios[0];

            // Verificar si el usuario está activo
            if (!usuario.activo) {
                logger.warn(`Intento de login de usuario inactivo: ${email}`);
                return { success: false, message: 'Usuario inactivo' };
            }

            // Comparar contraseña
            const passwordValida = await bcrypt.compare(password, usuario.password);

            if (!passwordValida) {
                logger.warn(`Intento de login fallido: contraseña incorrecta - ${email}`);
                return { success: false, message: 'Credenciales inválidas' };
            }

            // Generar token JWT
            const token = jwt.sign(
                {
                    id: usuario.id,
                    email: usuario.email,
                    rol: usuario.rol,
                    nombre: usuario.nombre
                },
                process.env.JWT_SECRET,
                { expiresIn: JWT.EXPIRES_IN }
            );

            logger.info(`Login exitoso: ${email}`);

            // No devolver la contraseña
            delete usuario.password;

            return {
                success: true,
                token,
                usuario
            };

        } catch (error) {
            logger.error('Error en autenticación:', error);
            throw error;
        }
    }

    /**
     * Crear nuevo usuario
     */
    static async crear(datosUsuario) {
        try {
            const { nombre, email, password, rol } = datosUsuario;

            // Verificar si el email ya existe
            const [existente] = await db.query(
                'SELECT id FROM usuarios WHERE email = ?',
                [email]
            );

            if (existente.length > 0) {
                return { success: false, message: 'El email ya está registrado' };
            }

            // Hashear contraseña
            const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

            // Insertar usuario
            const [result] = await db.query(
                'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
                [nombre, email, passwordHash, rol]
            );

            logger.info(`Nuevo usuario creado: ${email} (${rol})`);

            return {
                success: true,
                id: result.insertId
            };

        } catch (error) {
            logger.error('Error creando usuario:', error);
            throw error;
        }
    }

    /**
     * Obtener usuario por ID
     */
    static async obtenerPorId(id) {
        try {
            const [usuarios] = await db.query(
                'SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE id = ?',
                [id]
            );

            return usuarios[0] || null;

        } catch (error) {
            logger.error('Error obteniendo usuario:', error);
            throw error;
        }
    }

    /**
     * Actualizar contraseña
     */
    static async actualizarPassword(id, passwordAntigua, passwordNueva) {
        try {
            // Obtener contraseña actual
            const [usuarios] = await db.query(
                'SELECT password FROM usuarios WHERE id = ?',
                [id]
            );

            if (usuarios.length === 0) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            // Verificar contraseña antigua
            const passwordValida = await bcrypt.compare(passwordAntigua, usuarios[0].password);

            if (!passwordValida) {
                logger.warn(`Intento de cambio de contraseña fallido para usuario ID: ${id}`);
                return { success: false, message: 'Contraseña actual incorrecta' };
            }

            // Hashear nueva contraseña
            const passwordHash = await bcrypt.hash(passwordNueva, BCRYPT_ROUNDS);

            // Actualizar
            await db.query(
                'UPDATE usuarios SET password = ? WHERE id = ?',
                [passwordHash, id]
            );

            logger.info(`Contraseña actualizada para usuario ID: ${id}`);

            return { success: true };

        } catch (error) {
            logger.error('Error actualizando contraseña:', error);
            throw error;
        }
    }

    /**
     * Verificar token
     */
    static verificarToken(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return { success: true, decoded };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener todos los usuarios
     */
    static async obtenerTodos() {
        try {
            const [usuarios] = await db.query(
                'SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY nombre ASC'
            );
            return usuarios;
        } catch (error) {
            logger.error('Error obteniendo usuarios:', error);
            throw error;
        }
    }

    /**
     * Actualizar usuario
     */
    static async actualizar(id, datos) {
        try {
            const { nombre, email, rol, activo } = datos;

            // Verificar si el email ya existe en otro usuario
            if (email) {
                const [existente] = await db.query(
                    'SELECT id FROM usuarios WHERE email = ? AND id != ?',
                    [email, id]
                );

                if (existente.length > 0) {
                    return { success: false, message: 'El email ya está en uso por otro usuario' };
                }
            }

            const campos = [];
            const valores = [];

            if (nombre) { campos.push('nombre = ?'); valores.push(nombre); }
            if (email) { campos.push('email = ?'); valores.push(email); }
            if (rol) { campos.push('rol = ?'); valores.push(rol); }
            if (activo !== undefined) { campos.push('activo = ?'); valores.push(activo); }

            if (campos.length === 0) return { success: true };

            valores.push(id);

            await db.query(
                `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
                valores
            );

            logger.info(`Usuario actualizado: ID ${id}`);
            return { success: true };

        } catch (error) {
            logger.error('Error actualizando usuario:', error);
            throw error;
        }
    }

    /**
     * Eliminar (desactivar) usuario
     */
    static async eliminar(id) {
        try {
            await db.query('UPDATE usuarios SET activo = FALSE WHERE id = ?', [id]);
            logger.info(`Usuario desactivado: ID ${id}`);
            return { success: true };
        } catch (error) {
            logger.error('Error eliminando usuario:', error);
            throw error;
        }
    }

    /**
     * Eliminar permanentemente un usuario de la base de datos
     */
    static async eliminarPermanente(id) {
        try {
            const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                return { success: false, message: 'Usuario no encontrado' };
            }
            logger.info(`Usuario eliminado permanentemente: ID ${id}`);
            return { success: true };
        } catch (error) {
            logger.error('Error eliminando usuario permanentemente:', error);
            throw error;
        }
    }

    /**
     * Asignar grupos a un maestro
     */
    static async asignarGrupos(maestroId, gruposIds) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            // 1. Verificar que el usuario sea maestro
            const [usuario] = await connection.query('SELECT rol FROM usuarios WHERE id = ?', [maestroId]);
            if (usuario.length === 0 || usuario[0].rol !== 'maestro') {
                throw new Error('El usuario no es un maestro válido');
            }

            // 2. Liberar grupos que ya no están en la lista (poner maestro_id = NULL)
            // Primero obtenemos los grupos actuales del maestro
            const [gruposActuales] = await connection.query('SELECT id FROM grupos WHERE maestro_id = ?', [maestroId]);
            const idsActuales = gruposActuales.map(g => g.id);

            // Identificar grupos a desasignar (están en actuales pero no en nuevos)
            const aDesasignar = idsActuales.filter(id => !gruposIds.includes(id));

            if (aDesasignar.length > 0) {
                const placeholdersDesasignar = aDesasignar.map(() => '?').join(',');
                await connection.query(
                    `UPDATE grupos SET maestro_id = NULL WHERE id IN (${placeholdersDesasignar})`,
                    aDesasignar
                );
            }

            // 3. Asignar nuevos grupos
            if (gruposIds.length > 0) {
                // Verificar que los grupos existan
                const placeholdersGrupos = gruposIds.map(() => '?').join(',');
                const [gruposExisten] = await connection.query(
                    `SELECT id FROM grupos WHERE id IN (${placeholdersGrupos})`,
                    gruposIds
                );

                if (gruposExisten.length !== gruposIds.length) {
                    throw new Error('Uno o más grupos no existen');
                }

                // Actualizar maestro_id para los grupos seleccionados
                await connection.query(
                    `UPDATE grupos SET maestro_id = ? WHERE id IN (${placeholdersGrupos})`,
                    [maestroId, ...gruposIds]
                );
            }

            await connection.commit();
            logger.info(`Grupos actualizados para maestro ID ${maestroId}: [${gruposIds.join(', ')}]`);
            return { success: true };

        } catch (error) {
            await connection.rollback();
            logger.error('Error asignando grupos:', error);
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Obtener grupos asignados a un maestro
     */
    static async obtenerGruposAsignados(maestroId) {
        try {
            const [grupos] = await db.query(
                'SELECT id, nombre, grado, seccion, turno FROM grupos WHERE maestro_id = ? ORDER BY grado, seccion',
                [maestroId]
            );
            return grupos;
        } catch (error) {
            logger.error('Error obteniendo grupos asignados:', error);
            throw error;
        }
    }
}

module.exports = UsuarioService;

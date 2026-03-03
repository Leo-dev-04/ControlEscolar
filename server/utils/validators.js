const { body, param, query } = require('express-validator');

/**
 * Validadores reutilizables para diferentes entidades
 */

// Validadores de Alumnos
const alumnoValidators = {
    create: [
        body('nombre')
            .trim()
            .notEmpty()
            .withMessage('El nombre es requerido')
            .isLength({ min: 2, max: 100 })
            .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

        body('apellidos')
            .trim()
            .notEmpty()
            .withMessage('Los apellidos son requeridos')
            .isLength({ min: 2, max: 100 })
            .withMessage('Los apellidos deben tener entre 2 y 100 caracteres'),

        body('fecha_nacimiento')
            .optional()
            .isDate()
            .withMessage('Fecha de nacimiento inválida'),

        body('grupo_id')
            .notEmpty()
            .withMessage('El grupo es requerido')
            .isInt({ min: 1 })
            .withMessage('El grupo_id debe ser un número válido'),

        body('parent_email')
            .notEmpty()
            .withMessage('El email del padre/tutor es requerido')
            .isEmail()
            .withMessage('Email inválido')
            .normalizeEmail(),

        body('parent_nombre')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('El nombre del padre/tutor no puede exceder 100 caracteres'),

        body('parent_telefono')
            .optional()
            .trim()
            .matches(/^[0-9]{10}$/)
            .withMessage('El teléfono debe tener 10 dígitos')
    ],

    update: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID inválido'),

        body('nombre')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

        body('apellidos')
            .optional()
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage('Los apellidos deben tener entre 2 y 100 caracteres'),

        body('fecha_nacimiento')
            .optional()
            .isDate()
            .withMessage('Fecha de nacimiento inválida'),

        body('grupo_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('El grupo_id debe ser un número válido'),

        body('parent_email')
            .optional()
            .isEmail()
            .withMessage('Email inválido')
            .normalizeEmail(),

        body('parent_nombre')
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage('El nombre del padre/tutor no puede exceder 100 caracteres'),

        body('parent_telefono')
            .optional()
            .trim()
            .matches(/^[0-9]{10}$/)
            .withMessage('El teléfono debe tener 10 dígitos')
    ]
};

// Validadores de Grupos
const grupoValidators = {
    create: [
        body('nombre')
            .optional()
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage('El nombre debe tener entre 2 y 50 caracteres'),

        body('grado')
            .notEmpty()
            .withMessage('El grado es requerido')
            .isInt({ min: 1, max: 6 })
            .withMessage('El grado debe estar entre 1 y 6'),

        body('seccion')
            .trim()
            .notEmpty()
            .withMessage('La sección es requerida')
            .isLength({ min: 1, max: 10 })
            .withMessage('La sección debe tener entre 1 y 10 caracteres'),

        body('maestro_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('El maestro_id debe ser un número válido'),

        body('ciclo_escolar')
            .optional()
            .trim()
            .matches(/^\d{4}-\d{4}$/)
            .withMessage('El ciclo escolar debe tener formato YYYY-YYYY')
    ]
};

// Validadores de Asistencias
const asistenciaValidators = {
    create: [
        body('asistencias')
            .isArray({ min: 1 })
            .withMessage('Debe proporcionar al menos una asistencia'),

        body('asistencias.*.alumno_id')
            .isInt({ min: 1 })
            .withMessage('alumno_id inválido'),

        body('asistencias.*.estado')
            .isIn(['presente', 'falta', 'retardo'])
            .withMessage('El estado debe ser presente, falta o retardo'),

        body('asistencias.*.observaciones')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Las observaciones no pueden exceder 500 caracteres'),

        body('fecha')
            .notEmpty()
            .withMessage('La fecha es requerida')
            .isDate()
            .withMessage('Fecha inválida'),

        body('registrado_por')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Usuario inválido')
    ]
};

// Validadores de Tareas
const tareaValidators = {
    create: [
        body('grupo_id')
            .notEmpty()
            .withMessage('El grupo es requerido')
            .isInt({ min: 1 })
            .withMessage('grupo_id inválido'),

        body('titulo')
            .trim()
            .notEmpty()
            .withMessage('El título es requerido')
            .isLength({ min: 3, max: 200 })
            .withMessage('El título debe tener entre 3 y 200 caracteres'),

        body('descripcion')
            .optional({ nullable: true })
            .trim()
            .isLength({ max: 1000 })
            .withMessage('La descripción no puede exceder 1000 caracteres'),

        body('fecha_asignacion')
            .notEmpty()
            .withMessage('La fecha de asignación es requerida')
            .isDate()
            .withMessage('Fecha de asignación inválida'),

        body('fecha_entrega')
            .notEmpty()
            .withMessage('La fecha de entrega es requerida')
            .isDate()
            .withMessage('Fecha de entrega inválida'),

        body('maestro_id')
            .optional()
            .isInt({ min: 1 })
            .withMessage('maestro_id inválido')
    ]
};

// Validadores de Conducta
const conductaValidators = {
    create: [
        body('conductas')
            .isArray({ min: 1 })
            .withMessage('Debe proporcionar al menos un registro de conducta'),

        body('conductas.*.alumno_id')
            .isInt({ min: 1 })
            .withMessage('alumno_id inválido'),

        body('conductas.*.color')
            .isIn(['verde', 'amarillo', 'rojo'])
            .withMessage('El color debe ser verde, amarillo o rojo'),

        body('conductas.*.observaciones')
            .optional()
            .trim()
            .isLength({ max: 500 })
            .withMessage('Las observaciones no pueden exceder 500 caracteres'),

        body('fecha')
            .notEmpty()
            .withMessage('La fecha es requerida')
            .isDate()
            .withMessage('Fecha inválida'),

        body('registrado_por')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Usuario inválido')
    ]
};

// Validadores de Usuarios
const usuarioValidators = {
    create: [
        body('nombre')
            .trim()
            .notEmpty()
            .withMessage('El nombre es requerido')
            .isLength({ min: 2, max: 100 })
            .withMessage('El nombre debe tener entre 2 y 100 caracteres'),

        body('email')
            .notEmpty()
            .withMessage('El email es requerido')
            .isEmail()
            .withMessage('Email inválido')
            .normalizeEmail(),

        body('password')
            .notEmpty()
            .withMessage('La contraseña es requerida')
            .isLength({ min: 6 })
            .withMessage('La contraseña debe tener al menos 6 caracteres'),

        body('rol')
            .notEmpty()
            .withMessage('El rol es requerido')
            .isIn(['maestro', 'director'])
            .withMessage('Rol inválido. Los roles válidos son: maestro, director')
    ],

    login: [
        body('email')
            .notEmpty()
            .withMessage('El email es requerido')
            .isEmail()
            .withMessage('Email inválido')
            .normalizeEmail(),

        body('password')
            .notEmpty()
            .withMessage('La contraseña es requerida')
    ]
};

// Validadores de Reportes
const reporteValidators = {
    generar: [
        body('grupo_id')
            .notEmpty()
            .withMessage('El grupo es requerido')
            .isInt({ min: 1 })
            .withMessage('grupo_id inválido'),

        body('fecha_inicio')
            .optional()
            .isDate()
            .withMessage('Fecha de inicio inválida'),

        body('fecha_fin')
            .optional()
            .isDate()
            .withMessage('Fecha de fin inválida')
    ]
};

// Validadores comunes
const commonValidators = {
    id: [
        param('id')
            .isInt({ min: 1 })
            .withMessage('ID inválido')
    ],

    pagination: [
        query('page')
            .optional()
            .isInt({ min: 1 })
            .withMessage('La página debe ser un número mayor a 0'),

        query('limit')
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage('El límite debe estar entre 1 y 100')
    ]
};

module.exports = {
    alumnoValidators,
    grupoValidators,
    asistenciaValidators,
    tareaValidators,
    conductaValidators,
    usuarioValidators,
    reporteValidators,
    commonValidators
};

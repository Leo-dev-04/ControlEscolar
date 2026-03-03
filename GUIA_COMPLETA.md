# 📚 Sistema de Control Escolar Primaria — Guía Completa v2.0

> **Última actualización:** Febrero 2026  
> **Versión:** 2.0.0  
> **Licencia:** ISC

---

## 📖 1. Descripción General

El **Sistema de Control Escolar Primaria** es una aplicación web fullstack diseñada para gestionar la información académica y conductual de alumnos de educación primaria. Su objetivo principal es **eliminar la dependencia de WhatsApp** para la comunicación maestro-padre, reemplazándola por **reportes semanales automatizados por email**.

### 🎯 Problema que Resuelve

| Problema Actual | Solución del Sistema |
|---|---|
| Maestros pierden horas respondiendo mensajes de WhatsApp | Reportes automáticos enviados cada viernes |
| Padres ansiosos sin información del desempeño | Reporte semanal profesional con métricas claras |
| No hay historial documentado del alumno | Base de datos con registro diario de asistencia, tareas y conducta |
| Comunicación informal y desorganizada | Sistema formal con login, roles y reportes estandarizados |
| Maestros capturan datos en libretas físicas | Interfaz mobile-first para captura rápida desde celular |

### 👥 Usuarios del Sistema

| Rol | Permisos |
|---|---|
| **Admin** | Control total: crear usuarios, grupos, alumnos. Acceso a todo. |
| **Maestro** | Captura diaria (asistencia, tareas, conducta). Ve sus grupos asignados. |
| **Director** | Vista de lectura sobre todos los grupos y reportes. |

---

## 🛠️ 2. Tecnologías Utilizadas (Stack Tecnológico)

### Backend (Servidor)

| Tecnología | Versión | Función |
|---|---|---|
| **Node.js** | 18+ | Entorno de ejecución JavaScript del lado del servidor |
| **Express.js** | 4.18.2 | Framework web para crear la API REST |
| **MySQL** | 8.0+ | Base de datos relacional (ejecutado con XAMPP) |
| **mysql2** | 3.6.5 | Driver de conexión Node.js ↔ MySQL con soporte de Promises |
| **jsonwebtoken (JWT)** | 9.0.2 | Autenticación basada en tokens |
| **bcryptjs** | 2.4.3 | Encriptación de contraseñas con salt |
| **nodemailer** | 6.9.7 | Envío de emails SMTP (reportes a padres) |
| **node-cron** | 3.0.3 | Tareas programadas (envío automático los viernes) |
| **express-validator** | 7.3.1 | Validación de datos en cada endpoint |
| **express-rate-limit** | 7.5.1 | Protección contra ataques de fuerza bruta |
| **winston** | 3.18.3 | Sistema de logging profesional (archivos de log) |
| **dayjs** | 1.11.19 | Manipulación de fechas |
| **dotenv** | 16.3.1 | Variables de entorno desde archivo `.env` |
| **nodemon** | 3.0.2 | Auto-reinicio del servidor en desarrollo (devDependency) |

### Frontend (Cliente)

| Tecnología | Versión | Función |
|---|---|---|
| **React** | 18.2.0 | Librería de interfaces de usuario basada en componentes |
| **React DOM** | 18.2.0 | Renderizado del DOM |
| **React Router DOM** | 6.20.1 | Navegación SPA (Single Page Application) |
| **Axios** | 1.6.2 | Cliente HTTP para consumir la API REST |
| **Vite** | 5.0.8 | Herramienta de build ultrarrápida |
| **TailwindCSS** | 3.3.6 | Framework CSS utility-first para diseño responsivo |
| **PostCSS** | 8.4.32 | Procesador CSS |
| **Autoprefixer** | 10.4.16 | Prefijos CSS de compatibilidad |

### Infraestructura

| Herramienta | Función |
|---|---|
| **XAMPP** | Servidor Apache + MySQL local |
| **npm** | Gestor de paquetes Node.js |
| **Git** | Control de versiones |

---

## 📁 3. Estructura del Proyecto

```
Sistema de Control Escolar/
│
├── 📄 README.md                    # Documentación principal
├── 📄 GUIA_COMPLETA.md             # Esta guía
├── 📄 ESTADO_ACTUAL.md             # Estado del desarrollo
├── 📄 .gitignore                   # Archivos ignorados por Git
│
├── 📂 server/                      # ===== BACKEND =====
│   ├── server.js                   # 🚀 Punto de entrada del servidor
│   ├── package.json                # Dependencias del backend
│   ├── .env                        # Variables de entorno (secreto)
│   ├── .env.example                # Plantilla de variables de entorno
│   ├── setup-database.sql          # Script SQL para crear la BD completa
│   │
│   ├── 📂 config/                  # Configuración centralizada
│   │   ├── database.js             # Conexión MySQL (pool de conexiones)
│   │   ├── constants.js            # Constantes del sistema
│   │   └── env.validator.js        # Validador de variables de entorno
│   │
│   ├── 📂 controllers/             # Controladores (lógica de cada endpoint)
│   │   ├── auth.controller.js      # Login, perfil, refresh token, cambio password
│   │   ├── alumnos.controller.js   # CRUD de alumnos con paginación
│   │   ├── grupos.controller.js    # CRUD de grupos
│   │   ├── asistencias.controller.js # Registro y consulta de asistencias
│   │   ├── tareas.controller.js    # Crear tareas y registrar entregas
│   │   ├── conducta.controller.js  # Semáforo de conducta (verde/amarillo/rojo)
│   │   ├── reportes.controller.js  # Generar y enviar reportes semanales
│   │   └── usuarios.controller.js  # Gestión de usuarios del sistema
│   │
│   ├── 📂 routes/                  # Definición de rutas API
│   │   ├── auth.routes.js          # POST /api/auth/login, GET /api/auth/me, etc.
│   │   ├── alumnos.routes.js       # GET/POST/PUT/DELETE /api/alumnos
│   │   ├── grupos.routes.js        # GET/POST/PUT/DELETE /api/grupos
│   │   ├── asistencias.routes.js   # POST/GET /api/asistencias
│   │   ├── tareas.routes.js        # POST/GET /api/tareas
│   │   ├── conducta.routes.js      # POST/GET /api/conducta
│   │   ├── reportes.routes.js      # POST/GET /api/reportes
│   │   └── usuarios.routes.js      # GET/POST/PUT/DELETE /api/usuarios
│   │
│   ├── 📂 middlewares/             # Middleware de seguridad y control
│   │   ├── auth.middleware.js      # Verificación JWT + control de roles
│   │   ├── rateLimiter.middleware.js # Límite de peticiones por IP
│   │   ├── errorHandler.middleware.js # Manejo centralizado de errores
│   │   └── validation.middleware.js  # Validación con express-validator
│   │
│   ├── 📂 services/               # Lógica de negocio (capa de servicio)
│   │   ├── usuarios.service.js     # Operaciones de usuarios (hash, JWT, CRUD)
│   │   ├── reportes.service.js     # Consolidación semanal + generación de reportes
│   │   └── email.service.js        # Envío de emails con plantilla HTML profesional
│   │
│   ├── 📂 models/                  # Modelos de datos
│   ├── 📂 utils/                   # Utilidades
│   │   ├── logger.js               # Winston: logs a archivo y consola
│   │   ├── apiResponse.js          # Formato estándar de respuestas API
│   │   └── validators.js           # Validadores reutilizables
│   │
│   ├── 📂 cron/                    # Tareas programadas
│   │   └── envio-automatico.js     # Cron: envío de reportes los viernes
│   │
│   ├── 📂 scripts/                 # Scripts de utilidad
│   │   └── hashPasswords.js        # Script para hashear contraseñas
│   │
│   └── 📂 logs/                    # Archivos de log generados
│       ├── error.log               # Solo errores
│       └── combined.log            # Todos los eventos
│
└── 📂 client/                      # ===== FRONTEND =====
    ├── index.html                  # HTML principal (entrada de Vite)
    ├── package.json                # Dependencias del frontend
    ├── vite.config.js              # Configuración de Vite (proxy al backend)
    ├── tailwind.config.js          # Configuración de TailwindCSS
    ├── postcss.config.js           # Configuración de PostCSS
    │
    └── 📂 src/
        ├── main.jsx                # Punto de entrada React
        ├── App.jsx                 # Enrutador principal con rutas protegidas
        ├── index.css               # Estilos globales + imports de Tailwind
        │
        ├── 📂 context/            # Estado global de React
        │   └── AuthContext.jsx     # Contexto de autenticación (login/logout/user)
        │
        ├── 📂 pages/              # Páginas principales
        │   ├── Home.jsx            # Dashboard principal del maestro
        │   ├── Login.jsx           # Inicio de sesión con JWT
        │   ├── Alumnos.jsx         # CRUD completo de alumnos
        │   ├── AsistenciaDiaria.jsx # Captura rápida de asistencia
        │   ├── Tareas.jsx          # Crear tareas y marcar entregas
        │   ├── Conducta.jsx        # Semáforo de conducta
        │   ├── Reportes.jsx        # Ver y enviar reportes semanales
        │   └── Usuarios.jsx        # Gestión de usuarios (admin)
        │
        ├── 📂 components/         # Componentes reutilizables
        │   ├── Layout.jsx          # Layout con sidebar y navegación
        │   ├── ProtectedRoute.jsx  # Wrapper de rutas que requieren login
        │   ├── SelectorGrupos.jsx  # Dropdown de selección de grupos
        │   ├── ModalUsuario.jsx    # Modal para crear/editar usuarios
        │   └── ReporteParaPadres.jsx # Visualización del reporte para padres
        │
        └── 📂 services/           # Servicios de comunicación con la API
            ├── api.js              # Configuración base de Axios (interceptors, token)
            ├── authService.js      # Login, logout, getCurrentUser, token management
            ├── alumnos.service.js  # CRUD alumnos
            ├── grupos.service.js   # CRUD grupos
            ├── asistencias.service.js # Registro/consulta de asistencias
            ├── tareas.service.js   # Crear tareas, registrar entregas
            ├── conducta.service.js # Registro/consulta de conducta
            ├── reportes.service.js # Generar y consultar reportes
            └── usuarios.service.js # CRUD usuarios
```

---

## 🗄️ 4. Base de Datos (MySQL)

**Nombre:** `control_escolar_db`  
**Motor:** MySQL 8.0 (vía XAMPP)  
**Total de tablas:** 9

### Diagrama de Relaciones

```
┌─────────────┐        ┌─────────────┐
│  USUARIOS   │───────→│   GRUPOS    │
│  (maestros, │ 1    N │ (1ro A,     │
│  admin,     │        │  2do B...)  │
│  directores)│        └──────┬──────┘
└─────────────┘               │ 1
                              │
                    ┌─────────┴─────────┐
                    ↓ N                 │
              ┌───────────┐             │
              │  ALUMNOS  │             │
              │ (con email│             │
              │  de padre)│             │
              └─────┬─────┘             │
                    │ 1                 │
       ┌────────────┼────────────┐      │
       ↓ N          ↓ N          ↓ N    │
┌────────────┐ ┌──────────┐ ┌────────┐  │
│ASISTENCIAS │ │ CONDUCTA │ │ENTREGAS│  │
│ (diarias)  │ │(semáforo)│ │_TAREAS │  │
└────────────┘ └──────────┘ └────┬───┘  │
                                 │ N    │
                            ┌────┴───┐  │
                            │ TAREAS │←─┘
                            │(por    │
                            │ grupo) │
                            └────────┘
                    │
       consolidación semanal ↓
              ┌──────────────────┐
              │REPORTES_SEMANALES│
              │ (1 por alumno    │
              │  por semana)     │
              └────────┬─────────┘
                       │ 1
                       ↓ N
              ┌──────────────┐
              │  EMAIL_LOG   │
              │(registro de  │
              │ envíos)      │
              └──────────────┘
```

### Detalle de Cada Tabla

#### 1. `usuarios` — Maestros, Administradores, Directores
| Columna | Tipo | Descripción |
|---|---|---|
| id | INT PK AUTO_INCREMENT | Identificador único |
| nombre | VARCHAR(100) | Nombre completo |
| email | VARCHAR(100) UNIQUE | Email de acceso (login) |
| password | VARCHAR(255) | Contraseña hasheada con bcrypt |
| rol | ENUM('admin','maestro','director') | Rol del usuario |
| activo | BOOLEAN | Si la cuenta está activa |
| created_at | TIMESTAMP | Fecha de creación |

#### 2. `grupos` — Grados y Secciones
| Columna | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador |
| nombre | VARCHAR(50) | Nombre descriptivo ("Primero A") |
| grado | INT | Número de grado (1-6) |
| seccion | VARCHAR(10) | Sección ("A", "B") |
| maestro_id | INT FK → usuarios | Maestro asignado al grupo |
| ciclo_escolar | VARCHAR(20) | Ciclo escolar ("2025-2026") |
| activo | BOOLEAN | Si el grupo está activo |

#### 3. `alumnos` — Estudiantes
| Columna | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador |
| nombre | VARCHAR(100) | Nombre(s) del alumno |
| apellidos | VARCHAR(100) | Apellidos |
| fecha_nacimiento | DATE | Fecha de nacimiento |
| grupo_id | INT FK → grupos | Grupo al que pertenece |
| **parent_email** | **VARCHAR(255) NOT NULL** | **Email del padre/tutor (CRÍTICO)** |
| parent_nombre | VARCHAR(100) | Nombre del padre/tutor |
| parent_telefono | VARCHAR(20) | Teléfono de contacto |
| activo | BOOLEAN | Si el alumno está activo |

#### 4. `asistencias` — Registro Diario
| Columna | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador |
| alumno_id | INT FK → alumnos | Alumno |
| fecha | DATE | Fecha de la asistencia |
| presente | BOOLEAN | ¿Asistió? (default: true) |
| observaciones | TEXT | Notas opcionales |
| registrado_por | INT FK → usuarios | Maestro que registró |

#### 5. `tareas` — Tareas Asignadas por Grupo
| Columna | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador |
| grupo_id | INT FK → grupos | Grupo al que aplica |
| titulo | VARCHAR(200) | Nombre de la tarea |
| descripcion | TEXT | Descripción detallada |
| fecha_asignacion | DATE | Cuándo se asignó |
| fecha_entrega | DATE | Fecha límite de entrega |
| maestro_id | INT FK → usuarios | Maestro que la creó |

#### 6. `entregas_tareas` — Quién Entregó Cada Tarea
| Columna | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador |
| tarea_id | INT FK → tareas | La tarea |
| alumno_id | INT FK → alumnos | El alumno |
| entregada | BOOLEAN | ¿La entregó? |
| fecha_entrega | TIMESTAMP | Cuándo la entregó |
| observaciones | TEXT | Notas |

#### 7. `conducta` — Semáforo de Comportamiento
| Columna | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador |
| alumno_id | INT FK → alumnos | Alumno evaluado |
| fecha | DATE | Fecha |
| color | ENUM('verde','amarillo','rojo') | Evaluación (default: verde) |
| observaciones | TEXT | Razón del color |
| registrado_por | INT FK → usuarios | Maestro que evaluó |

#### 8. `reportes_semanales` — Consolidación Semanal
| Columna | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador |
| alumno_id | INT FK → alumnos | Alumno |
| fecha_inicio / fecha_fin | DATE | Rango de la semana |
| total_asistencias / total_faltas | INT | Conteo de asistencias |
| total_tareas / tareas_entregadas | INT | Conteo de tareas |
| conducta_verde / amarillo / rojo | INT | Conteo por color |
| observaciones_conducta | TEXT | Observaciones compiladas |
| enviado | BOOLEAN | Si el email fue enviado |
| fecha_envio | TIMESTAMP | Cuándo se envió |

#### 9. `email_log` — Registro de Emails Enviados
| Columna | Tipo | Descripción |
|---|---|---|
| id | INT PK | Identificador |
| reporte_id | INT FK → reportes_semanales | Reporte asociado |
| destinatario | VARCHAR(255) | Email del padre |
| asunto | VARCHAR(255) | Asunto del email |
| enviado | BOOLEAN | Si se envió exitosamente |
| error | TEXT | Mensaje de error (si falló) |

### Datos de Prueba Incluidos

El script `setup-database.sql` incluye datos de prueba:

| Tabla | Registros |
|---|---|
| usuarios | 3 (1 admin + 2 maestros) |
| grupos | 3 (1ro A, 2do B, 3ro A) |
| alumnos | 5 (con emails de padres) |

---

## 🔐 5. Seguridad Implementada

| Mecanismo | Tecnología | Descripción |
|---|---|---|
| **Autenticación** | JWT (jsonwebtoken) | Tokens seguros con expiración configurable |
| **Contraseñas** | bcryptjs | Hash con salt (nunca se guardan en texto plano) |
| **Validación de Input** | express-validator | Todos los endpoints validan datos de entrada |
| **Rate Limiting** | express-rate-limit | Limita peticiones por IP para prevenir ataques |
| **CORS** | cors | Solo acepta peticiones del frontend autorizado |
| **Control de Roles** | Middleware auth | Admin, Maestro, Director con permisos diferenciados |
| **Manejo de Errores** | Middleware centralizado | No expone detalles internos al cliente |
| **SQL Injection** | Prepared Statements | Queries parametrizadas con mysql2 |
| **Variables de Entorno** | env.validator.js | Valida que todas las variables requeridas existan |
| **Logging** | Winston | Registro de eventos en archivos para auditoría |

---

## 🌐 6. API REST — Endpoints Completos

**URL Base:** `http://localhost:3000/api`

### 🔑 Autenticación (`/api/auth`)
| Método | Ruta | Descripción | Público |
|---|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión | ✅ Sí |
| GET | `/api/auth/me` | Obtener perfil del usuario | 🔒 No |
| POST | `/api/auth/refresh` | Refrescar token JWT | 🔒 No |
| POST | `/api/auth/change-password` | Cambiar contraseña | 🔒 No |

### 👥 Alumnos (`/api/alumnos`)
| Método | Ruta | Descripción | Permiso |
|---|---|---|---|
| GET | `/api/alumnos?page=1&limit=20` | Listar alumnos (paginado) | 🔒 Auth |
| GET | `/api/alumnos/:id` | Obtener alumno por ID | 🔒 Auth |
| POST | `/api/alumnos` | Crear alumno | 🔒 Admin/Maestro |
| PUT | `/api/alumnos/:id` | Actualizar alumno | 🔒 Admin/Maestro |
| DELETE | `/api/alumnos/:id` | Desactivar alumno | 🔒 Solo Admin |

### 📚 Grupos (`/api/grupos`)
| Método | Ruta | Descripción | Permiso |
|---|---|---|---|
| GET | `/api/grupos` | Listar todos los grupos | 🔒 Auth |
| GET | `/api/grupos/:id` | Obtener grupo por ID | 🔒 Auth |
| POST | `/api/grupos` | Crear grupo | 🔒 Admin |
| PUT | `/api/grupos/:id` | Actualizar grupo | 🔒 Admin |
| DELETE | `/api/grupos/:id` | Desactivar grupo | 🔒 Admin |

### 📋 Asistencias (`/api/asistencias`)
| Método | Ruta | Descripción | Permiso |
|---|---|---|---|
| POST | `/api/asistencias` | Registrar asistencias del día | 🔒 Maestro |
| GET | `/api/asistencias?grupo_id=X&fecha=Y` | Consultar por fecha | 🔒 Auth |
| GET | `/api/asistencias/resumen?alumno_id=X&fecha_inicio=Y&fecha_fin=Z` | Resumen por alumno | 🔒 Auth |

### 📝 Tareas (`/api/tareas`)
| Método | Ruta | Descripción | Permiso |
|---|---|---|---|
| POST | `/api/tareas` | Crear nueva tarea | 🔒 Maestro |
| POST | `/api/tareas/entregas` | Registrar entregas | 🔒 Maestro |
| GET | `/api/tareas?grupo_id=X` | Listar tareas de un grupo | 🔒 Auth |
| GET | `/api/tareas/:id/entregas` | Ver entregas de una tarea | 🔒 Auth |
| GET | `/api/tareas/resumen?alumno_id=X&fecha_inicio=Y&fecha_fin=Z` | Resumen por alumno | 🔒 Auth |

### 🚦 Conducta (`/api/conducta`)
| Método | Ruta | Descripción | Permiso |
|---|---|---|---|
| POST | `/api/conducta` | Registrar conductas del día | 🔒 Maestro |
| GET | `/api/conducta?grupo_id=X&fecha=Y` | Consultar por fecha | 🔒 Auth |
| GET | `/api/conducta/resumen?alumno_id=X&fecha_inicio=Y&fecha_fin=Z` | Resumen por alumno | 🔒 Auth |
| GET | `/api/conducta/resumen-dia?grupo_id=X&fecha=Y` | Resumen del día por colores | 🔒 Auth |

### 📊 Reportes (`/api/reportes`)
| Método | Ruta | Descripción | Permiso |
|---|---|---|---|
| GET | `/api/reportes` | Listar reportes generados | 🔒 Auth |
| POST | `/api/reportes/generar` | Generar reportes semanales | 🔒 Admin/Maestro |
| POST | `/api/reportes/enviar/:id` | Enviar reporte por email | 🔒 Admin/Maestro |

### 👤 Usuarios (`/api/usuarios`)
| Método | Ruta | Descripción | Permiso |
|---|---|---|---|
| GET | `/api/usuarios` | Listar usuarios | 🔒 Admin |
| POST | `/api/usuarios` | Crear nuevo usuario | 🔒 Admin |
| PUT | `/api/usuarios/:id` | Actualizar usuario | 🔒 Admin |
| DELETE | `/api/usuarios/:id` | Desactivar usuario | 🔒 Admin |

### 🛠️ Utilidades (públicas)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/health` | Estado del servidor |
| GET | `/api/test-db` | Probar conexión a la BD |

---

## 🖥️ 7. Frontend — Páginas y Componentes

### Páginas (8 vistas)

| Página | Archivo | Descripción |
|---|---|---|
| **Home** | `Home.jsx` | Dashboard del maestro con accesos rápidos a captura diaria, flujo de trabajo explicado, y beneficios del sistema |
| **Login** | `Login.jsx` | Pantalla de inicio de sesión con validación de credenciales JWT |
| **Alumnos** | `Alumnos.jsx` | CRUD completo: listar, agregar, editar y eliminar alumnos. Tiene selector de grupo y campos de padre/tutor |
| **Asistencia** | `AsistenciaDiaria.jsx` | Captura rápida: por defecto todos presentes, un clic para marcar ausencia |
| **Tareas** | `Tareas.jsx` | Crear tareas por grupo y marcar quién no la entregó |
| **Conducta** | `Conducta.jsx` | Semáforo: asignar verde/amarillo/rojo por alumno con notas opcionales |
| **Reportes** | `Reportes.jsx` | Generar, visualizar y enviar reportes semanales consolidados |
| **Usuarios** | `Usuarios.jsx` | Gestión de cuentas de maestros/directores (solo admin) |

### Componentes Reutilizables (5)

| Componente | Función |
|---|---|
| `Layout.jsx` | Sidebar de navegación + header. Responsivo para escritorio y celular |
| `ProtectedRoute.jsx` | HOC que redirige a `/login` si no hay sesión activa |
| `SelectorGrupos.jsx` | Dropdown que carga los grupos desde la API |
| `ModalUsuario.jsx` | Modal para crear o editar usuarios con validación de campos |
| `ReporteParaPadres.jsx` | Vista de previsualización del reporte que reciben los padres |

### Servicios del Frontend (9)

| Servicio | Función |
|---|---|
| `api.js` | Configuración global de Axios: base URL, interceptors, inyección automática del token JWT en cada petición |
| `authService.js` | Login, logout, almacenamiento del token en localStorage, `getCurrentUser()` |
| `alumnos.service.js` | Operaciones CRUD de alumnos vía API |
| `grupos.service.js` | Operaciones CRUD de grupos vía API |
| `asistencias.service.js` | Enviar y consultar asistencias vía API |
| `tareas.service.js` | Crear tareas y registrar entregas vía API |
| `conducta.service.js` | Registrar y consultar conducta vía API |
| `reportes.service.js` | Generar y consultar reportes vía API |
| `usuarios.service.js` | Operaciones CRUD de usuarios vía API |

### Sistema de Autenticación del Frontend

- `AuthContext.jsx` provee un contexto React con: `usuario`, `login()`, `logout()`, `isAuthenticated`, `loading`
- `ProtectedRoute.jsx` valida si hay sesión; si no, redirige a `/login`
- El token JWT se almacena en `localStorage` y se inyecta automáticamente en los headers de Axios

---

## 📧 8. Motor de Reportes y Emails

### Flujo de Reportes Semanales

```
Lun-Jue: Maestro captura datos diarios
            ↓
     Viernes: Se ejecuta consolidación
            ↓
   reportes.service.js:
   ┌─ consolidarSemanaAlumno() → cuenta asistencias, tareas, conducta
   ├─ generarReportesGrupo()   → consolida todos los alumnos del grupo
   └─ generarYEnviarReportesSemanales() → procesa TODOS los grupos
            ↓
   email.service.js:
   ├─ generarHTMLReporte()     → plantilla HTML profesional con:
   │   • Información del alumno (nombre, grupo, período)
   │   • Porcentaje de asistencia con barra de progreso
   │   • Porcentaje de tareas completadas con barra de progreso
   │   • Semáforo de conducta con emojis (😊/😐/😟)
   │   • Observaciones del maestro
   │   • Estilo premium con gradientes y diseño responsivo
   ├─ enviarReporteIndividual() → envía a un padre
   └─ enviarReportesMasivos()   → envía a todos (con pausa de 1s entre envíos)
            ↓
   email_log: Se registra cada envío (éxito o error)
```

### Envío Automático con Cron

El archivo `cron/envio-automatico.js` configura un cron job que se ejecuta **todos los viernes a las 14:00** (zona horaria: América/Ciudad de México). Se activa con la variable `AUTO_SEND_ENABLED=true` en `.env`.

---

## ⚙️ 9. Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- XAMPP (MySQL corriendo)
- npm

### Paso 1: Clonar/descargar el proyecto

### Paso 2: Crear la base de datos
```bash
# En MySQL Workbench, phpMyAdmin, o terminal:
mysql -u root -p < server/setup-database.sql
```

### Paso 3: Configurar variables de entorno
```bash
cd server
cp .env.example .env
# Editar .env con tus datos:
```

**Variables requeridas en `.env`:**
```env
# Base de Datos
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=control_escolar_db

# JWT
JWT_SECRET=tu_clave_secreta_de_64_caracteres_minimo

# Frontend
FRONTEND_URL=http://localhost:5173

# Email (para enviar reportes a padres)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx   # App Password de Gmail

# Configuración opcional
AUTO_SEND_ENABLED=false
NODE_ENV=development
```

### Paso 4: Instalar dependencias
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Paso 5: Iniciar el sistema
```bash
# Terminal 1 - Backend
cd server
npm run dev
# → Servidor en http://localhost:3000

# Terminal 2 - Frontend
cd client
npm run dev
# → Interfaz en http://localhost:5173
```

---

## 🔑 10. Usuarios de Prueba

| Email | Contraseña | Rol |
|---|---|---|
| admin@escuela.com | admin123 | Admin |
| ana.garcia@escuela.com | maestra123 | Maestro |
| carlos.lopez@escuela.com | maestro123 | Maestro |

---

## ✅ 11. Estado Actual del Sistema

### ✅ Implementado y Funcional

| Módulo | Estado | Detalles |
|---|---|---|
| **Autenticación JWT** | ✅ Completo | Login, logout, refresh token, cambio de contraseña, rutas protegidas |
| **Base de datos** | ✅ Completo | 9 tablas con índices optimizados, datos de prueba, foreign keys |
| **API REST** | ✅ Completo | 8 módulos de rutas con controllers completos |
| **Seguridad** | ✅ Completo | JWT, bcrypt, rate limiting, validación, CORS, logging |
| **CRUD de Alumnos** | ✅ Completo | Frontend + Backend, con paginación y campos de padre/tutor |
| **CRUD de Grupos** | ✅ Completo | Frontend + Backend |
| **CRUD de Usuarios** | ✅ Completo | Frontend + Backend, con modal y roles |
| **Captura de Asistencia** | ✅ Completo | Frontend + Backend |
| **Captura de Tareas** | ✅ Completo | Frontend + Backend |
| **Captura de Conducta** | ✅ Completo | Frontend + Backend (semáforo) |
| **Motor de Reportes** | ✅ Completo | Backend: consolidación semanal + envío de emails |
| **Plantilla de Email** | ✅ Completo | HTML profesional con gradientes, barras de progreso, emojis |
| **Cron Job** | ✅ Completo | Envío automático los viernes (configurable) |
| **Frontend React** | ✅ Completo | 8 páginas, 5 componentes, Tailwind, responsivo |
| **AuthContext** | ✅ Completo | Estado global de autenticación en React |
| **Servicios Frontend** | ✅ Completo | 9 servicios Axios conectados a la API |

### ⏳ Pendiente / Mejoras Futuras

| Mejora | Prioridad | Descripción |
|---|---|---|
| Configurar SMTP real | Alta | Configurar un email real de Gmail con App Password para enviar reportes |
| Pruebas automatizadas | Media | Tests unitarios e integración con Jest |
| Documentación Swagger | Baja | Documentar la API con OpenAPI/Swagger |
| Despliegue a producción | Media | Deploy a un servidor (VPS, Vercel, Railway, etc.) |
| Dashboard de estadísticas | Baja | Gráficas con Chart.js para el director |

---

## 🧪 12. Cómo Probar el Sistema

### Verificación Rápida
```bash
# 1. Health check del servidor
curl http://localhost:3000/api/health

# 2. Prueba de conexión a BD
curl http://localhost:3000/api/test-db

# 3. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@escuela.com","password":"admin123"}'
```

### Flujo Completo de Prueba

1. **Abrir** `http://localhost:5173`
2. **Iniciar sesión** con `admin@escuela.com` / `admin123`
3. **Ir a Alumnos** → Verificar que se listan los 5 alumnos de prueba
4. **Ir a Asistencia** → Seleccionar grupo → Tomar asistencia
5. **Ir a Tareas** → Crear una tarea → Marcar entregas
6. **Ir a Conducta** → Evaluar conducta con semáforo
7. **Ir a Reportes** → Generar reporte semanal → Enviar por email

---

## 📊 13. Arquitectura del Sistema

```
┌──────────────────────────────────────────────────┐
│                   USUARIO                        │
│         (Maestro / Admin / Director)             │
│              Navegador Web                       │
└─────────────────────┬────────────────────────────┘
                      │ HTTP (puerto 5173)
┌─────────────────────▼────────────────────────────┐
│              FRONTEND (React 18)                 │
│  ┌──────────────────────────────────────────┐    │
│  │ App.jsx (Router + AuthProvider)          │    │
│  │  ├── Login.jsx (público)                 │    │
│  │  └── ProtectedRoute → Layout             │    │
│  │       ├── Home.jsx                       │    │
│  │       ├── Alumnos.jsx                    │    │
│  │       ├── AsistenciaDiaria.jsx           │    │
│  │       ├── Tareas.jsx                     │    │
│  │       ├── Conducta.jsx                   │    │
│  │       ├── Reportes.jsx                   │    │
│  │       └── Usuarios.jsx                   │    │
│  └──────────────────────────────────────────┘    │
│  Services → Axios → api.js (interceptors + JWT) │
└─────────────────────┬────────────────────────────┘
                      │ HTTP API REST (puerto 3000)
                      │ Headers: Authorization: Bearer <JWT>
┌─────────────────────▼────────────────────────────┐
│             BACKEND (Express.js)                 │
│  ┌──────────────────────────────────────────┐    │
│  │ Middlewares:                              │    │
│  │  ├── CORS (origen restringido)           │    │
│  │  ├── Rate Limiter                        │    │
│  │  ├── Auth Middleware (JWT + Roles)        │    │
│  │  ├── Validation Middleware               │    │
│  │  └── Error Handler                       │    │
│  ├──────────────────────────────────────────│    │
│  │ Routes → Controllers → Services          │    │
│  │  ├── auth (login, me, refresh, password) │    │
│  │  ├── alumnos (CRUD + paginación)         │    │
│  │  ├── grupos (CRUD)                       │    │
│  │  ├── asistencias (registro + consulta)   │    │
│  │  ├── tareas (CRUD + entregas)            │    │
│  │  ├── conducta (semáforo + resumen)       │    │
│  │  ├── reportes (generar + enviar)         │    │
│  │  └── usuarios (CRUD admin)               │    │
│  ├──────────────────────────────────────────│    │
│  │ Services:                                │    │
│  │  ├── usuarios.service.js (bcrypt, JWT)   │    │
│  │  ├── reportes.service.js (consolidación) │    │
│  │  └── email.service.js (nodemailer)       │    │
│  ├──────────────────────────────────────────│    │
│  │ Cron: envio-automatico.js (viernes 14:00)│    │
│  │ Logger: Winston → logs/error.log         │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────┬────────────────────────────┘
                      │ mysql2 (pool de conexiones)
┌─────────────────────▼────────────────────────────┐
│           BASE DE DATOS (MySQL 8.0)              │
│           control_escolar_db                     │
│  9 tablas con índices y foreign keys             │
│  Ejecutado con XAMPP                             │
└──────────────────────────────────────────────────┘
```

---

## 📞 14. Resumen Ejecutivo

El **Sistema de Control Escolar Primaria v2.0** es una aplicación web completa que consta de:

- **Backend:** API REST con 30+ endpoints protegidos por autenticación JWT, validación de datos, rate limiting y logging.
- **Frontend:** Interfaz React moderna con 8 páginas, diseño responsivo mobile-first usando TailwindCSS, y sistema de autenticación completo.
- **Base de datos:** MySQL con 9 tablas normalizadas, índices optimizados y relaciones con foreign keys.
- **Motor de reportes:** Consolidación semanal automática de asistencia, tareas y conducta, con envío de emails HTML profesionales a los padres de familia.
- **Seguridad:** 10 mecanismos de seguridad implementados incluyendo JWT, bcrypt, prepared statements, CORS y rate limiting.

El sistema está **funcionalmente completo** y listo para uso local. Para producción, solo requiere configurar un servidor de email real (SMTP) y desplegarse en un servidor.

---

*Sistema Control Escolar Primaria v2.0 — Febrero 2026*

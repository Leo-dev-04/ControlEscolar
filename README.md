# 🎓 Sistema de Control Escolar - v2.0

Sistema profesional de gestión escolar para educación primaria con seguridad empresarial.

## ✨ Características

### 🔒 Seguridad
- **Autenticación JWT** - Tokens seguros con expiración configurab le
- **Contraseñas Hasheadas** - Bcrypt con salt rounds
- **Validación Robusta** - Express-validator en todos los endpoints
- **Rate Limiting** - Protección contra ataques de fuerza bruta
- **CORS Restrictivo** - Solo orígenes autorizados
- **Control de Acceso** - Basado en roles (Admin, Maestro, Director)

### 📊 Funcionalidades
- ✅ Gestión de Alumnos (con paginación)
- ✅ Gestión de Grupos
- ✅ Registro de Asistencias Diarias
- ✅ Asignación y Seguimiento de Tareas
- ✅ Control de Conducta (semáforo: verde/amarillo/rojo)
- ✅ Generación de Reportes Semanales
- ✅ Envío Automático de Reportes por Email
- ✅ Cron Jobs Programables

### 🛠️ Tecnologías

**Backend:**
- Node.js + Express
- MySQL con índices optimizados
- JWT Authentication
- Winston Logger
- Express Validator
- Rate Limiter
- Bcrypt
- Nodemailer
- Node-cron
- Day.js

**Frontend:**
- React 18
- Vite
- TailwindCSS
- Axios
- React Router

## 🚀 Instalación Rápida

```bash
# 1. Clonar e instalar dependencias
cdserver
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env y configurar JWT_SECRET, DB_*, SMTP_*

# 3. Crear base de datos
mysql -u root -p < setup-database.sql

# 4. Iniciar servidor
npm run dev

# 5. En otra terminal, iniciar frontend
cd ../client
npm install
npm run dev
```

## 📚 Documentación

- [Guía de Instalación Completa](../../.gemini/antigravity/brain/68b41684-ceea-4aed-a1f6-81a1bb65abfd/guia_instalacion.md)
- [Análisis del Sistema](../../.gemini/antigravity/brain/68b41684-ceea-4aed-a1f6-81a1bb65abfd/analisis_del_sistema.md)
- [Plan de Implementación](../../.gemini/antigravity/brain/68b41684-ceea-4aed-a1f6-81a1bb65abfd/implementation_plan.md)

## 🔑 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@escuela.com | admin123 | Admin |
| ana.garcia@escuela.com | maestra123 | Maestro |
| carlos.lopez@escuela.com | maestro123 | Maestro |

## 🔐 Autenticación API

Todas las rutas (excepto `/api/auth/login`) requieren autenticación JWT.

**1. Login:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@escuela.com",
  "password": "admin123"
}
```

**2. Usar Token en Requests:**
```bash
GET /api/alumnos
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📡 Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Perfil del usuario
- `POST /api/auth/refresh` - Refrescar token
- `POST /api/auth/change-password` - Cambiar contraseña

### Alumnos
- `GET /api/alumnos?page=1&limit=20` - Listar con paginación
- `GET /api/alumnos/:id` - Obtener por ID
- `POST /api/alumnos` - Crear (Admin/Maestro)
- `PUT /api/alumnos/:id` - Actualizar (Admin/Maestro)
- `DELETE /api/alumnos/:id` - Eliminar (Solo Admin)

### Grupos
- `GET /api/grupos` - Listar todos
- `POST /api/grupos` - Crear nuevo
- `PUT /api/grupos/:id` - Actualizar
- `DELETE /api/grupos/:id` - Eliminar

### Asistencias
- `POST /api/asistencias` - Registrar asistencias del día
- `GET /api/asistencias?grupo_id=1&fecha=2025-01-15`

### Tareas
- `POST /api/tareas` - Crear tarea
- `POST /api/tareas/entregas` - Registrar entregas
- `GET /api/tareas?grupo_id=1`

### Conducta
- `POST /api/conducta` - Registrar conductas del día
- `GET /api/conducta?grupo_id=1&fecha=2025-01-15`

### Reportes
- `POST /api/reportes/generar` - Generar reportes semanales
- `GET /api/reportes` - Listar reportes

## 🔧 Configuración

### Variables de Entorno (.env)

```env
# Base de Datos
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=control_escolar_db

# JWT (generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=tu_jwt_secret_de_64_caracteres_minimo

# Frontend
FRONTEND_URL=http://localhost:5173

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password

# Opcional
AUTO_SEND_ENABLED=false
NODE_ENV=development
```

## 📊 Estructura del Proyecto

```
server/
├── config/
│   ├── database.js          # Configuración MySQL
│   ├── constants.js          # Constantes centralizadas
│   └── env.validator.js      # Validador de variables de entorno
├── controllers/              # Controladores de rutas
├── middlewares/
│   ├── auth.middleware.js    # Autenticación JWT
│   ├── rateLimiter.middleware.js
│   ├── errorHandler.middleware.js
│   └── validation.middleware.js
├── models/                   # Modelos de datos
├── routes/                   # Definición de rutas
├── services/                 # Lógica de negocio
│   ├── usuarios.service.js
│   ├── reportes.service.js
│   └── email.service.js
├── utils/
│   ├── logger.js            # Winston logger
│   ├── apiResponse.js       # Respuestas estandarizadas
│   └── validators.js        # Validadores reutilizables
├── cron/                    # Tareas programadas
├── scripts/                 # Scripts de utilidad
├── logs/                    # Archivos de log
└── server.js               # Punto de entrada

client/
├── src/
│   ├── components/         # Componentes React
│   ├── pages/              # Páginas
│   ├── services/           # Servicios API
│   └── App.jsx
└── package.json
```

## 🛡️ Seguridad Implementada

✅ **Autenticación**: JWT con secret seguro  
✅ **Autorización**: Control de acceso por roles  
✅ **Validación**: Todos los inputs validados  
✅ **Rate Limiting**: Protección contra abuso  
✅ **CORS**: Solo orígenes permitidos  
✅ **Error Handling**: Sin exposición de detalles internos  
✅ **Logging**: Winston para auditoría  
✅ **Contraseñas**: Hasheadas con bcrypt  
✅ **SQL Injection**: Prepared statements  
✅ **Variables de Entorno**: Validadas al inicio  

## 📈 Performance

✅ **Paginación**: Listados grandes optimizados  
✅ **Índices DB**: Consultas rápidas  
✅ **Connection Pool**: MySQL pool configurado  
✅ **Rate Limiting**: Previene sobrecarga  

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Test DB
curl http://localhost:3000/api/test-db

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@escuela.com","password":"admin123"}'
```

## 📝 Logs

Los logs se guardan automáticamente en:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los eventos

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/mejora`)
3. Commit cambios (`git commit -am 'Agregar mejora'`)
4. Push (`git push origin feature/mejora`)
5. Crear Pull Request

## 📄 Licencia

ISC

## 👨‍💻 Autor

Sistema Control Escolar v2.0 - 2025

---

**Versión**: 2.0.0  
**Última Actualización**: Noviembre 2025  
**Estado**: Producción Ready ✅

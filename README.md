# TechHelpDesk API

Sistema de gestión de tickets de soporte técnico desarrollado con NestJS, TypeORM y PostgreSQL.

**Desarrollador:** Juanes Velez  
**Clan:** Riwi

## 📋 Descripción

TechHelpDesk es una API REST que permite administrar todo el ciclo de vida de los tickets de soporte técnico. El sistema incluye autenticación JWT, control de roles, validaciones de negocio y documentación completa con Swagger.

## 🚀 Características

- ✅ Autenticación JWT
- ✅ Control de acceso basado en roles (Admin, Técnico, Cliente)
- ✅ CRUD completo de tickets, usuarios, técnicos, clientes y categorías
- ✅ Validación de secuencia de estados de tickets
- ✅ Validación de máximo 5 tickets en progreso por técnico
- ✅ Documentación Swagger
- ✅ Interceptor para formatear respuestas
- ✅ Exception Filter personalizado
- ✅ Pruebas unitarias con Jest

## 🛠️ Tecnologías

- **NestJS** - Framework Node.js
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Base de datos
- **JWT** - Autenticación
- **Swagger** - Documentación API
- **Jest** - Testing
- **Docker** - Contenedores

## 📦 Instalación

### Requisitos previos

- Node.js (v18 o superior)
- PostgreSQL (v14 o superior)
- npm o yarn

### Pasos de instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd TechHelpDesk
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/techhelpdesk

# JWT
JWT_SECRET=tu_secreto_jwt_super_seguro_aqui

# Puerto de la aplicación
PORT=3000
```

4. Ejecutar migraciones y seeders:
```bash
# Ejecutar el script SQL de seeders (seed.sql)
psql -U usuario -d techhelpdesk -f seed.sql
```

5. Iniciar la aplicación:
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

## 📚 Documentación API

Una vez que la aplicación esté corriendo, accede a la documentación Swagger en:

**URL:** http://localhost:3000/api/docs

### Autenticación

La mayoría de los endpoints requieren autenticación JWT. Para autenticarte:

1. Registra un usuario: `POST /api/auth/register`
2. Inicia sesión: `POST /api/auth/login`
3. Usa el token JWT en el header: `Authorization: Bearer <token>`

## 🔐 Roles y Permisos

### Administrador
- CRUD completo de usuarios, técnicos, clientes, categorías y tickets
- Acceso a todos los endpoints

### Técnico
- Consultar tickets asignados
- Actualizar estado de tickets asignados
- Listar tickets por técnico

### Cliente
- Crear nuevos tickets
- Consultar su historial de tickets
- Ver detalles de sus tickets

## 📍 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión

### Tickets
- `POST /api/tickets` - Crear ticket (Cliente)
- `GET /api/tickets` - Listar todos los tickets
- `GET /api/tickets/:id` - Obtener ticket por ID
- `GET /api/tickets/client/:id` - Tickets por cliente
- `GET /api/tickets/technician/:id` - Tickets por técnico
- `PATCH /api/tickets/:id/status` - Actualizar estado del ticket
- `PUT /api/tickets/:id` - Actualizar ticket completo
- `DELETE /api/tickets/:id` - Eliminar ticket (Admin)

### Usuarios
- `GET /api/users` - Listar usuarios (Admin)
- `GET /api/users/:id` - Obtener usuario (Admin)
- `POST /api/users` - Crear usuario (Admin)
- `PUT /api/users/:id` - Actualizar usuario (Admin)
- `DELETE /api/users/:id` - Eliminar usuario (Admin)

### Categorías
- `GET /api/categories` - Listar categorías (Admin)
- `POST /api/categories` - Crear categoría (Admin)
- `PUT /api/categories/:id` - Actualizar categoría (Admin)
- `DELETE /api/categories/:id` - Eliminar categoría (Admin)

## 🧪 Pruebas

Ejecutar pruebas unitarias:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con cobertura
npm run test:cov
```

## 🐳 Docker

### Construir y ejecutar con Docker Compose

```bash
# Construir y levantar los contenedores
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener los contenedores
docker-compose down
```

La API estará disponible en: http://localhost:3000/api

## 📊 Estructura del Proyecto

```
TechHelpDesk/
├── src/
│   ├── auth/              # Módulo de autenticación
│   ├── users/             # Módulo de usuarios
│   ├── clients/           # Módulo de clientes
│   ├── technicians/       # Módulo de técnicos
│   ├── tickets/           # Módulo de tickets
│   ├── categories/        # Módulo de categorías
│   ├── common/            # Recursos compartidos
│   │   ├── decorators/    # Decoradores personalizados
│   │   ├── guards/        # Guards de autenticación
│   │   ├── filters/       # Filtros de excepciones
│   │   └── interceptors/  # Interceptores
│   └── main.ts            # Punto de entrada
├── seed.sql               # Script de seeders
├── Dockerfile             # Configuración Docker
├── docker-compose.yml     # Orquestación Docker
└── README.md              # Este archivo
```

## 🔄 Estados de Tickets

Los tickets pueden tener los siguientes estados y seguir esta secuencia:

1. **OPEN** → Solo puede pasar a `IN_PROGRESS`
2. **IN_PROGRESS** → Solo puede pasar a `RESOLVED`
3. **RESOLVED** → Solo puede pasar a `CLOSED`
4. **CLOSED** → Estado final, no puede cambiar

## ⚠️ Validaciones Importantes

- Un técnico no puede tener más de 5 tickets en estado "IN_PROGRESS" simultáneamente
- Los estados de tickets deben seguir la secuencia definida
- No se pueden crear tickets sin cliente o categoría válidos

## 📝 Ejemplo de Uso

### Crear un ticket

```bash
curl -X POST http://localhost:3000/api/tickets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Problema con impresora",
    "description": "La impresora no responde",
    "clientId": "uuid-del-cliente",
    "categoryId": "uuid-de-categoria"
  }'
```

### Actualizar estado de un ticket

```bash
curl -X PATCH http://localhost:3000/api/tickets/uuid-del-ticket/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

## 📄 Licencia

MIT

## 👤 Autor

**Juanes Velez**  
Clan: Riwi


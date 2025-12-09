# Guía: Cómo ejecutar Docker Compose

## 📋 Pasos para ejecutar el proyecto con Docker Compose

### 1. Navegar al directorio del proyecto
```bash
cd /home/coders/Escritorio/NestJs/TechHelpDesk
```

### 2. Verificar que Docker Compose está disponible
```bash
docker compose version
# o si tienes versión antigua:
docker-compose --version
```

### 3. Crear archivo .env (si no existe)
```bash
# Crear archivo .env con las variables de entorno
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/techhelpdesk
JWT_SECRET=mi_secreto_jwt_super_seguro_12345
PORT=3000
EOF
```

### 4. Construir y levantar los contenedores
```bash
# Construir las imágenes y levantar los servicios
docker compose up -d

# El flag -d ejecuta en segundo plano (detached mode)
```

### 5. Ver los logs de los contenedores
```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs solo de la API
docker compose logs -f api

# Ver logs solo de PostgreSQL
docker compose logs -f postgres
```

### 6. Verificar que los contenedores están corriendo
```bash
# Listar contenedores activos
docker compose ps

# O con docker directamente
docker ps
```

### 7. Acceder a la aplicación
Una vez que los contenedores estén corriendo:
- **API:** http://localhost:3000/api
- **Swagger:** http://localhost:3000/api/docs
- **PostgreSQL:** localhost:5432

## 🔧 Comandos útiles de Docker Compose

### Detener los contenedores
```bash
# Detener sin eliminar contenedores
docker compose stop

# Detener y eliminar contenedores
docker compose down

# Detener y eliminar contenedores + volúmenes (CUIDADO: borra datos)
docker compose down -v
```

### Reiniciar los servicios
```bash
# Reiniciar todos los servicios
docker compose restart

# Reiniciar solo la API
docker compose restart api
```

### Reconstruir las imágenes
```bash
# Reconstruir sin caché (útil después de cambios en código)
docker compose build --no-cache

# Reconstruir y levantar
docker compose up -d --build
```

### Ejecutar comandos dentro de los contenedores
```bash
# Ejecutar comando en el contenedor de la API
docker compose exec api sh

# Ejecutar comando en PostgreSQL
docker compose exec postgres psql -U postgres -d techhelpdesk

# Ejecutar migraciones (si las tienes)
docker compose exec api npm run typeorm migration:run
```

### Ver el estado de los servicios
```bash
# Ver estado detallado
docker compose ps

# Ver uso de recursos
docker stats
```

## 🐛 Solución de problemas

### Error: "Cannot connect to Docker daemon"
```bash
# Iniciar servicio Docker
sudo systemctl start docker
sudo systemctl enable docker
```

### Error: "Port already in use"
```bash
# Ver qué está usando el puerto 3000
sudo lsof -i :3000

# O cambiar el puerto en docker-compose.yml
# Cambiar "3000:3000" por "3001:3000"
```

### Los contenedores no inician correctamente
```bash
# Ver logs detallados
docker compose logs

# Reconstruir desde cero
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### La base de datos no se inicializa
```bash
# Verificar que seed.sql existe
ls -la seed.sql

# Ver logs de PostgreSQL
docker compose logs postgres

# Conectarse manualmente a PostgreSQL
docker compose exec postgres psql -U postgres -d techhelpdesk
```

## 📝 Ejemplo completo de ejecución

```bash
# 1. Ir al directorio
cd /home/coders/Escritorio/NestJs/TechHelpDesk

# 2. Crear .env si no existe
if [ ! -f .env ]; then
  echo "DATABASE_URL=postgresql://postgres:postgres@postgres:5432/techhelpdesk" > .env
  echo "JWT_SECRET=mi_secreto_jwt_super_seguro_12345" >> .env
  echo "PORT=3000" >> .env
fi

# 3. Construir y levantar
docker compose up -d --build

# 4. Esperar a que los servicios estén listos
sleep 10

# 5. Ver logs
docker compose logs -f api
```

## ✅ Verificación final

Después de ejecutar `docker compose up -d`, deberías ver:

```bash
$ docker compose ps
NAME                  STATUS          PORTS
techhelpdesk-api      Up 2 minutes    0.0.0.0:3000->3000/tcp
techhelpdesk-db       Up 2 minutes    0.0.0.0:5432->5432/tcp
```

¡Listo! Tu aplicación debería estar corriendo en http://localhost:3000/api


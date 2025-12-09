# Guía de Git - TechHelpDesk

## 📍 Verificar Configuración del Repositorio

### Ver el repositorio remoto configurado:
```bash
git remote -v
```

**Resultado actual:**
```
origin	https://github.com/JuanVelezDev/TechHelpDesk.git (fetch)
origin	https://github.com/JuanVelezDev/TechHelpDesk.git (push)
```

### Ver la rama actual:
```bash
git branch
# o con más detalles:
git branch -a
```

**Rama actual:** `main`

### Ver el estado de los archivos:
```bash
git status
```

---

## 🚀 Proceso para Hacer Commit y Push

### 1. Ver qué archivos se van a subir:
```bash
git status
```

### 2. Agregar archivos al staging:
```bash
# Agregar todos los archivos nuevos y modificados
git add .

# O agregar archivos específicos:
git add src/
git add README.md
git add Dockerfile
git add docker-compose.yml
git add seed.sql
```

### 3. Verificar qué se va a commitear:
```bash
git status
```

### 4. Hacer commit:
```bash
git commit -m "feat: Implementación completa de TechHelpDesk API

- Sistema de autenticación JWT
- CRUD completo de tickets, usuarios, técnicos, clientes y categorías
- Validaciones de negocio (máximo 5 tickets en progreso, secuencia de estados)
- TransformInterceptor y ExceptionFilter
- Documentación Swagger completa
- Pruebas unitarias con Jest
- Docker y docker-compose configurados
- README con instrucciones completas"
```

### 5. Verificar a dónde va el push:
```bash
# Ver la rama actual y su tracking
git branch -vv

# Ver el último commit
git log --oneline -1
```

### 6. Hacer push:
```bash
# Push a la rama main
git push origin main

# O si ya tienes tracking configurado:
git push
```

---

## 🔍 Comandos Útiles

### Ver el historial de commits:
```bash
git log --oneline -10
```

### Ver diferencias antes de commitear:
```bash
git diff
```

### Ver qué archivos están siendo rastreados:
```bash
git ls-files
```

### Cambiar el repositorio remoto (si es necesario):
```bash
# Ver remoto actual
git remote -v

# Cambiar URL del remoto
git remote set-url origin https://github.com/USUARIO/REPOSITORIO.git

# Agregar un nuevo remoto
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
```

### Verificar configuración de usuario:
```bash
git config user.name
git config user.email
```

---

## ⚠️ Archivos que NO deberías subir

Asegúrate de que `.gitignore` incluya:
- `.env` (variables de entorno)
- `node_modules/`
- `dist/`
- `.log`

---

## 📝 Ejemplo Completo de Flujo

```bash
# 1. Ver estado
git status

# 2. Agregar archivos
git add .

# 3. Verificar qué se va a commitear
git status

# 4. Hacer commit
git commit -m "feat: Implementación completa TechHelpDesk"

# 5. Verificar remoto
git remote -v

# 6. Hacer push
git push origin main
```

---

## 🎯 Tu Configuración Actual

- **Repositorio:** https://github.com/JuanVelezDev/TechHelpDesk.git
- **Rama:** main
- **Push va a:** origin/main → https://github.com/JuanVelezDev/TechHelpDesk.git (rama main)


# Endpoint de Seed para Desarrollo

## Descripción

Este endpoint permite limpiar y poblar la base de datos con datos de prueba usando la misma ruta con diferentes métodos HTTP. **Solo funciona en desarrollo**.

## Endpoint: `/api/dev/seed`

### 1. Limpiar Base de Datos (DELETE)

```bash
DELETE http://localhost:3000/api/dev/seed
```

Elimina todos los datos de:
- Usuarios
- Especies
- Noticias
- Áreas protegidas
- Galería de medios
- Carpetas de medios

### 2. Ejecutar Seed (POST)

```bash
POST http://localhost:3000/api/dev/seed
```

Crea datos de prueba:
- **6 usuarios** con diferentes roles
- **8 imágenes** en la galería
- **3 especies** de ejemplo
- **3 áreas protegidas** de ejemplo
- **3 noticias** de ejemplo

## Usuarios de Prueba Creados

| Email | Clerk ID | Username | Rol |
|-------|----------|----------|-----|
| admin+clerk_test@example.com | user_30kKt7OFxGFcsmnl64di3CuijnL | useradmin | admin |
| content_editor+clerk_test@example.com | user_30kKx3i32q3SKZijxZvc8GQgz47 | content_editor | content_editor |
| news_editor+clerk_test@example.com | user_30kL00iY04Ndui8QBiLXOnfNWH4 | news_editor | news_editor |
| areas_editor+clerk_test@example.com | user_30kL2wrHqOQti45P1oGEJXGlgJ6 | areas_editor | areas_editor |
| species_editor+clerk_test@example.com | user_30kL6T3uBsW1talcJ8WeN1MNn4e | species_editor | species_editor |
| user+clerk_test@example.com | user_30kL90W3Md67Wsm13detlj28KmS | user | user |

## Uso con Postman

### Clear Database
- **Method**: DELETE
- **URL**: `http://localhost:3000/api/dev/clear`
- **Headers**: Content-Type: application/json

### Run Seed
- **Method**: POST
- **URL**: `http://localhost:3000/api/dev/seed`
- **Headers**: Content-Type: application/json

## Seguridad

- Los endpoints verifican que `NODE_ENV !== 'production'`
- Si se intenta usar en producción, retornan error 403 (Forbidden)
- No requieren autenticación en desarrollo

## Workflow Típico

```bash
# 1. Limpiar la base de datos
curl -X DELETE http://localhost:3000/api/dev/seed

# 2. Cargar datos de prueba
curl -X POST http://localhost:3000/api/dev/seed

# 3. Verificar los datos (opcional)
pnpm db:studio
```

## Notas

- Los usuarios creados por el seed pueden autenticarse si coinciden con usuarios reales en Clerk
- El webhook de Clerk detectará que los usuarios ya existen y no los duplicará
- Las imágenes del seed apuntan a URLs reales en el CDN de desarrollo
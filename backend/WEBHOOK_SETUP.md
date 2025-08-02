# Configuración de Webhooks de Clerk

## Descripción

El backend incluye un endpoint para recibir webhooks de Clerk y sincronizar automáticamente los usuarios con la base de datos. Esto elimina la necesidad de crear usuarios manualmente cuando se registran en Clerk.

## Endpoint del Webhook

```
POST /api/webhooks/clerk
```

## Eventos Soportados

- **user.created**: Se crea un nuevo usuario en la base de datos
- **user.updated**: Se actualizan los datos del usuario existente
- **user.deleted**: Se elimina el usuario de la base de datos

## Configuración en Producción

### 1. Obtener el Webhook Signing Secret

1. Inicia sesión en el [Dashboard de Clerk](https://dashboard.clerk.com)
2. Ve a **Webhooks** en la navegación lateral
3. Crea un nuevo endpoint con la URL: `https://tu-dominio.com/api/webhooks/clerk`
4. Selecciona los eventos:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copia el **Signing Secret**

### 2. Configurar la Variable de Entorno

Agrega el signing secret a tu archivo `.env` de producción:

```env
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx
```

### 3. Verificar la Configuración

El webhook verificará automáticamente la firma de Clerk usando el secret configurado. Si el secret no está configurado (en desarrollo), la verificación se omitirá con una advertencia.

## Flujo de Datos

### user.created
1. Clerk envía el evento cuando un usuario se registra
2. El webhook verifica si el usuario ya existe en la base de datos
3. Si el usuario ya existe (creado por API o seed), se ignora el evento
4. Si el usuario no existe, se extrae la información:
   - ID de Clerk
   - Email
   - Nombre completo (se divide en firstName y lastName)
   - Username (si existe)
   - URL de imagen de perfil
   - Rol desde public_metadata (o `user` por defecto)
5. Se genera un username único si no existe
6. Se crea el usuario en la base de datos

### user.updated
1. Clerk envía el evento cuando se actualiza un usuario
2. El webhook busca el usuario por su ID de Clerk
3. Si existe, actualiza los datos
4. Si no existe y tiene email, lo crea

### user.deleted
1. Clerk envía el evento cuando se elimina un usuario
2. El webhook elimina el usuario de la base de datos

## Pruebas en Desarrollo

Para probar el webhook en desarrollo sin verificación de firma:

1. No configures `CLERK_WEBHOOK_SECRET`
2. Usa una herramienta como ngrok para exponer tu servidor local
3. Configura el webhook en Clerk con la URL de ngrok
4. El webhook funcionará pero mostrará advertencias sobre la falta de verificación

## Ejemplo de Payload

```json
{
  "data": {
    "id": "user_2abc123",
    "email_addresses": [
      {
        "email_address": "user@example.com",
        "id": "email_123"
      }
    ],
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "profile_image_url": "https://...",
    "created_at": 1234567890,
    "updated_at": 1234567890
  },
  "object": "event",
  "type": "user.created"
}
```

## Logs y Depuración

El webhook registra todas las operaciones:

### Logs de éxito:
```
Processing user.created webhook: user_2abc123
User already exists, skipping creation: user_2abc123  // Si ya existe
User created successfully: user_2abc123               // Si se crea nuevo

Processing user.updated webhook: user_2abc123
User updated successfully: user_2abc123

Processing user.deleted webhook: user_2abc123
User deleted successfully: user_2abc123
```

### Logs de error:
```
Webhook verification failed: [error details]          // Firma inválida
No email found for user: user_2abc123               // Sin email (solo en prod)
Failed to create user: [error details]               // Error al crear
Failed to update user: [error details]               // Error al actualizar
Failed to delete user: [error details]               // Error al eliminar
```

## Seguridad

- **Producción**: La verificación de firma es obligatoria
- **Desarrollo**: Se puede omitir la verificación para facilitar las pruebas
- Los errores no lanzan excepciones para evitar reintentos innecesarios del webhook

## Notas Importantes

1. Los usuarios creados por webhook tienen rol `user` por defecto
2. Los administradores deben cambiar manualmente los roles desde el panel de usuarios
3. El username se genera automáticamente si no se proporciona
4. La sincronización es unidireccional (Clerk → Base de datos)
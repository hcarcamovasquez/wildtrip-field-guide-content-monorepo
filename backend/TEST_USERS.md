# Usuarios de Prueba

## Descripción

El archivo `seed-data.ts` incluye 6 usuarios de prueba con diferentes roles para facilitar las pruebas del sistema. Estos usuarios corresponden a cuentas reales en Clerk y se pueden usar para probar diferentes niveles de permisos.

## Usuarios Disponibles

| Email | Username | Clerk ID | Rol | Descripción |
|-------|----------|----------|-----|-------------|
| admin+clerk_test@example.com | useradmin | user_30kKt7OFxGFcsmnl64di3CuijnL | admin | Administrador con acceso completo |
| content_editor+clerk_test@example.com | content_editor | user_30kKx3i32q3SKZijxZvc8GQgz47 | content_editor | Editor de contenido general |
| news_editor+clerk_test@example.com | news_editor | user_30kL00iY04Ndui8QBiLXOnfNWH4 | news_editor | Editor de noticias |
| areas_editor+clerk_test@example.com | areas_editor | user_30kL2wrHqOQti45P1oGEJXGlgJ6 | areas_editor | Editor de áreas protegidas |
| species_editor+clerk_test@example.com | species_editor | user_30kL6T3uBsW1talcJ8WeN1MNn4e | species_editor | Editor de especies |
| user+clerk_test@example.com | user | user_30kL90W3Md67Wsm13detlj28KmS | user | Usuario regular sin permisos de edición |

## Permisos por Rol

### admin
- Acceso completo a todas las funciones
- Puede gestionar usuarios
- Puede eliminar cualquier contenido
- Puede acceder a funciones de desarrollo (seed, clear)

### content_editor
- Puede crear, editar y publicar todo tipo de contenido
- Puede gestionar la galería de medios
- Puede generar SEO con IA para todo el contenido

### news_editor
- Puede crear, editar y publicar noticias
- Puede acceder a la galería de medios
- Puede generar SEO con IA para noticias

### areas_editor
- Puede crear, editar y publicar áreas protegidas
- Puede acceder a la galería de medios
- Puede generar SEO con IA para áreas protegidas

### species_editor
- Puede crear, editar y publicar especies
- Puede acceder a la galería de medios
- Puede generar SEO con IA para especies

### user
- Solo puede ver contenido público
- No tiene permisos de edición
- No puede acceder al dashboard administrativo

## Uso en Desarrollo

1. **Ejecutar el seed** (requiere autenticación como admin):
   ```bash
   POST /api/dev/seed
   ```

2. **Los usuarios se crean automáticamente** al ejecutar el seed

3. **Para probar con un usuario específico**:
   - Inicia sesión en Clerk con el email correspondiente
   - El sistema reconocerá el Clerk ID y aplicará los permisos correctos

## Notas Importantes

- Estos usuarios son solo para pruebas y desarrollo
- Los Clerk IDs corresponden a usuarios reales en el entorno de prueba de Clerk
- En producción, los usuarios deben crearse a través del webhook de Clerk
- Los usuarios antiguos han sido eliminados ya que no tienen Clerk IDs válidos

## Integración con el Webhook

Cuando un usuario de prueba se autentica por primera vez:
1. Si no existe en la base de datos y el webhook está configurado, se creará automáticamente
2. Si ya existe (por el seed), se actualizará con la información más reciente de Clerk
3. El rol se mantiene según lo configurado en el seed

## Troubleshooting

Si un usuario no puede acceder:
1. Verifica que el Clerk ID sea correcto
2. Asegúrate de que el usuario exista en la base de datos
3. Revisa que el rol tenga los permisos necesarios
4. Verifica los logs del webhook si está habilitado
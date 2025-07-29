# Redis Cache Service

Este directorio contiene el servicio genérico de cache usando Redis (Upstash).

## Uso básico

```typescript
import { RedisCache, CacheKeys, CacheTTL } from '@/lib/cache/redis'

// Guardar en cache
await RedisCache.set('my-key', { data: 'value' }, 3600) // TTL de 1 hora

// Obtener de cache
const cached = await RedisCache.get<MyType>('my-key')

// Eliminar de cache
await RedisCache.delete('my-key')

// Get or Set pattern (útil para operaciones costosas)
const data = await RedisCache.getOrSet(
  'expensive-operation',
  async () => {
    // Operación costosa aquí
    return await fetchExpensiveData()
  },
  3600, // TTL
)
```

## Uso con las claves predefinidas

```typescript
import { RedisCache, CacheKeys, CacheTTL } from '@/lib/cache/redis'

// Cache de especies
const speciesKey = CacheKeys.species(123)
await RedisCache.set(speciesKey, speciesData, CacheTTL.species)

// Cache de lista de noticias
const newsListKey = CacheKeys.newsList(1, 10)
const newsList = await RedisCache.getOrSet(newsListKey, async () => await fetchNewsFromDB(1, 10), CacheTTL.newsList)
```

## Métodos disponibles

- `get<T>(key)`: Obtener valor del cache
- `set<T>(key, value, ttl?)`: Guardar valor en cache
- `delete(key)`: Eliminar una clave
- `deleteMany(keys[])`: Eliminar múltiples claves
- `exists(key)`: Verificar si existe una clave
- `ttl(key)`: Obtener tiempo de vida restante
- `clearPattern(pattern)`: Limpiar todas las claves que coincidan con un patrón
- `getOrSet<T>(key, factory, ttl?)`: Obtener de cache o generar y guardar

## Invalidación de cache

Cuando se actualice contenido, recuerda invalidar el cache correspondiente:

```typescript
// Después de actualizar una especie
await RedisCache.delete(CacheKeys.species(speciesId))
await RedisCache.clearPattern('species:list:*') // Limpiar todas las listas
```

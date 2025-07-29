import type { MiddlewareHandler } from 'astro'

/**
 * Middleware to block access to sensitive routes based on environment configuration
 */
export const routeBlockerMiddleware: MiddlewareHandler = async ({ url }, next) => {
  // Get blocked routes from environment variable
  const blockedRoutesEnv = import.meta.env.BLOCKED_ROUTES || process.env.BLOCKED_ROUTES || ''

  // Parse comma-separated list of blocked routes
  const blockedRoutes = blockedRoutesEnv
    .split(',')
    .map((route: string) => route.trim())
    .filter((route: string) => route.length > 0)

  // Get the current path
  const currentPath = url.pathname

  // Check if the current path matches any blocked route
  for (const blockedRoute of blockedRoutes) {
    // Support wildcards with * at the end
    if (blockedRoute.endsWith('*')) {
      const routePrefix = blockedRoute.slice(0, -1)
      if (currentPath.startsWith(routePrefix)) {
        return new Response('Not Found', { status: 404 })
      }
    } else if (currentPath === blockedRoute) {
      return new Response('Not Found', { status: 404 })
    }
  }

  // Continue to next middleware if route is not blocked
  return next()
}

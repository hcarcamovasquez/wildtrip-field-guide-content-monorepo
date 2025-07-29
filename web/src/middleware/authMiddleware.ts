import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server'

const isProtectedRoute = createRouteMatcher(['/manage(.*)', '/api/manage(.*)'])

export const authMiddleware = clerkMiddleware((auth, context) => {
  if (!isProtectedRoute(context.request)) {
    return
  }

  const { userId } = auth()

  if (!userId) {
    return context.redirect('/sign-in')
  }
})

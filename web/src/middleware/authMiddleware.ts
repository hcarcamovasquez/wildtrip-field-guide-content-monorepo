import { clerkMiddleware } from '@clerk/astro/server'

// No protected routes in the public web app
export const authMiddleware = clerkMiddleware()

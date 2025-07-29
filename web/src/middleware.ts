import { sequence } from 'astro:middleware'

import { authMiddleware } from './middleware/authMiddleware'
import { routeBlockerMiddleware } from './middleware/routeBlockerMiddleware'
import { userMiddleware } from './middleware/userMiddleware'

// Route blocker runs first to prevent access to sensitive routes
export const onRequest = sequence(routeBlockerMiddleware, authMiddleware, userMiddleware)

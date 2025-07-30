import { useUser } from '@clerk/clerk-react'
import { useLocation, Navigate } from 'react-router-dom'
import { canAccessRoute, type Role } from '@/lib/utils/permissions'
import { LoadingScreen } from './LoadingScreen'

interface PermissionGuardProps {
  children: React.ReactNode
}

export function PermissionGuard({ children }: PermissionGuardProps) {
  const { user, isLoaded } = useUser()
  const location = useLocation()
  
  if (!isLoaded) {
    return <LoadingScreen />
  }
  
  // Allow unauthorized and debug pages without permission check
  if (location.pathname === '/unauthorized' || location.pathname === '/debug') {
    return <>{children}</>
  }
  
  const userRole = (user?.publicMetadata?.role as Role) || 'user'
  
  // Debug logging
  console.log('User metadata:', user?.publicMetadata)
  console.log('User role:', userRole)
  console.log('Current path:', location.pathname)
  
  const hasAccess = canAccessRoute(userRole, location.pathname)
  
  if (!hasAccess) {
    // Check if user has any permissions at all
    if (userRole === 'user' || !user?.publicMetadata?.role) {
      // Regular users should go to unauthorized page
      return <Navigate to="/unauthorized" replace />
    }
    
    // Users with some permissions but not for this route go to unauthorized
    return <Navigate to="/unauthorized" replace />
  }
  
  return <>{children}</>
}
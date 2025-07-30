import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { roleLabels, type Role } from '@/lib/utils/permissions'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  const { user } = useUser()
  const userRole = (user?.publicMetadata?.role as Role) || 'user'
  
  // Check if this is a 401 authentication error
  const isAuthError = window.location.search.includes('auth=error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <ShieldAlert className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {isAuthError ? 'Error de Autenticación' : 'Sin Autorización'}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {isAuthError 
              ? 'Hubo un problema con tu sesión. Por favor, intenta iniciar sesión nuevamente.'
              : 'No tienes permisos para acceder a esta sección'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Tu rol actual es:
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {roleLabels[userRole] || 'Usuario'}
          </p>
        </div>

        <div className="space-y-3">
          {isAuthError ? (
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => {
                window.location.href = (import.meta.env.VITE_WEB_URL || 'http://localhost:4321') + '/sign-in'
              }}
            >
              Iniciar Sesión
            </Button>
          ) : (
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => navigate('/species')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          )}
          
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => {
              window.location.href = import.meta.env.VITE_WEB_URL || 'http://localhost:4321'
            }}
          >
            Ir al sitio público
          </Button>
        </div>

        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Si crees que esto es un error, contacta al administrador
        </p>
      </div>
    </div>
  )
}
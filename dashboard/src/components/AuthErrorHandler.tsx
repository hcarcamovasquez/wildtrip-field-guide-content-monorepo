import { useEffect } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { setAuthErrorHandler } from '@/lib/api/client'

export function AuthErrorHandler({ children }: { children: React.ReactNode }) {
  const { setAuthError } = useAuthContext()

  useEffect(() => {
    setAuthErrorHandler(setAuthError)
    
    return () => {
      setAuthErrorHandler(() => {})
    }
  }, [setAuthError])

  return <>{children}</>
}
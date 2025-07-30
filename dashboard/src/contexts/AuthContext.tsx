import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

interface AuthContextType {
  isAuthenticated: boolean
  setAuthError: (error: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authError, setAuthError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (authError) {
      navigate('/unauthorized?auth=error')
      setAuthError(false)
    }
  }, [authError, navigate])

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !authError, 
      setAuthError 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { setGetTokenFunction } from '@/lib/api/client'

export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const { getToken } = useAuth()

  useEffect(() => {
    // Set the getToken function for the API client
    setGetTokenFunction(getToken)
  }, [getToken])

  return <>{children}</>
}
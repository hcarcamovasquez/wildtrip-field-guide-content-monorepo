import { useUser } from '@clerk/clerk-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function DebugPage() {
  const { user, isLoaded } = useUser()
  const navigate = useNavigate()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-6">Debug - Información del Usuario</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Clerk User ID:</h2>
          <pre className="text-sm">{user?.id}</pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Email:</h2>
          <pre className="text-sm">{user?.emailAddresses?.[0]?.emailAddress}</pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Public Metadata:</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(user?.publicMetadata, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Unsafe Metadata:</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(user?.unsafeMetadata, null, 2)}</pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="font-semibold mb-2">Full User Object:</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(user, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
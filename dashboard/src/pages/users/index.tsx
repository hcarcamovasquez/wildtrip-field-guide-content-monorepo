import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useSearchParams } from 'react-router-dom'
import UsersTable from '@/components/manage/UsersTable'
import { apiClient } from '@/lib/api/client'

export function UsersPage() {
  const { user } = useUser()
  const currentUserId = Number(user?.publicMetadata?.userId) || 0
  const userRole = user?.publicMetadata?.role as string
  const [searchParams] = useSearchParams()
  
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const roleFilter = searchParams.get('role') || ''

  useEffect(() => {
    fetchUsers()
  }, [page, search, roleFilter])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Only admin can see all users
      if (userRole === 'admin') {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: '20',
        })
        
        if (search) params.set('search', search)
        if (roleFilter) params.set('role', roleFilter)
        
        const data = await apiClient.users.findAll(Object.fromEntries(params))
        
        setUsers(data.data || data.items || [])
        setPagination({
          page: data.page || page,
          limit: data.limit || 20,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        })
      } else {
        // Non-admin users only see their own profile
        const userData = await apiClient.users.getMe()
        setUsers([userData])
        setPagination({
          page: 1,
          limit: 1,
          total: 1,
          totalPages: 1,
        })
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <UsersTable 
        users={users} 
        pagination={pagination}
        currentUserId={currentUserId}
        currentUserRole={userRole}
        searchParams={{ search, role: roleFilter, page }}
        baseUrl="/users"
        isLoading={loading}
        error={error}
      />
    </div>
  )
}
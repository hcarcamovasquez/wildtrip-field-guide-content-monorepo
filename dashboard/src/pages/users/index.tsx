import { useUser } from '@clerk/clerk-react'
import UsersTable from '@/components/manage/UsersTable'

export function UsersPage() {
  const { user } = useUser()
  const currentUserId = Number(user?.publicMetadata?.userId) || 0

  return (
    <div>
      <UsersTable 
        users={[]} 
        pagination={{ page: 1, limit: 20, total: 0, totalPages: 0 }}
        currentUserId={currentUserId}
        searchParams={{}}
        baseUrl="/users"
      />
    </div>
  )
}
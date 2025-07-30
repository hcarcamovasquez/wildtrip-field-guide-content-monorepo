import UsersTable from '@/components/manage/UsersTable'

export function UsersPage() {
  return (
    <div>
      <UsersTable users={[]} pagination={{ page: 1, limit: 20, total: 0, totalPages: 0 }} />
    </div>
  )
}
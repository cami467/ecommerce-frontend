import type { ReactNode } from 'react'
import { AdminSidebar } from '../components/admin/AdminSidebar'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      <AdminSidebar />

      <main className="ml-64 px-6 py-8">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
    </>
  )
}
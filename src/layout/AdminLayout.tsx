import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AccountSidebar, type SidebarItem } from '../components/account/AccountSidebar'
import { useAuth } from '../hooks/useAuth'

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const nombre =
    usuario?.nombre_completo ||
    usuario?.email ||
    'Administrador'

  const items: SidebarItem[] = [
    {
      to: '/admin-dashboard',
      icono: '📊',
      label: 'Resumen',
      activo: location.pathname === '/admin-dashboard',
    },
    {
      to: '/admin-dashboard/productos',
      icono: '🛍️',
      label: 'Productos',
      activo: location.pathname.startsWith('/admin-dashboard/productos'),
    },
    {
      to: '/admin-dashboard/ordenes',
      icono: '📦',
      label: 'Órdenes',
      activo: location.pathname.startsWith('/admin-dashboard/ordenes'),
    },
    {
      to: '/admin-dashboard/pagos',
      icono: '💳',
      label: 'Pagos',
      activo: location.pathname.startsWith('/admin-dashboard/pagos'),
    },
    {
      to: '/admin-dashboard/usuarios',
      icono: '👥',
      label: 'Usuarios',
      activo: location.pathname.startsWith('/admin-dashboard/usuarios'),
    },
    {
      to: '/productos',
      icono: '🏪',
      label: 'Volver a la tienda',
      activo: false,
    },
  ]

  return (
    <div className="flex flex-1">
      <AccountSidebar
        nombreUsuario={nombre}
        avatar={usuario?.avatar || undefined}
        subtitulo="Administrador"
        items={items}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
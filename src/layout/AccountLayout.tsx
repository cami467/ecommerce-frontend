import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AccountSidebar, type SidebarItem } from '../components/account/AccountSidebar'
import { useAuth } from '../hooks/useAuth'

interface AccountLayoutProps {
  children: ReactNode
}

export function AccountLayout({ children }: AccountLayoutProps) {
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
    'Usuario'

  const items: SidebarItem[] = [
    {
      to: '/mi-cuenta',
      icono: '👤',
      label: 'Perfil',
      activo: location.pathname === '/mi-cuenta',
    },
    {
      to: '/mis-pedidos',
      icono: '📦',
      label: 'Mis pedidos',
      activo:
        location.pathname === '/mis-pedidos' ||
        location.pathname.startsWith('/ordenes/'),
    },
    {
      to: '/cambiar-password',
      icono: '🔒',
      label: 'Cambiar contraseña',
      activo: location.pathname === '/cambiar-password',
    },
    {
      to: '/productos',
      icono: '🛍️',
      label: 'Catálogo',
      activo: location.pathname === '/productos',
    },
  ]

  return (
    <div className="flex flex-1">
      <AccountSidebar
        nombreUsuario={nombre}
        avatar={usuario?.avatar || undefined}
        subtitulo="Mi cuenta"
        items={items}
        onLogout={handleLogout}
      />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto w-full max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  )
}
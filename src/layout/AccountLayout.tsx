import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AccountSidebar } from '../components/account/AccountSidebar'

type Seccion = 'perfil' | 'pedidos'| "password"  | 'catalogo'

interface AccountLayoutProps {
  children: ReactNode
  seccionActiva: Seccion
}

export function AccountLayout({
  children,
  seccionActiva,
}: AccountLayoutProps) {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  // El estado "expandido" vive acá, no en cada página. Así todas las
  // páginas que usan AccountLayout (MiCuenta, MisPedidos, OrdenDetalle...)
  // comparten la misma lógica de hover del sidebar sin repetir código.
  const [expandido, setExpandido] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const nombre = usuario?.nombre_completo || usuario?.email || 'Usuario'

  return (
    // "flex" real: el sidebar (sticky, shrink-0) y el <main> (flex-1)
    // se reparten el ancho automáticamente. Nada de margin-left fijo,
    // que se desincroniza cada vez que el sidebar cambia de w-20 a w-56.
    <div className="flex min-h-screen">
      <AccountSidebar
        nombreUsuario={nombre}
        avatar={usuario?.avatar ?? undefined}
        seccionActiva={seccionActiva}
        onLogout={handleLogout}
        expandido={expandido}
        setExpandido={setExpandido}
      />

      <main className="min-w-0 flex-1 bg-gray-50 px-8 py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface AdminRouteProps {
  children: React.ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { usuario, estaAutenticado, inicializando } = useAuth()

  if (inicializando) {
    return (
      <main className="flex min-h-[50vh] items-center justify-center">
        <p className="text-gray-600">Verificando permisos...</p>
      </main>
    )
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />
  }

  if (!usuario?.is_staff) {
    return <Navigate to="/" replace />
  }

  return children
}
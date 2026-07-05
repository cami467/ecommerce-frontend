import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function ProtectedRoute() {
  const { estaAutenticado, inicializando } = useAuth()
  const location = useLocation()

  if (inicializando) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-600">
        Verificando sesión...
      </div>
    )
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

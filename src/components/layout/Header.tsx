import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Header() {
  const { estaAutenticado, usuario, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const nombreUsuario = usuario?.nombre_completo || usuario?.email || 'Mi cuenta'

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold">
        Tienda
      </Link>

      <nav className="flex items-center gap-4">
        {estaAutenticado ? (
          <>
            <Link to="/mi-cuenta" className="text-sm text-gray-700 hover:underline">
              {nombreUsuario}
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Cerrar sesion
            </button>
          </>
        ) : (
          <Link to="/login" className="text-sm text-gray-700 hover:underline">
            Iniciar sesion
          </Link>
        )}
      </nav>
    </header>
  )
}

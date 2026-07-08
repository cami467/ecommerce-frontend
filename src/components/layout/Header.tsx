import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCarritoItems } from '../../context/CarritoItemsContext'

export function Header() {
  const { estaAutenticado, usuario, logout } = useAuth()
  const navigate = useNavigate()
  const { cantidadItems, total } = useCarritoItems()

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

      <nav className="flex items-center gap-6">
        {estaAutenticado ? (
          <>
            <Link to="/mi-cuenta" className="text-sm text-gray-700 hover:underline">
              {nombreUsuario}
            </Link>

            <Link to="/mis-pedidos" className="text-sm text-gray-700 hover:underline">
            Mis pedidos
            </Link>

            <Link to="/carrito" className="relative flex items-center gap-2 text-sm text-gray-700 hover:underline">
              <span className="text-2xl">🛒</span>

              {cantidadItems > 0 && (
                <span className="absolute -top-2 left-4 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-xs font-bold text-gray-900">
                  {cantidadItems}
                </span>
              )}

              <span>
                Mi carrito
                <span className="block text-xs font-semibold text-orange-600">
                  Gs. {total.toLocaleString('es-PY')}
                </span>
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
            >
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" className="text-sm text-gray-700 hover:underline">
            Iniciar sesión
          </Link>
        )}
      </nav>
    </header>
  )
}
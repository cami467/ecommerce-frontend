import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCarritoItems } from '../../context/CarritoItemsContext'
import { useState } from 'react'
import { NotificacionesDropdown } from '../notificaciones/NotificacionesDropdown'

export function Header() {
  const { estaAutenticado, usuario, logout } = useAuth()
  const navigate = useNavigate()
  const { cantidadItems, total } = useCarritoItems()
  const [busquedaGlobal, setBusquedaGlobal] = useState('')
  const [menuAbierto, setMenuAbierto] = useState(false)

  async function handleLogout() {
    setMenuAbierto(false)
    await logout()
    navigate('/login')
  }

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    const termino = busquedaGlobal.trim()
    setMenuAbierto(false)

    if (!termino) {
      navigate('/productos')
      return
    }

    navigate(`/productos?buscar=${encodeURIComponent(termino)}`)
  }

  function cerrarMenu() {
    setMenuAbierto(false)
  }

  const nombreUsuario = usuario?.nombre_completo || usuario?.email || 'Mi cuenta'

  return (
    <header className="relative border-b border-gray-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" onClick={cerrarMenu} className="shrink-0 text-xl font-bold">
          Tienda
        </Link>

        {/* Buscador global: visible desde tablet en adelante */}
        <form onSubmit={handleBuscar} className="hidden flex-1 px-8 md:block">
          <div className="flex">
            <input
              type="search"
              value={busquedaGlobal}
              onChange={(e) => setBusquedaGlobal(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full rounded-l border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-r bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* Nav de escritorio: oculto en mobile/tablet */}
        <nav className="hidden items-center gap-6 md:flex">
          {estaAutenticado ? (
            <>
              <Link to="/mi-cuenta" className="text-sm text-gray-700 hover:underline">
                {nombreUsuario}
              </Link>

              <Link to="/mis-pedidos" className="text-sm text-gray-700 hover:underline">
                Mis pedidos
              </Link>

              <NotificacionesDropdown />

              <Link
                to="/carrito"
                className="relative flex items-center gap-2 text-sm text-gray-700 hover:underline"
              >
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

        {/* Íconos + hamburguesa: visibles en mobile/tablet */}
        <div className="flex items-center gap-3 md:hidden">
          {estaAutenticado && (
            <>
              <NotificacionesDropdown />

              <Link
                to="/carrito"
                onClick={cerrarMenu}
                className="relative flex items-center text-2xl"
                aria-label="Ir al carrito"
              >
                🛒
                {cantidadItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-400 px-1 text-[10px] font-bold text-gray-900">
                    {cantidadItems}
                  </span>
                )}
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            className="flex h-9 w-9 items-center justify-center rounded text-2xl leading-none text-gray-700"
          >
            {menuAbierto ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Panel desplegable mobile/tablet */}
      {menuAbierto && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-gray-200 bg-white px-4 pb-4 shadow-lg md:hidden">
          <form onSubmit={handleBuscar} className="pt-4">
            <div className="flex">
              <input
                type="search"
                value={busquedaGlobal}
                onChange={(e) => setBusquedaGlobal(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full rounded-l border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="rounded-r bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Buscar
              </button>
            </div>
          </form>

          <nav className="mt-4 flex flex-col gap-1">
            {estaAutenticado ? (
              <>
                <Link
                  to="/mi-cuenta"
                  onClick={cerrarMenu}
                  className="rounded px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {nombreUsuario}
                </Link>

                <Link
                  to="/mis-pedidos"
                  onClick={cerrarMenu}
                  className="rounded px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Mis pedidos
                </Link>

                <Link
                  to="/carrito"
                  onClick={cerrarMenu}
                  className="flex items-center justify-between rounded px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <span>Mi carrito</span>
                  <span className="text-xs font-semibold text-orange-600">
                    Gs. {total.toLocaleString('es-PY')}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="mt-1 rounded px-2 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={cerrarMenu}
                className="rounded px-2 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
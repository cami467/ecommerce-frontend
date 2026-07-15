import { Link } from 'react-router-dom'
import { useState } from 'react'

export interface SidebarItem {
  to: string
  icono: string
  label: string
  activo?: boolean
}

interface AccountSidebarProps {
  nombreUsuario: string
  subtitulo?: string
  avatar?: string
  items: SidebarItem[]
  onLogout: () => void
}

function ItemMenu({
  to,
  icono,
  label,
  activo = false,
  expandido,
  onNavegar,
}: SidebarItem & { expandido: boolean; onNavegar: () => void }) {
  return (
    <Link
      to={to}
      onClick={onNavegar}
      title={!expandido ? label : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        activo
          ? 'bg-blue-100 font-medium text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'
      }`}
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-base ${
          activo
            ? 'bg-blue-200 text-blue-700'
            : 'bg-gray-200 text-gray-500'
        }`}
      >
        {icono}
      </span>
      {expandido && <span>{label}</span>}
    </Link>
  )
}

export function AccountSidebar({
  nombreUsuario,
  subtitulo = 'Mi cuenta',
  avatar,
  items,
  onLogout,
}: AccountSidebarProps) {
  const [expandido, setExpandido] = useState(false)
  const [mobileAbierto, setMobileAbierto] = useState(false)

  function cerrarMobile() {
    setMobileAbierto(false)
  }

  return (
    <>
      {/* Botón para abrir el menú en mobile/tablet */}
      <button
        type="button"
        onClick={() => setMobileAbierto(true)}
        aria-label="Abrir menú de cuenta"
        className="fixed left-4 top-20 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-xl shadow-md md:hidden"
      >
        ☰
      </button>

      {/* Fondo oscuro al abrir el drawer en mobile/tablet */}
      {mobileAbierto && (
        <div
          onClick={cerrarMobile}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        onMouseEnter={() => setExpandido(true)}
        onMouseLeave={() => setExpandido(false)}
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-sm transition-transform duration-300 md:sticky md:top-0 md:z-40 md:translate-x-0 md:transition-all ${
          mobileAbierto ? 'translate-x-0' : '-translate-x-full'
        } ${expandido ? 'md:w-56' : 'md:w-20'}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-5">
          <div className="flex min-w-0 items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt={nombreUsuario}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {nombreUsuario.charAt(0).toUpperCase()}
              </div>
            )}
            {(expandido || mobileAbierto) && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{nombreUsuario}</p>
                <p className="text-xs text-gray-500">{subtitulo}</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={cerrarMobile}
            aria-label="Cerrar menú"
            className="text-xl text-gray-400 md:hidden"
          >
            ✕
          </button>
        </div>

        <div className="px-3 pt-4">
          {(expandido || mobileAbierto) && (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Menú
            </p>
          )}
          <nav className="space-y-1">
            {items.map((item) => (
              <ItemMenu
                key={item.to}
                {...item}
                expandido={expandido || mobileAbierto}
                onNavegar={cerrarMobile}
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-gray-200 px-3 pb-4 pt-4">
          {(expandido || mobileAbierto) && (
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Cuenta
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              cerrarMobile()
              onLogout()
            }}
            title={!expandido && !mobileAbierto ? 'Cerrar sesión' : undefined}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-100 text-base">
              🚪
            </span>
            {(expandido || mobileAbierto) && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
import { NavLink } from 'react-router-dom'

const enlaces = [
  {
    to: '/admin-dashboard',
    label: 'Resumen',
    icono: '📊',
  },
  {
    to: '/admin-dashboard/productos',
    label: 'Productos',
    icono: '🛍️',
  },
  {
    to: '/admin-dashboard/ordenes',
    label: 'Órdenes',
    icono: '📦',
  },
  {
    to: '/admin-dashboard/pagos',
    label: 'Pagos',
    icono: '💳',
  },
]

export function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-slate-900 text-white">
      <div className="border-b border-slate-700 px-5 py-4">
        <p className="text-xs uppercase tracking-wider text-slate-400">
          Administración
        </p>
        <h2 className="mt-1 font-bold">Panel de control</h2>
      </div>

      <nav className="space-y-1 p-3">
        {enlaces.map((enlace) => (
          <NavLink
            key={enlace.to}
            to={enlace.to}
            end={enlace.to === '/admin-dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span>{enlace.icono}</span>
            <span>{enlace.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
import { Link } from "react-router-dom";

type SeccionActiva = "perfil" | "pedidos" | "password" | "catalogo";

interface AccountSidebarProps {
  nombreUsuario: string;
  avatar?: string;
  seccionActiva: SeccionActiva;
  onLogout: () => void;
  expandido: boolean;
  setExpandido: (valor: boolean) => void;
}

function ItemMenu({
  to,
  icono,
  label,
  activo,
  expandido,
}: {
  to: string;
  icono: string;
  label: string;
  activo: boolean;
  expandido: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
        activo
          ? "bg-blue-100 text-blue-700 font-medium"
          : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-md text-base ${
          activo ? "bg-blue-200 text-blue-700" : "bg-gray-200 text-gray-500"
        }`}
      >
        {icono}
      </span>

      {expandido && <span className="whitespace-nowrap">{label}</span>}
    </Link>
  );
}

export function AccountSidebar({
  nombreUsuario,
  avatar,
  seccionActiva,
  onLogout,
  expandido,
  setExpandido,
}: AccountSidebarProps) {
  return (
    <aside
      onMouseEnter={() => setExpandido(true)}
      onMouseLeave={() => setExpandido(false)}
      // IMPORTANTE:
      // - "sticky top-0" en vez de "fixed top-16": así el sidebar se
      //   comporta como un elemento normal hasta que el scroll lo hace
      //   "chocar" contra el borde superior, momento en el que se pega
      //   ahí. No depende de la altura del header ni deja espacios en
      //   blanco cuando el header desaparece del viewport.
      // - "h-screen" para que siempre ocupe el alto completo de la
      //   ventana mientras está pegado arriba.
      // - "shrink-0" para que, dentro del flex del layout padre, el
      //   sidebar nunca se achique cuando el contenido principal crece.
      className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col overflow-hidden border-r border-gray-200 bg-white shadow-sm transition-all duration-300 ${
        expandido ? "w-56" : "w-20"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-5">
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

        {expandido && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{nombreUsuario}</p>
            <p className="text-xs text-gray-500">Mi cuenta</p>
          </div>
        )}
      </div>

      <div className="px-3 pt-4">
        {expandido && (
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Menú
          </p>
        )}

        <nav className="space-y-1">
          <ItemMenu
            to="/mi-cuenta"
            icono="👤"
            label="Perfil"
            activo={seccionActiva === "perfil"}
            expandido={expandido}
          />

          <ItemMenu
            to="/mis-pedidos"
            icono="📦"
            label="Mis pedidos"
            activo={seccionActiva === "pedidos"}
            expandido={expandido}
          />

          <ItemMenu
            to="/productos"
            icono="🛍️"
            label="Catálogo"
            activo={seccionActiva === "catalogo"}
            expandido={expandido}
          />

          <ItemMenu
            to="/cambiar-password"
            icono="🔒"
            label="Cambiar contraseña"
            activo={seccionActiva === "password"}
            expandido={expandido}
          />
        </nav>
      </div>

      <div className="mt-auto border-t border-gray-200 px-3 pb-4 pt-4">
        {expandido && (
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Cuenta
          </p>
        )}

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-base">
            🚪
          </span>

          {expandido && (
            <span className="whitespace-nowrap">Cerrar sesión</span>
          )}
        </button>
      </div>
    </aside>
  );
}

import { useEffect, useState } from 'react'
import {
  obtenerUsuariosAdmin,
  type UsuarioAdmin,
} from '../../api/admin'
import { AdminLayout } from '../../layout/AdminLayout'

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'Nunca'

  return new Date(fecha).toLocaleString('es-PY', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function AdminUsuariosPage() {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarUsuarios() {
      try {
        setCargando(true)
        setError('')

        const respuesta = await obtenerUsuariosAdmin()
        setUsuarios(respuesta.resultados)
      } catch {
        setError('No se pudieron cargar los usuarios.')
      } finally {
        setCargando(false)
      }
    }

    cargarUsuarios()
  }, [])

  return (
    <AdminLayout>
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de usuarios
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Consultá los usuarios registrados en la plataforma.
        </p>
      </header>

      {error && (
        <div className="mt-6 rounded bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {cargando ? (
          <p className="p-6 text-gray-600">
            Cargando usuarios...
          </p>
        ) : usuarios.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No hay usuarios registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Usuario
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Teléfono
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Rol
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Registro
                  </th>

                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Último acceso
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {usuario.avatar ? (
                          <img
                            src={usuario.avatar}
                            alt={usuario.nombre_completo}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                            {(usuario.nombre_completo || usuario.email)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">
                            {usuario.nombre_completo || 'Sin nombre'}
                          </p>

                          <p className="truncate text-sm text-gray-500">
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {usuario.telefono || 'No registrado'}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          usuario.is_staff
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {usuario.is_staff
                          ? 'Administrador'
                          : 'Cliente'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          usuario.is_active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {usuario.is_active
                          ? 'Activo'
                          : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatearFecha(usuario.date_joined)}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatearFecha(usuario.last_login)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  )
}
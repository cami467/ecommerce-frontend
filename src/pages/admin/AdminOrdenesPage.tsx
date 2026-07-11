import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerOrdenesAdmin } from '../../api/admin'
import { AdminLayout } from '../../layout/AdminLayout'
import type { Orden } from '../../types/orden'

function formatearGuaranies(valor: string | number | null | undefined) {
  return `Gs. ${Number(valor ?? 0).toLocaleString('es-PY')}`
}

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-PY', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function estiloEstado(estado: string) {
  if (estado === 'confirmed') {
    return 'bg-green-50 text-green-700'
  }

  if (estado === 'cancelled') {
    return 'bg-red-50 text-red-700'
  }

  if (estado === 'completed') {
    return 'bg-blue-50 text-blue-700'
  }

  return 'bg-yellow-50 text-yellow-700'
}

export function AdminOrdenesPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarOrdenes() {
      try {
        setCargando(true)
        setError('')

        const respuesta = await obtenerOrdenesAdmin()
        setOrdenes(respuesta.resultados)
      } catch {
        setError('No se pudieron cargar las órdenes.')
      } finally {
        setCargando(false)
      }
    }

    cargarOrdenes()
  }, [])

  return (
    <AdminLayout>
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de órdenes
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Consultá las compras realizadas en la tienda.
        </p>
      </header>

      {error && (
        <div className="mt-6 rounded bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {cargando ? (
          <p className="p-6 text-gray-600">Cargando órdenes...</p>
        ) : ordenes.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No hay órdenes registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Orden
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {ordenes.map((orden) => (
                  <tr key={orden.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {orden.numero_orden}
                      </p>

                      {orden.codigo_cupon && (
                        <p className="mt-1 text-xs text-gray-500">
                          Cupón: {orden.codigo_cupon}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      Usuario #{orden.usuario}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatearFecha(orden.fecha_creacion)}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${estiloEstado(
                          orden.estado
                        )}`}
                      >
                        {orden.estado_display}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatearGuaranies(orden.total)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/ordenes/${orden.id}`}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        Ver detalle
                      </Link>
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
import { useEffect, useState } from 'react'
import { obtenerPagosAdmin } from '../../api/admin'
import { AdminLayout } from '../../layout/AdminLayout'
import type { Pago } from '../../types/pago'

function formatearGuaranies(valor: string | number | null | undefined) {
  return `Gs. ${Number(valor ?? 0).toLocaleString('es-PY')}`
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'Sin procesar'

  return new Date(fecha).toLocaleString('es-PY', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function estiloEstadoPago(estado: string) {
  if (estado === 'approved') {
    return 'bg-green-50 text-green-700'
  }

  if (estado === 'rejected') {
    return 'bg-red-50 text-red-700'
  }

  if (estado === 'refunded') {
    return 'bg-purple-50 text-purple-700'
  }

  if (estado === 'cancelled') {
    return 'bg-gray-100 text-gray-700'
  }

  return 'bg-yellow-50 text-yellow-700'
}

export function AdminPagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarPagos() {
      try {
        setCargando(true)
        setError('')

        const respuesta = await obtenerPagosAdmin()
        setPagos(respuesta.resultados)
      } catch {
        setError('No se pudieron cargar los pagos.')
      } finally {
        setCargando(false)
      }
    }

    cargarPagos()
  }, [])

  return (
    <AdminLayout>
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de pagos
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Consultá los pagos registrados y su estado actual.
        </p>
      </header>

      {error && (
        <div className="mt-6 rounded bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {cargando ? (
          <p className="p-6 text-gray-600">Cargando pagos...</p>
        ) : pagos.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No hay pagos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Pago
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Orden
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Pasarela
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Procesado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Transacción
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {pago.id.slice(0, 8).toUpperCase()}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(pago.fecha_creacion).toLocaleDateString('es-PY')}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {pago.orden.slice(0, 8).toUpperCase()}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {pago.pasarela_display}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${estiloEstadoPago(
                          pago.estado
                        )}`}
                      >
                        {pago.estado_display}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatearGuaranies(pago.monto)}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatearFecha(pago.fecha_procesado)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm text-gray-600">
                      {pago.id_transaccion || 'Sin transacción'}
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
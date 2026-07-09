import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { obtenerMisOrdenes } from '../api/ordenes'
import type { Orden } from '../types/orden'
import { AccountLayout } from '../layout/AccountLayout'

function formatearGuaranies(valor: string | number | null | undefined) {
  const numero = Number(valor ?? 0)
  return `Gs. ${numero.toLocaleString('es-PY')}`
}

function formatearFecha(fecha: string) {
  return new Date(fecha).toLocaleDateString('es-PY')
}

export function MisPedidosPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarOrdenes() {
      try {
        setCargando(true)
        setError('')

        const data = await obtenerMisOrdenes()
        setOrdenes(data)
      } catch {
        setError('No se pudieron cargar tus pedidos.')
      } finally {
        setCargando(false)
      }
    }

    cargarOrdenes()
  }, [])

  if (cargando) {
    return (
      <AccountLayout seccionActiva="pedidos">
        <p className="text-gray-600">Cargando pedidos...</p>
      </AccountLayout>
    )
  }

  if (error) {
    return (
      <AccountLayout seccionActiva="pedidos">
        <div className="rounded bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </AccountLayout>
    )
  }

  return (
    <AccountLayout seccionActiva="pedidos">
      <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>

      {ordenes.length === 0 ? (
        <div className="mt-6 rounded-lg bg-white p-8 text-center shadow">
          <p className="text-gray-600">Todavía no realizaste pedidos.</p>

          <Link
            to="/productos"
            className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {ordenes.map((orden) => (
            <article
              key={orden.id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">
                    Orden {orden.numero_orden}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatearFecha(orden.fecha_creacion)}
                  </p>

                  <span className="mt-2 inline-block rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                    {orden.estado_display}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {formatearGuaranies(orden.total)}
                  </p>

                  <Link
                    to={`/ordenes/${orden.id}`}
                    className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                  >
                    Ver detalle
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </AccountLayout>
  )
}

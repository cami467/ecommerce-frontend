import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerDashboardCliente } from '../../api/dashboardCliente'
import type { DashboardCliente as DashboardClienteType } from '../../types/dashboardCliente'

function formatearGuaranies(
  valor: string | number | null | undefined
) {
  return `Gs. ${Number(valor ?? 0).toLocaleString('es-PY')}`
}

function formatearFecha(fecha: string | null | undefined) {
  if (!fecha) return 'Sin fecha'

  return new Date(fecha).toLocaleString('es-PY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function claseEstado(estado: string) {
  if (estado === 'approved' || estado === 'completed') {
    return 'bg-green-100 text-green-700'
  }

  if (estado === 'rejected' || estado === 'cancelled') {
    return 'bg-red-100 text-red-700'
  }

  if (estado === 'confirmed') {
    return 'bg-blue-100 text-blue-700'
  }

  return 'bg-yellow-100 text-yellow-700'
}

export function DashboardCliente() {
  const [dashboard, setDashboard] =
    useState<DashboardClienteType | null>(null)

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargarDashboard() {
      try {
        setCargando(true)
        setError('')

        const data = await obtenerDashboardCliente()

        if (activo) {
          setDashboard(data)
        }
      } catch {
        if (activo) {
          setError(
            'No se pudo cargar el resumen de tu cuenta.'
          )
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarDashboard()

    return () => {
      activo = false
    }
  }, [])

  if (cargando) {
    return (
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl bg-gray-200"
          />
        ))}
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {error || 'No hay información disponible.'}
      </div>
    )
  }

  return (
    <section className="mt-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Resumen de mi cuenta
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Consultá tu actividad reciente en la tienda.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Pedidos realizados
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {dashboard.pedidos_realizados}
              </p>
            </div>

            <span className="rounded-lg bg-blue-100 p-3 text-xl">
              📦
            </span>
          </div>

          <Link
            to="/mis-pedidos"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
          >
            Ver mis pedidos
          </Link>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Dinero gastado
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {formatearGuaranies(
                  dashboard.dinero_gastado
                )}
              </p>
            </div>

            <span className="rounded-lg bg-green-100 p-3 text-xl">
              💰
            </span>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Total de pagos aprobados
          </p>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Productos favoritos
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {dashboard.productos_favoritos}
              </p>
            </div>

            <span className="rounded-lg bg-red-100 p-3 text-xl">
              ❤️
            </span>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Disponible próximamente
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-900">
              Última compra
            </h3>

            <span className="text-xl">🛍️</span>
          </div>

          {dashboard.ultima_compra ? (
            <div className="mt-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    Orden {dashboard.ultima_compra.numero_orden}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatearFecha(
                      dashboard.ultima_compra.fecha_creacion
                    )}
                  </p>
                </div>

                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${claseEstado(
                    dashboard.ultima_compra.estado
                  )}`}
                >
                  {dashboard.ultima_compra.estado_display}
                </span>
              </div>

              <p className="mt-5 text-2xl font-bold text-gray-900">
                {formatearGuaranies(
                  dashboard.ultima_compra.total
                )}
              </p>

              <Link
                to={`/ordenes/${dashboard.ultima_compra.id}`}
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                Ver detalle del pedido
              </Link>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-50 p-5 text-sm text-gray-600">
              Todavía no realizaste ninguna compra.
            </div>
          )}
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-gray-900">
              Último pago
            </h3>

            <span className="text-xl">💳</span>
          </div>

          {dashboard.ultimo_pago ? (
            <div className="mt-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900">
                    {dashboard.ultimo_pago.pasarela_display}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatearFecha(
                      dashboard.ultimo_pago.fecha_procesado ??
                        dashboard.ultimo_pago.fecha_creacion
                    )}
                  </p>
                </div>

                <span
                  className={`rounded px-2 py-1 text-xs font-semibold ${claseEstado(
                    dashboard.ultimo_pago.estado
                  )}`}
                >
                  {dashboard.ultimo_pago.estado_display}
                </span>
              </div>

              <p className="mt-5 text-2xl font-bold text-gray-900">
                {formatearGuaranies(
                  dashboard.ultimo_pago.monto
                )}
              </p>

              <Link
                to={`/ordenes/${dashboard.ultimo_pago.orden_id}`}
                className="mt-4 inline-block text-sm font-medium text-blue-600 hover:underline"
              >
                Ver orden relacionada
              </Link>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-gray-50 p-5 text-sm text-gray-600">
              Todavía no registraste ningún pago.
            </div>
          )}
        </article>
      </div>
    </section>
  )
}
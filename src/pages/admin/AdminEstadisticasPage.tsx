import { useEffect, useMemo, useState } from 'react'
import { obtenerEstadisticasAdmin } from '../../api/admin'
import { AdminLayout } from '../../layout/AdminLayout'
import type { EstadisticasAdmin } from '../../types/estadisticas'

function formatearGuaranies(valor: string | number | null | undefined) {
  return `Gs. ${Number(valor ?? 0).toLocaleString('es-PY')}`
}

function formatearMes(mes: string) {
  if (!mes || mes === 'Sin fecha') {
    return 'Sin fecha'
  }

  const [anio, numeroMes] = mes.split('-')
  const fecha = new Date(Number(anio), Number(numeroMes) - 1, 1)

  return fecha.toLocaleDateString('es-PY', {
    month: 'long',
    year: 'numeric',
  })
}

function obtenerEtiquetaEstado(estado: string) {
  const etiquetas: Record<string, string> = {
    pending: 'Pendientes',
    confirmed: 'Confirmadas',
    processing: 'En proceso',
    shipped: 'Enviadas',
    delivered: 'Entregadas',
    completed: 'Completadas',
    cancelled: 'Canceladas',
  }

  return etiquetas[estado] ?? estado
}

function obtenerClaseEstado(estado: string) {
  const clases: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-indigo-100 text-indigo-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return clases[estado] ?? 'bg-gray-100 text-gray-700'
}

export function AdminEstadisticasPage() {
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasAdmin | null>(null)

  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargarEstadisticas() {
      try {
        setCargando(true)
        setError('')

        const data = await obtenerEstadisticasAdmin()

        if (activo) {
          setEstadisticas(data)
        }
      } catch {
        if (activo) {
          setError(
            'No se pudieron cargar las estadísticas del sistema.'
          )
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarEstadisticas()

    return () => {
      activo = false
    }
  }, [])

  const mayorVentaMensual = useMemo(() => {
    if (!estadisticas?.ventas_por_mes.length) {
      return 0
    }

    return Math.max(
      ...estadisticas.ventas_por_mes.map((item) =>
        Number(item.total)
      )
    )
  }, [estadisticas])

  if (cargando) {
    return (
      <AdminLayout>
        <p className="text-gray-600">
          Cargando estadísticas...
        </p>
      </AdminLayout>
    )
  }

  if (error || !estadisticas) {
    return (
      <AdminLayout>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || 'No hay estadísticas disponibles.'}
        </div>
      </AdminLayout>
    )
  }

  const { resumen } = estadisticas

  return (
    <AdminLayout>
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Estadísticas
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Analizá el rendimiento general del e-commerce.
        </p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Ventas aprobadas
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatearGuaranies(resumen.ventas_aprobadas)}
          </p>
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Órdenes registradas
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {resumen.ordenes_totales}
          </p>
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Usuarios registrados
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {resumen.usuarios_totales}
          </p>
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Productos activos
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {resumen.productos_activos}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            De {resumen.productos_totales} productos
          </p>
        </article>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Ventas por mes
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Comparación mensual de pagos aprobados.
            </p>
          </div>

          {estadisticas.ventas_por_mes.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">
              Todavía no hay ventas aprobadas.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {estadisticas.ventas_por_mes.map((venta) => {
                const porcentaje =
                  mayorVentaMensual > 0
                    ? (Number(venta.total) / mayorVentaMensual) * 100
                    : 0

                return (
                  <div key={venta.mes}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-medium capitalize text-gray-700">
                        {formatearMes(venta.mes)}
                      </span>

                      <span className="text-sm font-semibold text-gray-900">
                        {formatearGuaranies(venta.total)}
                      </span>
                    </div>

                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{
                          width: `${Math.max(porcentaje, 3)}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Órdenes por estado
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Distribución actual de las órdenes.
          </p>

          {estadisticas.ordenes_por_estado.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">
              No hay órdenes registradas.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {estadisticas.ordenes_por_estado.map((item) => (
                <div
                  key={item.estado}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${obtenerClaseEstado(
                      item.estado
                    )}`}
                  >
                    {obtenerEtiquetaEstado(item.estado)}
                  </span>

                  <span className="text-lg font-bold text-gray-900">
                    {item.cantidad}
                  </span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Productos más vendidos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Ranking por cantidad de unidades vendidas.
          </p>

          {estadisticas.productos_mas_vendidos.length === 0 ? (
            <p className="mt-6 text-sm text-gray-500">
              Todavía no hay ventas registradas.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {estadisticas.productos_mas_vendidos.map(
                (producto, index) => (
                  <div
                    key={`${producto.nombre_producto}-${index}`}
                    className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {index + 1}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-gray-900">
                          {producto.nombre_producto}
                        </p>

                        <p className="text-xs text-gray-500">
                          {producto.cantidad} unidad(es)
                        </p>
                      </div>
                    </div>

                    <p className="shrink-0 text-sm font-semibold text-gray-900">
                      {formatearGuaranies(producto.ingresos)}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </article>

        <article className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Alertas de stock
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Variantes que alcanzaron o bajaron su stock mínimo.
              </p>
            </div>

            {estadisticas.stock_bajo.length > 0 && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                {estadisticas.stock_bajo.length}
              </span>
            )}
          </div>

          {estadisticas.stock_bajo.length === 0 ? (
            <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-700">
              No hay productos con stock bajo.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {estadisticas.stock_bajo.map((item) => (
                <div
                  key={item.variante_id}
                  className="rounded-lg border border-red-100 bg-red-50/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.producto}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {item.variante}
                      </p>
                    </div>

                    <span className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                      Stock: {item.inventario}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Stock mínimo configurado: {item.stock_minimo}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          Resumen de pagos
        </h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Pagos totales
            </p>

            <p className="mt-1 text-xl font-bold text-gray-900">
              {resumen.pagos_totales}
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">
              Pagos aprobados
            </p>

            <p className="mt-1 text-xl font-bold text-green-800">
              {resumen.pagos_aprobados}
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">
              Pagos pendientes
            </p>

            <p className="mt-1 text-xl font-bold text-yellow-800">
              {resumen.pagos_pendientes}
            </p>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
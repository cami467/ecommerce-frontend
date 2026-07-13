import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { obtenerEstadisticasAdmin } from '../../api/admin'
import { AdminLayout } from '../../layout/AdminLayout'
import type { EstadisticasAdmin } from '../../types/estadisticas'

const INTERVALO_ACTUALIZACION = 30_000

function formatearGuaranies(
  valor: string | number | null | undefined
): string {
  const numero = Number(valor ?? 0)

  return `Gs. ${numero.toLocaleString('es-PY')}`
}

function formatearMes(mes: string): string {
  if (!mes || mes === 'Sin fecha') {
    return 'Sin fecha'
  }

  const [anio, numeroMes] = mes.split('-')
  const fecha = new Date(
    Number(anio),
    Number(numeroMes) - 1,
    1
  )

  return fecha.toLocaleDateString('es-PY', {
    month: 'short',
    year: 'numeric',
  })
}

function etiquetaEstado(estado: string): string {
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

function colorEstado(estado: string): string {
  const colores: Record<string, string> = {
    pending: '#eab308',
    confirmed: '#2563eb',
    processing: '#4f46e5',
    shipped: '#9333ea',
    delivered: '#16a34a',
    completed: '#059669',
    cancelled: '#dc2626',
  }

  return colores[estado] ?? '#64748b'
}

export function AdminDashboardPage() {
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasAdmin | null>(null)

  const [cargandoInicial, setCargandoInicial] =
    useState(true)

  const [actualizando, setActualizando] =
    useState(false)

  const [error, setError] = useState('')
  const [ultimaActualizacion, setUltimaActualizacion] =
    useState<Date | null>(null)

  const cargarEstadisticas = useCallback(
    async (esActualizacionAutomatica = false) => {
      try {
        if (esActualizacionAutomatica) {
          setActualizando(true)
        } else {
          setCargandoInicial(true)
        }

        setError('')

        const data = await obtenerEstadisticasAdmin()

        setEstadisticas(data)
        setUltimaActualizacion(new Date())
      } catch {
        setError(
          'No se pudieron cargar las estadísticas del dashboard.'
        )
      } finally {
        setCargandoInicial(false)
        setActualizando(false)
      }
    },
    []
  )

  useEffect(() => {
    cargarEstadisticas()

    const intervalo = window.setInterval(() => {
      cargarEstadisticas(true)
    }, INTERVALO_ACTUALIZACION)

    return () => {
      window.clearInterval(intervalo)
    }
  }, [cargarEstadisticas])

  const ventasPorMes = useMemo(() => {
    return (estadisticas?.ventas_por_mes ?? []).map(
      (venta) => ({
        ...venta,
        mes_formateado: formatearMes(venta.mes),
        total: Number(venta.total),
      })
    )
  }, [estadisticas])

  const ordenesPorEstado = useMemo(() => {
    return (estadisticas?.ordenes_por_estado ?? []).map(
      (item) => ({
        ...item,
        nombre: etiquetaEstado(item.estado),
        cantidad: Number(item.cantidad),
        fill: colorEstado(item.estado),
      })
    )
  }, [estadisticas])

  const productosMasVendidos = useMemo(() => {
    return (
      estadisticas?.productos_mas_vendidos ?? []
    ).map((producto) => ({
      nombre:
        producto.nombre_producto.length > 22
          ? `${producto.nombre_producto.slice(0, 22)}…`
          : producto.nombre_producto,
      nombre_completo: producto.nombre_producto,
      cantidad: Number(producto.cantidad),
      ingresos: Number(producto.ingresos),
    }))
  }, [estadisticas])

  if (cargandoInicial && !estadisticas) {
    return (
      <AdminLayout>
        <div className="grid min-h-[50vh] place-items-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-gray-600">
              Cargando dashboard...
            </p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!estadisticas) {
    return (
      <AdminLayout>
        <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          <p className="font-semibold">
            No se pudo cargar el dashboard
          </p>

          <p className="mt-1 text-sm">
            {error || 'No hay datos disponibles.'}
          </p>

          <button
            type="button"
            onClick={() => cargarEstadisticas()}
            className="mt-4 rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </AdminLayout>
    )
  }

  const { resumen } = estadisticas

  return (
    <AdminLayout>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard administrativo
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Resumen general del rendimiento del e-commerce.
          </p>

          {ultimaActualizacion && (
            <p className="mt-2 text-xs text-gray-400">
              Última actualización:{' '}
              {ultimaActualizacion.toLocaleTimeString(
                'es-PY',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }
              )}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => cargarEstadisticas(true)}
          disabled={actualizando}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className={actualizando ? 'animate-spin' : ''}>
            ↻
          </span>

          {actualizando
            ? 'Actualizando...'
            : 'Actualizar datos'}
        </button>
      </header>

      {error && (
        <div className="mt-5 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          {error} Se siguen mostrando los últimos datos disponibles.
        </div>
      )}

      {/* Tarjetas principales */}
      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Ventas aprobadas
              </p>

              <p className="mt-3 text-2xl font-bold text-gray-900">
                {formatearGuaranies(
                  resumen.ventas_aprobadas
                )}
              </p>
            </div>

            <div className="rounded-lg bg-green-100 p-3 text-xl">
              💰
            </div>
          </div>

          <p className="mt-4 text-xs text-green-700">
            {resumen.pagos_aprobados} pago(s) aprobado(s)
          </p>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Órdenes
              </p>

              <p className="mt-3 text-2xl font-bold text-gray-900">
                {resumen.ordenes_totales}
              </p>
            </div>

            <div className="rounded-lg bg-blue-100 p-3 text-xl">
              📦
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Total de órdenes registradas
          </p>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Usuarios
              </p>

              <p className="mt-3 text-2xl font-bold text-gray-900">
                {resumen.usuarios_totales}
              </p>
            </div>

            <div className="rounded-lg bg-purple-100 p-3 text-xl">
              👥
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Usuarios registrados
          </p>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Productos activos
              </p>

              <p className="mt-3 text-2xl font-bold text-gray-900">
                {resumen.productos_activos}
              </p>
            </div>

            <div className="rounded-lg bg-orange-100 p-3 text-xl">
              🛍️
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            De {resumen.productos_totales} productos
          </p>
        </article>
      </section>

      {/* Gráficos superiores */}
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Ventas mensuales
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Evolución de los pagos aprobados.
            </p>
          </div>

          <div className="mt-6 h-80">
            {ventasPorMes.length === 0 ? (
              <div className="grid h-full place-items-center rounded-lg bg-gray-50 text-sm text-gray-500">
                Todavía no hay ventas aprobadas.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ventasPorMes}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="mes_formateado"
                    tick={{ fontSize: 12 }}
                  />

                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(valor) =>
                      `${Number(valor) / 1_000_000}M`
                    }
                  />

                  <Tooltip
                    formatter={(valor) => [
                      formatearGuaranies(
                        Number(valor ?? 0)
                      ),
                      'Ventas',
                    ]}
                  />

                  <Legend />

                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Ventas aprobadas"
                    stroke="#2563eb"
                    strokeWidth={3}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Órdenes por estado
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Distribución de las órdenes actuales.
          </p>

          <div className="mt-6 h-80">
            {ordenesPorEstado.length === 0 ? (
              <div className="grid h-full place-items-center rounded-lg bg-gray-50 text-sm text-gray-500">
                No hay órdenes registradas.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordenesPorEstado}
                    dataKey="cantidad"
                    nameKey="nombre"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={3}
                    label={({ name, value }) =>
                      `${name}: ${value}`
                    }
                  />

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      {/* Ranking y stock */}
      <section className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Productos más vendidos
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Ranking según unidades vendidas.
          </p>

          <div className="mt-6 h-80">
            {productosMasVendidos.length === 0 ? (
              <div className="grid h-full place-items-center rounded-lg bg-gray-50 text-sm text-gray-500">
                Todavía no hay productos vendidos.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productosMasVendidos}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 25,
                    left: 25,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                  />

                  <XAxis type="number" />

                  <YAxis
                    type="category"
                    dataKey="nombre"
                    width={135}
                    tick={{ fontSize: 11 }}
                  />

                  <Tooltip
                    formatter={(valor, nombre) => {
                      if (nombre === 'Ingresos') {
                        return [
                          formatearGuaranies(
                            Number(valor ?? 0)
                          ),
                          nombre,
                        ]
                      }

                      return [valor, nombre]
                    }}
                  />

                  <Legend />

                  <Bar
                    dataKey="cantidad"
                    name="Unidades vendidas"
                    fill="#2563eb"
                    radius={[0, 5, 5, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Stock bajo
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Productos que requieren reposición.
              </p>
            </div>

            {estadisticas.stock_bajo.length > 0 && (
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                {estadisticas.stock_bajo.length}
              </span>
            )}
          </div>

          {estadisticas.stock_bajo.length === 0 ? (
            <div className="mt-6 rounded-lg bg-green-50 p-5 text-sm text-green-700">
              ✓ No hay productos con stock bajo.
            </div>
          ) : (
            <div className="mt-6 max-h-80 space-y-3 overflow-y-auto pr-1">
              {estadisticas.stock_bajo.map((item) => (
                <div
                  key={item.variante_id}
                  className="rounded-lg border border-red-100 bg-red-50/50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {item.producto}
                      </p>

                      <p className="mt-1 truncate text-sm text-gray-600">
                        {item.variante}
                      </p>
                    </div>

                    <span className="shrink-0 rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700">
                      {item.inventario}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Stock mínimo: {item.stock_minimo}
                  </p>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      {/* Resumen de pagos */}
      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">
          Resumen de pagos
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-sm text-gray-500">
              Pagos totales
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {resumen.pagos_totales}
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-sm text-green-700">
              Pagos aprobados
            </p>

            <p className="mt-2 text-2xl font-bold text-green-800">
              {resumen.pagos_aprobados}
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">
              Pagos pendientes
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-800">
              {resumen.pagos_pendientes}
            </p>
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
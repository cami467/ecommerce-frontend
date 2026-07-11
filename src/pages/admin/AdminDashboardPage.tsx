import { useEffect, useMemo, useState } from 'react'
import {
  obtenerOrdenesAdmin,
  obtenerPagosAdmin,
  obtenerProductosAdmin,
  obtenerUsuariosAdmin,
} from '../../api/admin'
import { AdminLayout } from '../../layout/AdminLayout'
import type { Orden } from '../../types/orden'
import type { Pago } from '../../types/pago'
import type { Producto } from '../../types/producto'

function formatearGuaranies(valor: number) {
  return `Gs. ${valor.toLocaleString('es-PY')}`
}

export function AdminDashboardPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([])
  const [pagos, setPagos] = useState<Pago[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [totalOrdenes, setTotalOrdenes] = useState(0)
  const [totalPagos, setTotalPagos] = useState(0)
  const [totalProductos, setTotalProductos] = useState(0)
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarDashboard() {
      try {
        setCargando(true)
        setError('')

        const [
          respuestaOrdenes,
          respuestaPagos,
          respuestaProductos,
          respuestaUsuarios,
        ] = await Promise.all([
          obtenerOrdenesAdmin(),
          obtenerPagosAdmin(),
          obtenerProductosAdmin(),
          obtenerUsuariosAdmin(),
        ])

        setOrdenes(respuestaOrdenes.resultados)
        setPagos(respuestaPagos.resultados)
        setProductos(respuestaProductos.resultados)
        setTotalOrdenes(respuestaOrdenes.total)
        setTotalPagos(respuestaPagos.total)
        setTotalProductos(respuestaProductos.total)
        setTotalUsuarios(respuestaUsuarios.total)
      } catch {
        setError(
          'No se pudieron cargar los datos del panel administrativo.'
        )
      } finally {
        setCargando(false)
      }
    }

    cargarDashboard()
  }, [])

  const ventasAprobadas = useMemo(() => {
    return pagos
      .filter((pago) => pago.estado === 'approved')
      .reduce((acumulado, pago) => acumulado + Number(pago.monto), 0)
  }, [pagos])

  const pagosPendientes = pagos.filter(
    (pago) => pago.estado === 'pending'
  ).length

  const ordenesConfirmadas = ordenes.filter(
    (orden) => orden.estado === 'confirmed'
  ).length

  const productosActivos = productos.filter(
    (producto) => producto.esta_activo
  ).length

  if (cargando) {
    return (
      <AdminLayout>
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard administrativo
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Resumen general del e-commerce.
          </p>
        </header>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-[92px] animate-pulse rounded-lg border bg-gray-100 p-5 shadow-sm"
            />
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-lg border bg-gray-100 p-5 shadow-sm" />
          <div className="h-72 animate-pulse rounded-lg border bg-gray-100 p-5 shadow-sm" />
        </section>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard administrativo
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Resumen general del e-commerce.
        </p>
      </header>

      {error && (
        <div className="mt-6 rounded bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ventas aprobadas</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatearGuaranies(ventasAprobadas)}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Órdenes</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalOrdenes}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {ordenesConfirmadas} confirmadas
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pagos</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalPagos}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {pagosPendientes} pendientes
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Productos</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalProductos}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {productosActivos} activos
          </p>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Usuarios registrados</p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {totalUsuarios}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Últimas órdenes
          </h2>

          <div className="mt-4 space-y-3">
            {ordenes.slice(0, 5).map((orden) => (
              <div
                key={orden.id}
                className="flex items-center justify-between border-b pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {orden.numero_orden}
                  </p>
                  <p className="text-xs text-gray-500">
                    {orden.estado_display}
                  </p>
                </div>

                <p className="font-semibold">
                  {formatearGuaranies(Number(orden.total))}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Últimos pagos
          </h2>

          <div className="mt-4 space-y-3">
            {pagos.slice(0, 5).map((pago) => (
              <div
                key={pago.id}
                className="flex items-center justify-between border-b pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {pago.pasarela_display}
                  </p>
                  <p className="text-xs text-gray-500">
                    {pago.estado_display}
                  </p>
                </div>

                <p className="font-semibold">
                  {formatearGuaranies(Number(pago.monto))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminLayout>
  )
}
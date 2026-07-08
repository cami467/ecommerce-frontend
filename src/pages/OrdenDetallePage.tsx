import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerOrdenPorId } from '../api/ordenes'
import type { Orden } from '../types/orden'

function formatearGuaranies(valor: string | number | null | undefined) {
  const numero = Number(valor ?? 0)
  return `Gs. ${numero.toLocaleString('es-PY')}`
}

export function OrdenDetallePage() {
  const { id } = useParams()
  const [orden, setOrden] = useState<Orden | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function cargarOrden() {
      if (!id) {
        setError('Orden no encontrada.')
        setCargando(false)
        return
      }

      try {
        const data = await obtenerOrdenPorId(id)
        setOrden(data)
      } catch {
        setError('No se pudo cargar la orden.')
      } finally {
        setCargando(false)
      }
    }

    cargarOrden()
  }, [id])

  if (cargando) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-gray-600">Cargando orden...</p>
      </main>
    )
  }

  if (error || !orden) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded bg-red-50 p-4 text-red-700">
          {error || 'Orden no encontrada.'}
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="rounded-lg bg-green-50 p-5 text-green-800">
        <h1 className="text-2xl font-bold">Pedido confirmado</h1>
        <p className="mt-1">
          Tu orden {orden.numero_orden} fue creada correctamente.
        </p>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900">Productos</h2>

          <div className="mt-4 space-y-3">
            {orden.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b border-gray-100 pb-3 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {item.nombre_producto}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.nombre_variante} x {item.cantidad}
                  </p>
                </div>

                <p className="font-semibold text-gray-900">
                  {formatearGuaranies(item.subtotal)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Resumen</h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Estado</span>
              <span>{orden.estado_display}</span>
            </div>

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatearGuaranies(orden.subtotal)}</span>
            </div>

            {orden.monto_descuento > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Descuento</span>
                <span>-{formatearGuaranies(orden.monto_descuento)}</span>
              </div>
            )}

            {Number(orden.costo_envio) > 0 && (
                <div className="flex justify-between">
                    <span>Envío</span>
                    <span>{formatearGuaranies(orden.costo_envio)}</span>
                </div>
            )}
            {orden.codigo_cupon && (
              <div className="flex justify-between">
                <span>Cupón</span>
                <span>{orden.codigo_cupon}</span>
              </div>
            )}
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatearGuaranies(orden.total)}</span>
            </div>
          </div>

          <Link
            to="/productos"
            className="mt-6 block w-full rounded bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700"
          >
            Seguir comprando
          </Link>
        </aside>
      </section>
    </main>
  )
}
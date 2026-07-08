import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { crearOrdenDesdeCarrito } from '../api/ordenes'
import { useCarritoItems } from '../context/CarritoItemsContext'
import type { CarritoItem } from '../types/carrito'

function formatearGuaranies(valor: string | number | null | undefined) {
  const numero = Number(valor ?? 0)
  return `Gs. ${numero.toLocaleString('es-PY')}`
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { items, cantidadItems, total, cargando, refrescar } = useCarritoItems()

  const [codigoCupon, setCodigoCupon] = useState('')
  const [notas, setNotas] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirmarPedido() {
    try {
      setProcesando(true)
      setError('')

      const orden = await crearOrdenDesdeCarrito({
        codigo_cupon: codigoCupon.trim() || undefined,
        notas: notas.trim() || undefined,
      })

      await refrescar()

      navigate(`/ordenes/${orden.id}`)
    } catch {
      setError('No se pudo crear la orden. Verificá tu carrito e intentá nuevamente.')
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-gray-600">Cargando checkout...</p>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-gray-900">
            Tu carrito está vacío
          </h1>

          <p className="mt-2 text-gray-600">
            Agregá productos antes de finalizar el pedido.
          </p>

          <Link
            to="/productos"
            className="mt-6 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Ver productos
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/carrito" className="text-sm text-blue-600 hover:underline">
        ← Volver al carrito
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Finalizar pedido
      </h1>

      <p className="mt-1 text-sm text-gray-600">
        Revisá los productos antes de confirmar tu compra.
      </p>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">
              Productos del pedido
            </h2>

            <div className="mt-4 space-y-3">
              {items.map((item: CarritoItem) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.variante_detalle.nombre}
                    </p>

                    <p className="text-xs text-gray-500">
                      SKU: {item.variante_detalle.sku}
                    </p>

                    <p className="text-xs text-gray-500">
                      Cantidad: {item.cantidad}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatearGuaranies(item.subtotal)}
                    </p>

                    <p className="text-xs text-gray-500">
                      {formatearGuaranies(item.variante_detalle.precio_total)} c/u
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-900">
              Datos adicionales
            </h2>

            <label
              htmlFor="codigo-cupon"
              className="mt-4 block text-sm font-medium text-gray-700"
            >
              Cupón de descuento
            </label>

            <input
              id="codigo-cupon"
              type="text"
              value={codigoCupon}
              onChange={(e) => setCodigoCupon(e.target.value.toUpperCase())}
              placeholder="Ej: DESCUENTO10"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label
              htmlFor="notas"
              className="mt-4 block text-sm font-medium text-gray-700"
            >
              Notas del pedido
            </label>

            <textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: entregar por la tarde"
            />
          </div>

          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Resumen</h2>

          <div className="mt-4 flex justify-between text-sm text-gray-700">
            <span>Productos</span>
            <span>{cantidadItems}</span>
          </div>

          <div className="mt-3 flex justify-between text-sm text-gray-700">
            <span>Subtotal</span>
            <span>{formatearGuaranies(total)}</span>
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span>{formatearGuaranies(total)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirmarPedido}
            disabled={procesando}
            className="mt-6 w-full rounded bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {procesando ? 'Creando pedido...' : 'Confirmar pedido'}
          </button>

          <Link
            to="/productos"
            className="mt-3 block text-center text-sm text-blue-600 hover:underline"
          >
            Seguir comprando
          </Link>
        </aside>
      </section>
    </main>
  )
}
import { Link } from 'react-router-dom'
import { useCarrito } from '../hooks/useCarrito'

function formatearGuaranies(valor: string | number | null | undefined) {
  const numero = Number(valor ?? 0)
  return `Gs. ${numero.toLocaleString('es-PY')}`
}

export function CarritoPage() {
  const {
    carrito,
    cargando,
    error,
    actualizando,
    cambiarCantidad,
    eliminarItem,
    limpiarCarrito,
  } = useCarrito()

  if (cargando) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-gray-600">Cargando carrito...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </main>
    )
  }

  if (!carrito || carrito.items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-gray-900">
            Tu carrito está vacío
          </h1>

          <p className="mt-2 text-gray-600">
            Agregá productos para continuar con tu compra.
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
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carrito</h1>
          <p className="text-sm text-gray-600">
            {carrito.cantidad_items} producto(s) en tu carrito.
          </p>
        </div>

        <button
          type="button"
          onClick={limpiarCarrito}
          disabled={actualizando}
          className="rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          Vaciar carrito
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {carrito.items.map((item) => (
            <article
              key={item.id}
              className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded bg-gray-100">
                {item.imagen_producto ? (
                  <img
                    src={item.imagen_producto}
                    alt={item.variante_detalle.nombre}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                    Sin imagen
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {item.variante_detalle.nombre}
                  </h2>

                  <p className="text-sm text-gray-500">
                    {item.variante_detalle.sku}
                  </p>

                  <p className="mt-1 text-sm text-gray-700">
                    {formatearGuaranies(item.variante_detalle.precio_total)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                      disabled={actualizando || item.cantidad <= 1}
                      className="h-8 w-8 rounded border border-gray-300 disabled:opacity-50"
                    >
                      -
                    </button>

                    <span className="w-8 text-center text-sm">
                      {item.cantidad}
                    </span>

                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                      disabled={actualizando || item.cantidad >= item.variante_detalle.inventario}
                      className="h-8 w-8 rounded border border-gray-300 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => eliminarItem(item.id)}
                    disabled={actualizando}
                    className="text-sm text-red-600 hover:underline disabled:opacity-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="hidden text-right sm:block">
                <p className="font-bold text-gray-900">
                  {formatearGuaranies(item.subtotal)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Resumen</h2>

          <div className="mt-4 flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{formatearGuaranies(carrito.total)}</span>
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatearGuaranies(carrito.total)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block w-full rounded bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700"
          >
            Finalizar pedido
          </Link>

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

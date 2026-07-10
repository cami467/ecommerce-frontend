import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { obtenerOrdenPorId } from '../api/ordenes'
import { obtenerPagoDeOrden } from '../api/pagos'
import type { Orden } from '../types/orden'
import type { Pago } from '../types/pago'
import { AccountLayout } from '../layout/AccountLayout'

function formatearGuaranies(valor: string | number | null | undefined) {
  const numero = Number(valor ?? 0)
  return `Gs. ${numero.toLocaleString('es-PY')}`
}

export function OrdenDetallePage() {
  const { id } = useParams()
  const [orden, setOrden] = useState<Orden | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [pago, setPago] = useState<Pago | null>(null)
  const [cargandoPago, setCargandoPago] = useState(true)

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

        // cargar pago asociado
        try {
          const pagoEncontrado = await obtenerPagoDeOrden(id)
          setPago(pagoEncontrado)
        } catch {
          setPago(null)
        } finally {
          setCargandoPago(false)
        }
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
      <AccountLayout seccionActiva="pedidos">
        <p className="text-gray-600">Cargando orden...</p>
      </AccountLayout>
    )
  }

  if (error || !orden) {
    return (
      <AccountLayout seccionActiva="pedidos">
        <div className="rounded bg-red-50 p-4 text-red-700">
          {error || 'Orden no encontrada.'}
        </div>
      </AccountLayout>
    )
  }

  return (
    <AccountLayout seccionActiva="pedidos">
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
            to={`/pagos/${orden.id}`}
            className="mt-4 block w-full rounded bg-green-600 px-4 py-3 text-center font-medium text-white hover:bg-green-700"
          >
            Pagar pedido
          </Link>

          <Link
            to="/productos"
            className="mt-6 block w-full rounded bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-700"
          >
            Seguir comprando
          </Link>
        </aside>
      </section>

      {/* Sección de pago */}
      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Pago</h2>

        {cargandoPago ? (
          <p className="mt-3 text-sm text-gray-500">
            Cargando información del pago...
          </p>
        ) : pago ? (
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Método</span>
              <span className="font-medium">{pago.pasarela_display}</span>
            </div>

            <div className="flex justify-between">
              <span>Estado</span>
              <span className="font-medium">{pago.estado_display}</span>
            </div>

            <div className="flex justify-between">
              <span>Monto</span>
              <span className="font-medium">
                {formatearGuaranies(pago.monto)}
              </span>
            </div>

            {pago.id_transaccion && (
              <div className="flex justify-between">
                <span>Transacción</span>
                <span className="font-medium">{pago.id_transaccion}</span>
              </div>
            )}

            {pago.estado === 'rejected' && (
              <Link
                to={`/pagos/${orden.id}`}
                className="mt-4 block rounded bg-blue-600 px-4 py-2 text-center font-medium text-white hover:bg-blue-700"
              >
                Reintentar pago
              </Link>
            )}
          </div>
        ) : (
          // Ya no repetimos el botón "Pagar pedido" acá: el de la
          // tarjeta Resumen (arriba) es el único punto de entrada
          // para iniciar el pago, evitando el botón duplicado.
          <p className="mt-4 text-sm text-gray-600">
            Esta orden todavía no tiene un pago registrado.
          </p>
        )}
      </section>
    </AccountLayout>
  )
}
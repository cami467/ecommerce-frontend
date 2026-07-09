import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { crearPago, simularPago } from '../api/pagos'
import type { Pago, PasarelaPago } from '../types/pago'

const pasarelas: { value: PasarelaPago; label: string }[] = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'mercado_pago', label: 'Mercado Pago' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
]

function formatearGuaranies(valor: string | number | null | undefined) {
  const numero = Number(valor ?? 0)
  return `Gs. ${numero.toLocaleString('es-PY')}`
}

export function PagoPage() {
  const { ordenId } = useParams()
  const [pasarela, setPasarela] = useState<PasarelaPago>('efectivo')
  const [pago, setPago] = useState<Pago | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  async function handleCrearPago() {
    if (!ordenId) return

    try {
      setProcesando(true)
      setError('')

      const data = await crearPago({
        orden_id: ordenId,
        pasarela,
      })

      setPago(data)
    } catch {
      setError('No se pudo crear el pago. Verificá que la orden no tenga un pago pendiente o aprobado.')
    } finally {
      setProcesando(false)
    }
  }

  async function handleSimular(resultado: 'approved' | 'rejected') {
    if (!pago) return

    try {
      setProcesando(true)
      setError('')

      const data = await simularPago({
        pago_id: pago.id,
        resultado,
      })

      setPago(data)
    } catch {
      setError('No se pudo simular el pago.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <Link to={`/ordenes/${ordenId}`} className="text-sm text-blue-600 hover:underline">
        ← Volver a la orden
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        Pago del pedido
      </h1>

      <section className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
        {!pago ? (
          <>
            <label className="block text-sm font-medium text-gray-700">
              Método de pago
            </label>

            <select
              value={pasarela}
              onChange={(e) => setPasarela(e.target.value as PasarelaPago)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            >
              {pasarelas.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleCrearPago}
              disabled={procesando}
              className="mt-6 w-full rounded bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              {procesando ? 'Creando pago...' : 'Crear pago'}
            </button>
          </>
        ) : (
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Pago {pago.estado_display}
            </h2>

            <div className="mt-4 space-y-2 text-sm">
              <p>
                <strong>Método:</strong> {pago.pasarela_display}
              </p>
              <p>
                <strong>Monto:</strong> {formatearGuaranies(pago.monto)}
              </p>
              <p>
                <strong>Estado:</strong> {pago.estado_display}
              </p>
              {pago.id_transaccion && (
                <p>
                  <strong>Transacción:</strong> {pago.id_transaccion}
                </p>
              )}
            </div>

            {pago.esta_pendiente && (
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSimular('approved')}
                  disabled={procesando}
                  className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-gray-300"
                >
                  Simular aprobado
                </button>

                <button
                  type="button"
                  onClick={() => handleSimular('rejected')}
                  disabled={procesando}
                  className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:bg-gray-300"
                >
                  Simular rechazado
                </button>
              </div>
            )}

            {pago.es_exitoso && (
              <div className="mt-6 rounded bg-green-50 p-3 text-sm text-green-700">
                Pago aprobado correctamente.
              </div>
            )}

            {pago.estado === 'rejected' && (
              <div className="mt-6 rounded bg-red-50 p-3 text-sm text-red-700">
                El pago fue rechazado.
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>
    </main>
  )
}
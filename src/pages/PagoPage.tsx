import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import {
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  Landmark,
  RefreshCcw,
  UploadCloud,
  XCircle,
} from 'lucide-react'
import { crearPago, simularPago, subirComprobanteTransferencia } from '../api/pagos'
import { stripePromise } from '../lib/stripe'
import { StripePaymentForm } from '../components/StripePaymentForm'
import type { Pago, PasarelaPago } from '../types/pago'

const pasarelas: { value: PasarelaPago; label: string }[] = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'mercado_pago', label: 'Mercado Pago' },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia bancaria' },
]

// Datos de la cuenta a la que el cliente debe transferir.
// TODO: reemplazar por los datos bancarios reales antes de la entrega.
const DATOS_BANCARIOS = {
  banco: 'Banco Itaú Paraguay',
  titular: 'Mi Tienda E-commerce S.A.',
  cuenta: '1234567-8',
  ruc: '80012345-6',
}

function formatearGuaranies(valor: string | number | null | undefined) {
  const numero = Number(valor ?? 0)
  return `Gs. ${numero.toLocaleString('es-PY')}`
}

function obtenerEstiloEstadoPago(estado: string) {
  if (estado === 'approved') {
    return {
      contenedor: 'bg-green-50 border-green-200 text-green-800',
      icono: CheckCircle2,
      colorIcono: 'text-green-600',
      titulo: 'Pago aprobado',
      descripcion: 'El pago fue procesado correctamente.',
    }
  }

  if (estado === 'rejected') {
    return {
      contenedor: 'bg-red-50 border-red-200 text-red-800',
      icono: XCircle,
      colorIcono: 'text-red-600',
      titulo: 'Pago rechazado',
      descripcion: 'El pago no pudo ser procesado.',
    }
  }

  return {
    contenedor: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icono: Clock,
    colorIcono: 'text-yellow-600',
    titulo: 'Pago pendiente',
    descripcion: 'El pago está esperando confirmación.',
  }
}

function obtenerPasosPago(estado: string) {
  return [
    {
      label: 'Pedido creado',
      completado: true,
    },
    {
      label: 'Pago generado',
      completado: true,
    },
    {
      label: 'Esperando confirmación',
      completado: estado !== 'approved' && estado !== 'rejected',
    },
    {
      label:
        estado === 'approved'
          ? 'Pago aprobado'
          : estado === 'rejected'
            ? 'Pago rechazado'
            : 'Resultado pendiente',
      completado: estado === 'approved' || estado === 'rejected',
    },
  ]
}

export function PagoPage() {
  const { ordenId } = useParams()
  const [pasarela, setPasarela] = useState<PasarelaPago>('efectivo')
  const [pago, setPago] = useState<Pago | null>(null)
  // client_secret solo se recibe una vez, en la respuesta de
  // crearPago() cuando pasarela es 'stripe'. No se persiste en el
  // backend, así que si se refresca la página se pierde a propósito
  // (ver el cartel de "iniciá el pago de nuevo" más abajo).
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  // Estado del formulario de comprobante de transferencia
  const [archivoComprobante, setArchivoComprobante] = useState<File | null>(null)
  const [referenciaCliente, setReferenciaCliente] = useState('')
  const [observacionCliente, setObservacionCliente] = useState('')
  const [subiendoComprobante, setSubiendoComprobante] = useState(false)
  const [errorComprobante, setErrorComprobante] = useState('')
  // Permite volver a mostrar el formulario aunque ya haya un
  // comprobante cargado, por si el cliente se equivocó de archivo.
  const [reemplazandoComprobante, setReemplazandoComprobante] = useState(false)

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
      setClientSecret(data.client_secret ?? null)
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

  async function handleSubirComprobante(e: React.FormEvent) {
    e.preventDefault()
    if (!pago || !archivoComprobante) {
      setErrorComprobante('Seleccioná un archivo antes de enviar.')
      return
    }

    try {
      setSubiendoComprobante(true)
      setErrorComprobante('')

      const data = await subirComprobanteTransferencia(
        pago.id,
        archivoComprobante,
        referenciaCliente,
        observacionCliente
      )

      setPago(data)
      setReemplazandoComprobante(false)
      setArchivoComprobante(null)
    } catch {
      setErrorComprobante(
        'No se pudo subir el comprobante. Verificá el archivo e intentá de nuevo.'
      )
    } finally {
      setSubiendoComprobante(false)
    }
  }

  const esEfectivoPendiente =
    pago?.esta_pendiente && pago.pasarela === 'efectivo'
  const esTransferenciaPendiente =
    pago?.esta_pendiente && pago.pasarela === 'transferencia'
  const esStripePendiente =
    pago?.esta_pendiente && pago.pasarela === 'stripe'
  const yaTieneComprobante = Boolean(pago?.comprobante_url)
  // Efectivo, transferencia y stripe ya tienen su propio flujo real
  // de confirmacion, asi que la simulacion solo tiene sentido para
  // mercado_pago, que todavia no tiene integracion real.
  const puedeSimular =
    pago?.esta_pendiente &&
    pago.pasarela !== 'efectivo' &&
    pago.pasarela !== 'transferencia' &&
    pago.pasarela !== 'stripe' &&
    import.meta.env.DEV

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
            {/* Bloque visual del estado */}
            {(() => {
              const estadoVisual = obtenerEstiloEstadoPago(pago.estado)
              const IconoEstado = estadoVisual.icono
              return (
                <div className={`rounded-lg border p-4 ${estadoVisual.contenedor}`}>
                  <div className="flex items-start gap-3">
                    <IconoEstado
                      className={`h-7 w-7 shrink-0 ${estadoVisual.colorIcono}`}
                      strokeWidth={2}
                    />
                    <div>
                      <h2 className="text-lg font-bold">{estadoVisual.titulo}</h2>
                      <p className="mt-1 text-sm">{estadoVisual.descripcion}</p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Progreso del pago */}
            {(() => {
              const pasos = obtenerPasosPago(pago.estado)
              return (
                <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
                  <h3 className="font-semibold text-gray-900">Progreso del pago</h3>

                  <div className="mt-4 space-y-3">
                    {pasos.map((paso, index) => (
                      <div key={paso.label} className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            paso.completado
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {index + 1}
                        </div>

                        <span
                          className={`text-sm ${
                            paso.completado ? 'font-medium text-gray-900' : 'text-gray-500'
                          }`}
                        >
                          {paso.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

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

            {/* Cartel especifico para efectivo pendiente: no hay nada
                que el cliente pueda hacer mas que esperar a que un
                admin confirme el cobro desde el panel. */}
            {esEfectivoPendiente && (
              <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-5">
                <h2 className="font-bold text-yellow-800">
                  Pago en efectivo pendiente
                </h2>

                <p className="mt-2 text-sm text-yellow-700">
                  Tu pedido fue registrado. El pago será confirmado cuando
                  se reciba el importe.
                </p>

                <p className="mt-3 font-semibold text-yellow-900">
                  Total: {formatearGuaranies(pago.monto)}
                </p>
              </div>
            )}

            {/* Transferencia pendiente: mostramos los datos bancarios
                y el formulario de comprobante mientras no haya uno
                cargado (o si el cliente pide reemplazarlo). Una vez
                subido, mostramos el estado de "en revisión". */}
            {esTransferenciaPendiente && (
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-5">
                <h2 className="flex items-center gap-2 font-bold text-blue-900">
                  <Landmark className="h-5 w-5 text-blue-700" strokeWidth={2} />
                  Pago por transferencia bancaria
                </h2>

                <div className="mt-3 rounded border border-blue-100 bg-white p-4 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">
                    Datos para transferir:
                  </p>
                  <p className="mt-2">
                    <strong>Banco:</strong> {DATOS_BANCARIOS.banco}
                  </p>
                  <p>
                    <strong>Titular:</strong> {DATOS_BANCARIOS.titular}
                  </p>
                  <p>
                    <strong>Cuenta:</strong> {DATOS_BANCARIOS.cuenta}
                  </p>
                  <p>
                    <strong>RUC:</strong> {DATOS_BANCARIOS.ruc}
                  </p>
                  <p className="mt-2 font-semibold text-blue-900">
                    Monto a transferir: {formatearGuaranies(pago.monto)}
                  </p>
                </div>

                {yaTieneComprobante && !reemplazandoComprobante ? (
                  <div className="mt-4 rounded border border-blue-100 bg-white p-4">
                    <p className="flex items-start gap-2 text-sm text-blue-800">
                      <FileText className="h-5 w-5 shrink-0 text-blue-600" strokeWidth={2} />
                      Ya recibimos tu comprobante. Tu pago está en
                      revisión, te avisaremos cuando sea confirmado.
                    </p>

                    <a
                      href={pago.comprobante_url ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    >
                      Ver comprobante enviado
                      <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                    </a>

                    <div>
                      <button
                        type="button"
                        onClick={() => setReemplazandoComprobante(true)}
                        className="mt-3 inline-flex items-center gap-1 text-sm text-gray-600 underline hover:text-gray-900"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" strokeWidth={2} />
                        ¿Te equivocaste de archivo? Subir otro comprobante
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubirComprobante} className="mt-4 space-y-3">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                        <UploadCloud className="h-4 w-4 text-blue-600" strokeWidth={2} />
                        Comprobante de transferencia (imagen o PDF)
                      </label>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) =>
                          setArchivoComprobante(e.target.files?.[0] ?? null)
                        }
                        className="mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Número de referencia de la operación
                      </label>
                      <input
                        type="text"
                        value={referenciaCliente}
                        onChange={(e) => setReferenciaCliente(e.target.value)}
                        placeholder="Ej: 000123456"
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Comentario (opcional)
                      </label>
                      <textarea
                        value={observacionCliente}
                        onChange={(e) => setObservacionCliente(e.target.value)}
                        rows={2}
                        placeholder="Cualquier dato adicional que quieras agregar"
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>

                    {errorComprobante && (
                      <p className="text-sm text-red-700">{errorComprobante}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={subiendoComprobante}
                        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300"
                      >
                        {subiendoComprobante ? 'Enviando...' : 'Enviar comprobante'}
                      </button>

                      {reemplazandoComprobante && (
                        <button
                          type="button"
                          onClick={() => {
                            setReemplazandoComprobante(false)
                            setErrorComprobante('')
                          }}
                          className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Stripe pendiente: el Payment Element necesita el
                client_secret que se recibe una sola vez, en la
                respuesta de crearPago(). Si la pagina se refresca
                se pierde (a proposito, no se persiste en el backend),
                asi que en ese caso se le pide al cliente reiniciar
                el pago en vez de intentar recuperarlo. */}
            {esStripePendiente && (
              <div className="mt-6 rounded-lg border border-purple-200 bg-purple-50 p-5">
                <h2 className="flex items-center gap-2 font-bold text-purple-900">
                  <CreditCard className="h-5 w-5 text-purple-700" strokeWidth={2} />
                  Pago con tarjeta
                </h2>

                {clientSecret ? (
                  <div className="mt-4 rounded border border-purple-100 bg-white p-4">
                    <Elements
                      stripe={stripePromise}
                      options={{ clientSecret, appearance: { theme: 'stripe' } }}
                    >
                      <StripePaymentForm pagoId={pago.id} />
                    </Elements>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-purple-800">
                    No se pudo cargar el formulario de pago. Si recargaste la
                    página, iniciá el pago de nuevo.
                  </p>
                )}
              </div>
            )}

            {/* Simulacion: solo para pasarelas sin integracion real
                todavia (mercado_pago), y nunca en un build de
                produccion. */}
            {puedeSimular && (
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

            {/* Botón reintentar si fue rechazado */}
            {pago.estado === 'rejected' && (
              <button
                type="button"
                onClick={() => {
                  setPago(null)
                  setClientSecret(null)
                  setError('')
                }}
                className="mt-6 w-full rounded bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
              >
                Intentar nuevamente
              </button>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Volver al detalle de la orden */}
        <Link
          to={`/ordenes/${ordenId}`}
          className="mt-3 block text-center text-sm text-blue-600 hover:underline"
        >
          Volver al detalle del pedido
        </Link>
      </section>
    </main>
  )
}
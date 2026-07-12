import { useEffect, useState } from 'react'
import { obtenerPagosAdmin } from '../../api/admin'
import {
  aprobarPagoEfectivo,
  aprobarTransferencia,
  obtenerPago,
  rechazarTransferencia,
} from '../../api/pagos'
import { AdminLayout } from '../../layout/AdminLayout'
import type { Pago } from '../../types/pago'

function formatearGuaranies(valor: string | number | null | undefined) {
  return `Gs. ${Number(valor ?? 0).toLocaleString('es-PY')}`
}

function formatearFecha(fecha: string | null) {
  if (!fecha) return 'Sin procesar'

  return new Date(fecha).toLocaleString('es-PY', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function estiloEstadoPago(estado: string) {
  if (estado === 'approved') {
    return 'bg-green-50 text-green-700'
  }

  if (estado === 'rejected') {
    return 'bg-red-50 text-red-700'
  }

  if (estado === 'refunded') {
    return 'bg-purple-50 text-purple-700'
  }

  if (estado === 'cancelled') {
    return 'bg-gray-100 text-gray-700'
  }

  return 'bg-yellow-50 text-yellow-700'
}

export function AdminPagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aprobando, setAprobando] = useState<string | null>(null)

  // Modal de revisión de comprobante de transferencia
  const [pagoEnRevision, setPagoEnRevision] = useState<Pago | null>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [errorModal, setErrorModal] = useState('')
  const [procesandoTransferencia, setProcesandoTransferencia] = useState(false)
  const [mostrarMotivoRechazo, setMostrarMotivoRechazo] = useState(false)
  const [motivoRechazo, setMotivoRechazo] = useState('')

  useEffect(() => {
    async function cargarPagos() {
      try {
        setCargando(true)
        setError('')

        const respuesta = await obtenerPagosAdmin()
        setPagos(respuesta.resultados)
      } catch {
        setError('No se pudieron cargar los pagos.')
      } finally {
        setCargando(false)
      }
    }

    cargarPagos()
  }, [])

  async function handleAprobarEfectivo(pagoId: string) {
    const confirmado = window.confirm(
      '¿Confirmás que recibiste el efectivo de este pago?'
    )
    if (!confirmado) return

    try {
      setAprobando(pagoId)
      const pagoActualizado = await aprobarPagoEfectivo(pagoId)

      setPagos((actuales) =>
        actuales.map((p) => (p.id === pagoId ? pagoActualizado : p))
      )
    } catch {
      alert('No se pudo confirmar el cobro. Intentá de nuevo.')
    } finally {
      setAprobando(null)
    }
  }

  // El listado (PagoListSerializer) no trae comprobante_url, asi que
  // al abrir el modal pedimos el detalle completo aparte.
  async function handleAbrirRevision(pagoId: string) {
    try {
      setCargandoDetalle(true)
      setErrorModal('')
      setMostrarMotivoRechazo(false)
      setMotivoRechazo('')

      const detalle = await obtenerPago(pagoId)
      setPagoEnRevision(detalle)
    } catch {
      setErrorModal('No se pudo cargar el detalle del pago.')
      alert('No se pudo cargar el comprobante de este pago.')
    } finally {
      setCargandoDetalle(false)
    }
  }

  function handleCerrarModal() {
    setPagoEnRevision(null)
    setErrorModal('')
    setMostrarMotivoRechazo(false)
    setMotivoRechazo('')
  }

  function actualizarPagoEnLista(pagoActualizado: Pago) {
    setPagos((actuales) =>
      actuales.map((p) => (p.id === pagoActualizado.id ? pagoActualizado : p))
    )
  }

  async function handleAprobarTransferencia() {
    if (!pagoEnRevision) return

    const confirmado = window.confirm(
      '¿Confirmás que el comprobante es válido y el importe fue acreditado?'
    )
    if (!confirmado) return

    try {
      setProcesandoTransferencia(true)
      setErrorModal('')

      const pagoActualizado = await aprobarTransferencia(pagoEnRevision.id)

      actualizarPagoEnLista(pagoActualizado)
      handleCerrarModal()
    } catch {
      setErrorModal('No se pudo aprobar la transferencia. Intentá de nuevo.')
    } finally {
      setProcesandoTransferencia(false)
    }
  }

  async function handleRechazarTransferencia() {
    if (!pagoEnRevision) return

    try {
      setProcesandoTransferencia(true)
      setErrorModal('')

      const pagoActualizado = await rechazarTransferencia(
        pagoEnRevision.id,
        motivoRechazo
      )

      actualizarPagoEnLista(pagoActualizado)
      handleCerrarModal()
    } catch {
      setErrorModal('No se pudo rechazar la transferencia. Intentá de nuevo.')
    } finally {
      setProcesandoTransferencia(false)
    }
  }

  return (
    <AdminLayout>
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de pagos
        </h1>

        <p className="mt-1 text-sm text-gray-600">
          Consultá los pagos registrados y su estado actual.
        </p>
      </header>

      {error && (
        <div className="mt-6 rounded bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {cargando ? (
          <p className="p-6 text-gray-600">Cargando pagos...</p>
        ) : pagos.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No hay pagos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Pago
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Orden
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Pasarela
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Procesado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Transacción
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {pago.id.slice(0, 8).toUpperCase()}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(pago.fecha_creacion).toLocaleDateString('es-PY')}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {pago.orden.slice(0, 8).toUpperCase()}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {pago.pasarela_display}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${estiloEstadoPago(
                          pago.estado
                        )}`}
                      >
                        {pago.estado_display}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                      {formatearGuaranies(pago.monto)}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatearFecha(pago.fecha_procesado)}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-600">
                      {pago.id_transaccion || 'Sin transacción'}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {pago.pasarela === 'efectivo' &&
                        pago.estado === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleAprobarEfectivo(pago.id)}
                            disabled={aprobando === pago.id}
                            className="rounded bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {aprobando === pago.id
                              ? 'Confirmando...'
                              : 'Confirmar cobro'}
                          </button>
                        )}

                      {pago.pasarela === 'transferencia' &&
                        pago.estado === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleAbrirRevision(pago.id)}
                            disabled={cargandoDetalle}
                            className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Revisar comprobante
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de revisión de comprobante de transferencia */}
      {pagoEnRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                Revisar transferencia
              </h2>

              <button
                type="button"
                onClick={handleCerrarModal}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-700">
              <p>
                <strong>Pago:</strong> {pagoEnRevision.id.slice(0, 8).toUpperCase()}
              </p>
              <p>
                <strong>Orden:</strong> {pagoEnRevision.orden.slice(0, 8).toUpperCase()}
              </p>
              <p>
                <strong>Monto:</strong> {formatearGuaranies(pagoEnRevision.monto)}
              </p>
              {pagoEnRevision.referencia_cliente && (
                <p>
                  <strong>Referencia informada:</strong>{' '}
                  {pagoEnRevision.referencia_cliente}
                </p>
              )}
              {pagoEnRevision.observacion_cliente && (
                <p>
                  <strong>Comentario del cliente:</strong>{' '}
                  {pagoEnRevision.observacion_cliente}
                </p>
              )}
            </div>

            <div className="mt-4">
              {pagoEnRevision.comprobante_url ? (
                <a
                  href={pagoEnRevision.comprobante_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                >
                  📄 Ver comprobante
                </a>
              ) : (
                <p className="text-sm text-gray-500">
                  El cliente todavía no subió un comprobante.
                </p>
              )}
            </div>

            {errorModal && (
              <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
                {errorModal}
              </div>
            )}

            {mostrarMotivoRechazo && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Motivo del rechazo (opcional)
                </label>
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  rows={2}
                  placeholder="Ej: el comprobante no corresponde al monto del pedido"
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-2">
              {!mostrarMotivoRechazo ? (
                <>
                  <button
                    type="button"
                    onClick={() => setMostrarMotivoRechazo(true)}
                    disabled={procesandoTransferencia}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Rechazar
                  </button>

                  <button
                    type="button"
                    onClick={handleAprobarTransferencia}
                    disabled={
                      procesandoTransferencia || !pagoEnRevision.comprobante_url
                    }
                    className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {procesandoTransferencia ? 'Procesando...' : 'Aprobar'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setMostrarMotivoRechazo(false)}
                    disabled={procesandoTransferencia}
                    className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Volver
                  </button>

                  <button
                    type="button"
                    onClick={handleRechazarTransferencia}
                    disabled={procesandoTransferencia}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {procesandoTransferencia
                      ? 'Procesando...'
                      : 'Confirmar rechazo'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
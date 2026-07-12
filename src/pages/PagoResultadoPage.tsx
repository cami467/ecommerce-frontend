import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'
import { obtenerPago } from '../api/pagos'
import type { Pago } from '../types/pago'

type EstadoVisual = 'cargando' | 'aprobado' | 'rechazado' | 'procesando' | 'error'

// El webhook de Stripe suele procesar el evento en menos de un
// segundo (sobre todo en local, vía stripe listen), pero como es
// asincrónico respecto al redirect del navegador, reintentamos la
// consulta al backend unas pocas veces antes de resignarnos a
// mostrar "seguí en revisión".
const INTENTOS_MAXIMOS = 5
const ESPERA_ENTRE_INTENTOS_MS = 2000

export function PagoResultadoPage() {
  const [searchParams] = useSearchParams()
  const pagoId = searchParams.get('pago_id')
  const redirectStatus = searchParams.get('redirect_status')

  const [pago, setPago] = useState<Pago | null>(null)
  const [estadoVisual, setEstadoVisual] = useState<EstadoVisual>('cargando')

  useEffect(() => {
    if (!pagoId) {
      setEstadoVisual('error')
      return
    }

    let cancelado = false

    async function consultarEstado(intento: number) {
      try {
        const data = await obtenerPago(pagoId as string)
        if (cancelado) return

        setPago(data)

        if (data.estado === 'approved') {
          setEstadoVisual('aprobado')
          return
        }

        if (data.estado === 'rejected') {
          setEstadoVisual('rechazado')
          return
        }

        if (intento < INTENTOS_MAXIMOS) {
          setEstadoVisual('procesando')
          setTimeout(() => consultarEstado(intento + 1), ESPERA_ENTRE_INTENTOS_MS)
        } else {
          setEstadoVisual('procesando')
        }
      } catch {
        if (!cancelado) setEstadoVisual('error')
      }
    }

    consultarEstado(0)

    return () => {
      cancelado = true
    }
  }, [pagoId])

  const contenido = (() => {
    if (estadoVisual === 'cargando') {
      return {
        icono: <Loader2 className="h-12 w-12 animate-spin text-blue-600" strokeWidth={2} />,
        titulo: 'Confirmando tu pago...',
        descripcion: 'Estamos verificando el resultado con Stripe.',
        color: 'border-blue-200 bg-blue-50',
      }
    }

    if (estadoVisual === 'aprobado') {
      return {
        icono: <CheckCircle2 className="h-12 w-12 text-green-600" strokeWidth={2} />,
        titulo: '¡Pago aprobado!',
        descripcion: 'Tu pedido fue confirmado correctamente.',
        color: 'border-green-200 bg-green-50',
      }
    }

    if (estadoVisual === 'rechazado') {
      return {
        icono: <XCircle className="h-12 w-12 text-red-600" strokeWidth={2} />,
        titulo: 'El pago no pudo procesarse',
        descripcion: 'Probá de nuevo con otro método de pago.',
        color: 'border-red-200 bg-red-50',
      }
    }

    if (estadoVisual === 'procesando') {
      return {
        icono: <Clock className="h-12 w-12 text-yellow-600" strokeWidth={2} />,
        titulo: 'Tu pago sigue en revisión',
        descripcion:
          'Esto puede tardar unos segundos más. Podés revisar el estado desde el detalle de tu pedido.',
        color: 'border-yellow-200 bg-yellow-50',
      }
    }

    return {
      icono: <XCircle className="h-12 w-12 text-gray-500" strokeWidth={2} />,
      titulo: 'No pudimos confirmar el estado',
      descripcion: 'Revisá el detalle de tu pedido para ver el estado actual del pago.',
      color: 'border-gray-200 bg-gray-50',
    }
  })()

  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className={`rounded-lg border p-8 ${contenido.color}`}>
        <div className="flex justify-center">{contenido.icono}</div>
        <h1 className="mt-4 text-xl font-bold text-gray-900">{contenido.titulo}</h1>
        <p className="mt-2 text-sm text-gray-700">{contenido.descripcion}</p>

        {redirectStatus && estadoVisual === 'cargando' && (
          <p className="mt-3 text-xs text-gray-400">
            Estado inicial de Stripe: {redirectStatus}
          </p>
        )}
      </div>

      {pago && (
        <Link
          to={`/ordenes/${pago.orden}`}
          className="mt-6 inline-block text-sm text-blue-600 hover:underline"
        >
          Ver detalle del pedido
        </Link>
      )}
    </main>
  )
}
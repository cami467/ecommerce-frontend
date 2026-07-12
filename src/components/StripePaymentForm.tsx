import { useState } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Loader2 } from 'lucide-react'

interface StripePaymentFormProps {
  pagoId: string
}

export function StripePaymentForm({ pagoId }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!stripe || !elements) return

    setProcesando(true)
    setError('')

    // El pago_id va en la URL de retorno para que PagoResultadoPage
    // sepa qué pago consultar cuando Stripe redirija de vuelta
    // (por ejemplo, después de una autenticación 3D Secure).
    const resultado = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/pagos/resultado?pago_id=${pagoId}`,
      },
    })

    // Si confirmPayment() resuelve con un error acá mismo (sin
    // redirigir), es un fallo inmediato: tarjeta rechazada, datos
    // inválidos, etc. Si todo va bien, el navegador redirige a
    // return_url y esta línea nunca se ejecuta — por eso el estado
    // real y definitivo del pago SIEMPRE lo decide el webhook,
    // nunca esta pantalla.
    if (resultado.error) {
      setError(
        resultado.error.message ?? 'No se pudo completar el pago. Probá de nuevo.'
      )
      setProcesando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || !elements || procesando}
        className="flex w-full items-center justify-center gap-2 rounded bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-300"
      >
        {procesando && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
        {procesando ? 'Procesando...' : 'Pagar'}
      </button>
    </form>
  )
}
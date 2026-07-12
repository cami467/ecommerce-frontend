import { loadStripe } from '@stripe/stripe-js'

// TEMPORAL: para diagnosticar el error 401 del Payment Element.
// Borrar este console.log una vez confirmado que la key es correcta.
console.log(
  'VITE_STRIPE_PUBLIC_KEY:',
  JSON.stringify(import.meta.env.VITE_STRIPE_PUBLIC_KEY),
  '— longitud:',
  (import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? '').length
)

// loadStripe() cachea la promesa internamente, así que este módulo
// puede importarse desde varios componentes sin recrear la conexión
// a Stripe cada vez.
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
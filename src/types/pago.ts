export type PasarelaPago =
  | 'stripe'
  | 'mercado_pago'
  | 'efectivo'
  | 'transferencia'

export type EstadoPago =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'refunded'
  | 'cancelled'

export interface Pago {
  id: string
  orden: string
  pasarela: PasarelaPago
  pasarela_display: string
  estado: EstadoPago
  estado_display: string
  es_exitoso: boolean
  esta_pendiente: boolean
  es_reembolsable: boolean
  monto: number
  id_transaccion: string | null
  fecha_procesado: string | null
  fecha_creacion: string
}
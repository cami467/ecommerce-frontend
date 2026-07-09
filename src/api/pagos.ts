import  apiClient  from './client'
import type { Pago, PasarelaPago } from '../types/pago'

export async function crearPago(data: {
  orden_id: string
  pasarela: PasarelaPago
}) {
  const response = await apiClient.post<Pago>('/pagos/crear/', data)
  return response.data
}

export async function simularPago(data: {
  pago_id: string
  resultado: 'approved' | 'rejected'
}) {
  const response = await apiClient.post<Pago>('/pagos/simular/', data)
  return response.data
}
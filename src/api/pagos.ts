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

interface PagosResponse {
  resultados?: Pago[]
  results?: Pago[]
}

export async function obtenerPagos(): Promise<Pago[]> {
  const response = await apiClient.get<Pago[] | PagosResponse>('/pagos/')

  if (Array.isArray(response.data)) {
    return response.data
  }

  return response.data.resultados ?? response.data.results ?? []
}

export async function obtenerPagoDeOrden(ordenId: string): Promise<Pago | null> {
  const pagos = await obtenerPagos()

  return (
    pagos.find((pago) => pago.orden === ordenId) ??
    null
  )
}
import apiClient from './client'
import type { Pago, PasarelaPago } from '../types/pago'

// client_secret solo viene en la respuesta cuando pasarela es
// 'stripe', y nunca se persiste en el modelo Pago del backend
// (por eso no forma parte del tipo Pago) — se usa una sola vez acá
// en el frontend para inicializar el Payment Element.
export interface RespuestaCrearPago extends Pago {
  client_secret?: string
}

export async function crearPago(data: {
  orden_id: string
  pasarela: PasarelaPago
}): Promise<RespuestaCrearPago> {
  const response = await apiClient.post<RespuestaCrearPago>('/pagos/crear/', data)
  return response.data
}

export async function simularPago(data: {
  pago_id: string
  resultado: 'approved' | 'rejected'
}) {
  const response = await apiClient.post<Pago>('/pagos/simular/', data)
  return response.data
}

export async function aprobarPagoEfectivo(pagoId: string): Promise<Pago> {
  const response = await apiClient.post<Pago>(
    `/pagos/${pagoId}/aprobar-efectivo/`
  )
  return response.data
}

export async function subirComprobanteTransferencia(
  pagoId: string,
  comprobante: File,
  referenciaCliente: string,
  observacionCliente: string = ''
): Promise<Pago> {
  const formData = new FormData()
  formData.append('comprobante', comprobante)
  formData.append('referencia_cliente', referenciaCliente)
  formData.append('observacion_cliente', observacionCliente)

  const response = await apiClient.post<Pago>(
    `/pagos/${pagoId}/comprobante/`,
    formData
  )
  return response.data
}

export async function aprobarTransferencia(pagoId: string): Promise<Pago> {
  const response = await apiClient.post<Pago>(
    `/pagos/${pagoId}/aprobar-transferencia/`
  )
  return response.data
}

export async function rechazarTransferencia(
  pagoId: string,
  motivo: string = ''
): Promise<Pago> {
  const response = await apiClient.post<Pago>(
    `/pagos/${pagoId}/rechazar-transferencia/`,
    { motivo }
  )
  return response.data
}

export async function obtenerPago(pagoId: string): Promise<Pago> {
  const response = await apiClient.get<Pago>(`/pagos/${pagoId}/`)
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

  return pagos.find((pago) => pago.orden === ordenId) ?? null
}
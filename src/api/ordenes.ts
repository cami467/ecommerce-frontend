import  apiClient  from './client'
import type { Orden } from '../types/orden'

interface CrearOrdenPayload {
  codigo_cupon?: string
  notas?: string
}

export async function crearOrdenDesdeCarrito(payload: CrearOrdenPayload) {
  const response = await apiClient.post<Orden>('/ordenes/crear-desde-carrito/', payload)
  return response.data
}

export async function obtenerOrdenPorId(id: string) {
  const response = await apiClient.get<Orden>(`/ordenes/${id}/`)
  return response.data
}
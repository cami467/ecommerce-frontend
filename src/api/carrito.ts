import apiClient from './client'
import type { CarritoItem } from '../types/carrito'

interface AgregarAlCarritoPayload {
  variante_id: string
  cantidad: number
}

export async function agregarAlCarrito(
  payload: AgregarAlCarritoPayload
): Promise<CarritoItem> {
  const response = await apiClient.post<CarritoItem>('/carrito/agregar/', {
    variante_id: payload.variante_id,
    cantidad: payload.cantidad,
  })

  return response.data
}

export async function obtenerCarrito() {
  const response = await apiClient.get('/carrito/')
  return response.data
}

export async function actualizarCantidadItem(itemId: string, cantidad: number) {
  const response = await apiClient.patch(`/carrito/items/${itemId}/`, {
    cantidad,
  })
  return response.data
}

export async function eliminarItemCarrito(itemId: string) {
  await apiClient.delete(`/carrito/items/${itemId}/`)
}

export async function vaciarCarrito() {
  await apiClient.delete('/carrito/vaciar/')
}
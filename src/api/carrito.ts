import apiClient from './client'
import type { CarritoItem } from '../types/carrito'

interface AgregarAlCarritoPayload {
  variante_id: string
  cantidad: number
}

function notificarCarritoActualizado() {
  window.dispatchEvent(new Event('carrito:actualizado'))
}

export async function agregarAlCarrito(
  payload: AgregarAlCarritoPayload
): Promise<CarritoItem> {
  const response = await apiClient.post<CarritoItem>('/carrito/agregar/', {
    variante_id: payload.variante_id,
    cantidad: payload.cantidad,
  })

  notificarCarritoActualizado()
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

  notificarCarritoActualizado()
  return response.data
}

export async function eliminarItemCarrito(itemId: string) {
  await apiClient.delete(`/carrito/items/${itemId}/`)
  notificarCarritoActualizado()
}

export async function vaciarCarrito() {
  await apiClient.delete('/carrito/vaciar/')
  notificarCarritoActualizado()
}
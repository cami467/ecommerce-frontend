import  apiClient  from './client'
import type { Producto } from '../types/producto'

export async function obtenerProductos(): Promise<Producto[]> {
  const response = await apiClient.get<Producto[]>('/productos/')
  return response.data
}

export async function obtenerProductoPorSlug(slug: string): Promise<Producto> {
  const response = await apiClient.get<Producto>(`/productos/${slug}/`)
  return response.data
}
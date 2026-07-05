import  apiClient  from './client'
import type { Producto } from '../types/producto'

interface ProductosResponse {
  total: number
  paginas: number
  pagina_actual: number
  siguiente: string | null
  anterior: string | null
  resultados: Producto[]
}

export async function obtenerProductos(): Promise<Producto[]> {
  const response = await apiClient.get<ProductosResponse>('/productos/')
  return response.data.resultados
}

export async function obtenerProductoPorSlug(slug: string): Promise<Producto> {
  const response = await apiClient.get<Producto>(`/productos/${slug}/`)
  return response.data
}
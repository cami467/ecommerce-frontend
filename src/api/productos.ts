import apiClient from './client'
import type { Producto, ProductoDetalle } from '../types/producto'

interface ProductosResponse {
  total: number
  paginas: number
  pagina_actual: number
  siguiente: string | null
  anterior: string | null
  resultados: Producto[]
}

export async function obtenerProductos(pagina = 1): Promise<ProductosResponse> {
  const response = await apiClient.get<ProductosResponse>('/productos/', {
    params: {
      page: pagina,
    },
  })

  return response.data
}

export async function obtenerProductoPorSlug(slug: string): Promise<ProductoDetalle> {
  const response = await apiClient.get<ProductoDetalle>(`/productos/${slug}/`)
  return response.data
}


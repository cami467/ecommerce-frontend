import  apiClient  from './client'
import type { Categoria } from '../types/categoria'

interface CategoriasResponse {
  resultados?: Categoria[]
  results?: Categoria[]
}

export async function obtenerCategorias(): Promise<Categoria[]> {
  const response = await apiClient.get<Categoria[] | CategoriasResponse>('/categorias/')

  if (Array.isArray(response.data)) {
    return response.data
  }

  return response.data.resultados ?? response.data.results ?? []
}
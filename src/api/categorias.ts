import apiClient from './client'
import type { Categoria } from '../types/categoria'

interface CategoriasResponse {
  total: number
  paginas: number
  pagina_actual: number
  siguiente: string | null
  anterior: string | null
  resultados: Categoria[]
}

export async function obtenerCategorias(): Promise<Categoria[]> {
  const response = await apiClient.get<CategoriasResponse | Categoria[]>(
    '/productos/categorias/'
  )

  if (Array.isArray(response.data)) {
    return response.data
  }

  return response.data.resultados
}
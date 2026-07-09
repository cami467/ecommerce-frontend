import  apiClient  from './client'
import type { Orden } from '../types/orden'

interface CrearOrdenPayload {
  codigo_cupon?: string
  notas?: string
}

export async function crearOrdenDesdeCarrito(payload: CrearOrdenPayload) {
  const response = await apiClient.post<Orden>('/ordenes/crear/', payload)
  return response.data
}

export async function obtenerOrdenPorId(id: string) {
  const response = await apiClient.get<Orden>(`/ordenes/${id}/`)
  return response.data
}

interface OrdenesResponse {
  total?: number
  paginas?: number
  pagina_actual?: number
  siguiente?: string | null
  anterior?: string | null
  resultados?: Orden[]
  results?: Orden[]
}

export async function obtenerMisOrdenes(): Promise<Orden[]> {
  const response = await apiClient.get<Orden[] | OrdenesResponse>('/ordenes/')

  if (Array.isArray(response.data)) {
    return response.data
  }

  return response.data.resultados ?? response.data.results ?? []
}
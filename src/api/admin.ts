import apiClient from './client'
import type { Orden } from '../types/orden'
import type { Pago } from '../types/pago'
import type { Producto } from '../types/producto'

interface RespuestaPaginada<T> {
  total?: number
  count?: number
  resultados?: T[]
  results?: T[]
}

function extraerResultados<T>(
  data: T[] | RespuestaPaginada<T>
): {
  total: number
  resultados: T[]
} {
  if (Array.isArray(data)) {
    return {
      total: data.length,
      resultados: data,
    }
  }

  const resultados = data.resultados ?? data.results ?? []

  return {
    total: data.total ?? data.count ?? resultados.length,
    resultados,
  }
}

export async function obtenerOrdenesAdmin() {
  const response = await apiClient.get<
    Orden[] | RespuestaPaginada<Orden>
  >('/ordenes/')

  return extraerResultados(response.data)
}

export async function obtenerPagosAdmin() {
  const response = await apiClient.get<
    Pago[] | RespuestaPaginada<Pago>
  >('/pagos/')

  return extraerResultados(response.data)
}

export async function obtenerProductosAdmin() {
  const response = await apiClient.get<
    Producto[] | RespuestaPaginada<Producto>
  >('/productos/')

  return extraerResultados(response.data)
}
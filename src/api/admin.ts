import apiClient from './client'
import type { Orden } from '../types/orden'
import type { Pago } from '../types/pago'
import type {
  Producto,
  ProductoImagen,
  ProductoVariante,
} from '../types/producto'

import type { EstadisticasAdmin } from '../types/estadisticas'

interface RespuestaPaginada<T> {
  total?: number
  count?: number
  paginas?: number
  pagina_actual?: number
  siguiente?: string | null
  anterior?: string | null
  resultados?: T[]
  results?: T[]
}

function extraerResultados<T>(
  data: T[] | RespuestaPaginada<T>
): {
  total: number
  resultados: T[]
  paginas: number
  paginaActual: number
  siguiente: string | null
  anterior: string | null
} {
  if (Array.isArray(data)) {
    return {
      total: data.length,
      resultados: data,
      paginas: 1,
      paginaActual: 1,
      siguiente: null,
      anterior: null,
    }
  }

  const resultados = data.resultados ?? data.results ?? []

  return {
    total: data.total ?? data.count ?? resultados.length,
    resultados,
    paginas: data.paginas ?? 1,
    paginaActual: data.pagina_actual ?? 1,
    siguiente: data.siguiente ?? null,
    anterior: data.anterior ?? null,
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

export async function obtenerProductosAdmin(pagina = 1) {
  const response = await apiClient.get<
    Producto[] | RespuestaPaginada<Producto>
  >('/productos/', {
    params: { page: pagina },
  })

  return extraerResultados(response.data)
}

export interface UsuarioAdmin {
  id: number
  email: string
  first_name: string
  last_name: string
  nombre_completo: string
  telefono: string | null
  avatar: string | null
  is_active: boolean
  is_staff: boolean
  date_joined: string
  last_login: string | null
}

export async function obtenerUsuariosAdmin() {
  const response = await apiClient.get<
    UsuarioAdmin[] | RespuestaPaginada<UsuarioAdmin>
  >('/usuarios/')

  return extraerResultados(response.data)
}

export interface ProductoPayload {
  nombre?: string
  categoria?: string
  descripcion?: string
  precio_base?: number
  porcentaje_descuento?: number
  tasa_iva?: '10' | '5' | '0'
  es_destacado?: boolean
  esta_activo?: boolean
}

export async function crearProducto(
  payload: ProductoPayload
): Promise<Producto> {
  const response = await apiClient.post<Producto>(
    '/productos/',
    payload
  )

  return response.data
}

export async function actualizarProducto(
  slug: string,
  payload: ProductoPayload
): Promise<Producto> {
  const response = await apiClient.patch<Producto>(
    `/productos/${slug}/`,
    payload
  )

  return response.data
}

export async function obtenerProductoAdminPorSlug(
  slug: string
): Promise<Producto> {
  const response = await apiClient.get<Producto>(
    `/productos/${slug}/`
  )

  return response.data
}

// ---------------- IMÁGENES ----------------

export async function subirImagenProducto(
  productoId: string,
  archivo: File,
  esPrincipal = true
): Promise<ProductoImagen> {
  const formData = new FormData()
  formData.append('producto', productoId)
  formData.append('imagen', archivo)
  formData.append('es_principal', String(esPrincipal))

  const response = await apiClient.post<ProductoImagen>(
    '/productos/imagenes/',
    formData
  )

  return response.data
}

export async function eliminarImagenProducto(
  imagenId: string
): Promise<void> {
  await apiClient.delete(`/productos/imagenes/${imagenId}/`)
}

export async function marcarImagenPrincipal(
  imagenId: string
): Promise<{ mensaje: string }> {
  const response = await apiClient.patch<{ mensaje: string }>(
    `/productos/imagenes/${imagenId}/marcar-principal/`
  )

  return response.data
}

// ---------------- VARIANTES ----------------

export interface VarianteBasePayload {
  nombre: string
  sku: string
  modificador_precio: number
  inventario: number
  stock_minimo: number
  atributos: Record<string, string>
  esta_activo: boolean
}

export interface CrearVariantePayload extends VarianteBasePayload {
  producto: string
}

export type ActualizarVariantePayload = Partial<VarianteBasePayload>

export async function crearVariante(
  payload: CrearVariantePayload
): Promise<ProductoVariante> {
  const response = await apiClient.post<ProductoVariante>(
    '/productos/variantes/',
    payload
  )

  return response.data
}

export async function actualizarVariante(
  varianteId: string,
  payload: ActualizarVariantePayload
): Promise<ProductoVariante> {
  const response = await apiClient.patch<ProductoVariante>(
    `/productos/variantes/${varianteId}/`,
    payload
  )

  return response.data
}

export async function obtenerEstadisticasAdmin(): Promise<EstadisticasAdmin> {
  const response = await apiClient.get<EstadisticasAdmin>(
    '/admin/estadisticas/'
  )

  return response.data
}
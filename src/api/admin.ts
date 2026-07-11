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

export async function subirImagenProducto(
  productoId: string,
  archivo: File,
  esPrincipal = true
): Promise<void> {
  const formData = new FormData()
  formData.append('producto', productoId)
  formData.append('imagen', archivo)
  formData.append('es_principal', String(esPrincipal))

  // No se pasa Content-Type a mano: el navegador arma el boundary
  // del multipart solo. Si el apiClient fuerza JSON por default,
  await apiClient.post('/productos/imagenes/', formData, {
  })
}

export interface VariantePayload {
  producto: string
  nombre: string
  sku: string
  modificador_precio?: number
  inventario: number
  stock_minimo?: number
  atributos?: Record<string, string>
  esta_activo?: boolean
}

export async function crearVariante(
  payload: VariantePayload
): Promise<void> {
  await apiClient.post('/productos/variantes/', payload)
}
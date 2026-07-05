export interface Categoria {
  id: number
  nombre: string
  slug: string
  esta_activo: boolean
}

export interface ProductoImagen {
  id: string
  producto: string
  url: string
  es_principal: boolean
  orden: number
}

export interface VarianteProducto {
  id: number
  sku: string
  nombre: string
  precio: string
  precio_final: string
  inventario: number
  esta_disponible: boolean
}

export interface Producto {
  id: string
  nombre: string
  slug: string
  categoria_nombre: string
  precio_base: string
  porcentaje_descuento: string
  precio_con_descuento: string
  tasa_iva: string
  monto_iva_incluido: string
  imagen_principal: string | null
  es_destacado: boolean
  esta_activo: boolean
}

export interface ProductoDetalle {
  id: string
  nombre: string
  slug: string
  categoria: string
  categoria_detalle: Categoria
  descripcion: string
  precio_base: string
  porcentaje_descuento: string
  precio_con_descuento: string
  tasa_iva: string
  monto_iva_incluido: string
  es_destacado: boolean
  variantes: VarianteProducto[]
  imagenes: ProductoImagen[]
  esta_activo: boolean
  fecha_creacion: string
}
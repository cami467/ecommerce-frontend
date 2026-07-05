export interface Categoria {
  id: number
  nombre: string
  slug: string
}

export interface ProductoImagen {
  id: number
  imagen: string
  alt_text?: string
  es_principal: boolean
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
  id: number
  nombre: string
  slug: string
  descripcion: string
  precio: string
  precio_final: string
  tiene_descuento: boolean
  porcentaje_descuento: string
  inventario: number
  esta_disponible: boolean
  categoria: Categoria
  imagenes: ProductoImagen[]
  variantes: VarianteProducto[]
}
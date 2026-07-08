import type { VarianteProducto } from './producto'

export interface CarritoItem {
  id: string
  variante: string
  producto_nombre: string
  variante_nombre: string
  imagen_producto: string | null
  precio_unitario: string
  variante_detalle: VarianteProducto
  cantidad: number
  subtotal: string
  esta_activo: boolean
  stock_disponible: number
}

export interface Carrito {
  id: string
  usuario: number
  items: CarritoItem[]
  cantidad_items: number
  subtotal: string
  total: string 
  total_items: number
  esta_activo: boolean
}
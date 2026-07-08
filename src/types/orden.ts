export interface OrdenItem {
  id: string
  variante: string
  nombre_producto: string
  nombre_variante: string
  cantidad: number
  precio_unitario: number
  tasa_iva: string
  subtotal: number
  monto_iva: number
}

export interface Orden {
  id: string
  numero_orden: string
  usuario: number
  estado: string
  estado_display: string
  puede_cancelarse: boolean
  subtotal: number
  monto_descuento: number
  costo_envio: number
  total: number
  codigo_cupon: string | null
  notas: string
  items: OrdenItem[]
  fecha_creacion: string
}
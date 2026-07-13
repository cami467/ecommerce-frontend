export interface UltimaCompra {
  id: string
  numero_orden: string
  estado: string
  estado_display: string
  total: number
  fecha_creacion: string
}

export interface UltimoPagoCliente {
  id: string
  orden_id: string
  pasarela: string
  pasarela_display: string
  estado: string
  estado_display: string
  monto: number
  fecha_creacion: string
  fecha_procesado: string | null
}

export interface DashboardCliente {
  pedidos_realizados: number
  dinero_gastado: number
  productos_favoritos: number
  ultima_compra: UltimaCompra | null
  ultimo_pago: UltimoPagoCliente | null
}
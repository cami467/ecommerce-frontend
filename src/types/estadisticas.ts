export interface ResumenEstadisticas {
  ventas_aprobadas: number
  ordenes_totales: number
  pagos_totales: number
  pagos_aprobados: number
  pagos_pendientes: number
  usuarios_totales: number
  productos_totales: number
  productos_activos: number
}

export interface OrdenesPorEstado {
  estado: string
  cantidad: number
}

export interface VentaPorMes {
  mes: string
  total: number
}

export interface ProductoMasVendido {
  nombre_producto: string
  cantidad: number
  ingresos: number
}

export interface StockBajo {
  variante_id: string
  producto: string
  variante: string
  inventario: number
  stock_minimo: number
}

export interface EstadisticasAdmin {
  resumen: ResumenEstadisticas
  ordenes_por_estado: OrdenesPorEstado[]
  ventas_por_mes: VentaPorMes[]
  productos_mas_vendidos: ProductoMasVendido[]
  stock_bajo: StockBajo[]
}
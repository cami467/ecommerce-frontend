export interface Notificacion {
  id: string
  tipo: string
  tipo_display: string
  titulo: string
  mensaje: string
  leida: boolean
  fecha_leida: string | null
  referencia_id: string | null
  fecha_creacion: string
}

export interface NotificacionesResponse {
  total: number
  paginas: number
  pagina_actual: number
  siguiente: string | null
  anterior: string | null
  resultados: Notificacion[]
}
import apiClient from './client'
import type {
  Notificacion,
  NotificacionesResponse,
} from '../types/notificacion'

export async function obtenerNotificaciones(
  soloNoLeidas = false
): Promise<NotificacionesResponse> {
  const response = await apiClient.get<NotificacionesResponse>(
    '/notificaciones/',
    {
      params: soloNoLeidas ? { leida: false } : undefined,
    }
  )

  return response.data
}

export async function marcarNotificacionLeida(
  id: string
): Promise<Notificacion> {
  const response = await apiClient.post<Notificacion>(
    `/notificaciones/${id}/marcar_leida/`
  )

  return response.data
}

export async function marcarTodasLeidas(): Promise<{ mensaje: string }> {
  const response = await apiClient.post<{ mensaje: string }>(
    '/notificaciones/marcar_todas_leidas/'
  )

  return response.data
}
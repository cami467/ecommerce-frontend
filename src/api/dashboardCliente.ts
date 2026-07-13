import apiClient from './client'
import type { DashboardCliente } from '../types/dashboardCliente'

export async function obtenerDashboardCliente(): Promise<DashboardCliente> {
  const response = await apiClient.get<DashboardCliente>(
    '/usuarios/dashboard/'
  )

  return response.data
}
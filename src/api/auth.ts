import apiClient from './client'
import { tokenStorage } from './tokenStorage'
import { useAuthStore } from '../store/authStore'

interface LoginCredenciales {
  email: string
  password: string
}

interface LoginResponse {
  access: string
  refresh: string
}

interface RegistroDatos {
  username: string
  email: string
  password: string
  password2: string
  telefono?: string
}

export async function login(credenciales: LoginCredenciales): Promise<void> {
  const response = await apiClient.post<LoginResponse>('/token/', credenciales)
  const { access, refresh } = response.data

  useAuthStore.getState().setAccessToken(access)
  tokenStorage.setRefreshToken(refresh)

  // El login no devuelve datos del usuario, asi que los pedimos aparte
  const perfilResponse = await apiClient.get('/usuarios/perfil/')
  useAuthStore.getState().setUsuario(perfilResponse.data)
}

export async function registro(datos: RegistroDatos): Promise<void> {
  await apiClient.post('/usuarios/registro/', datos)
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStorage.getRefreshToken()

  try {
    if (refreshToken) {
      await apiClient.post('/usuarios/logout/', { refresh: refreshToken })
    }
  } catch {
    // Si falla el logout en el backend (token ya vencido, red caida, etc.)
    // igual limpiamos el estado local. El usuario no debe quedar "trabado".
  } finally {
    tokenStorage.clearRefreshToken()
    useAuthStore.getState().logout()
  }
}
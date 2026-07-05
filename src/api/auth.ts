import apiClient from './client'
import { tokenStorage } from './tokenStorage'
import { useAuthStore, type Usuario } from '../store/authStore'

interface LoginCredenciales {
  email: string
  password: string
}

interface LoginResponse {
  access: string
  refresh: string
  usuario: Usuario
}

interface RegistroDatos {
  email: string
  password: string
  password2: string
  first_name?: string
  last_name?: string
  telefono?: string
}

export async function login(credenciales: LoginCredenciales): Promise<void> {
  const response = await apiClient.post<LoginResponse>('/token/', {
    email: credenciales.email.trim().toLowerCase(),
    password: credenciales.password,
  })

  const { access, refresh, usuario } = response.data

  useAuthStore.getState().setAccessToken(access)
  useAuthStore.getState().setUsuario(usuario)
  tokenStorage.setRefreshToken(refresh)
}

export async function registro(datos: RegistroDatos): Promise<void> {
  await apiClient.post('/usuarios/registro/', {
    ...datos,
    email: datos.email.trim().toLowerCase(),
    first_name: datos.first_name?.trim() || undefined,
    last_name: datos.last_name?.trim() || undefined,
    telefono: datos.telefono?.trim() || undefined,
  })
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

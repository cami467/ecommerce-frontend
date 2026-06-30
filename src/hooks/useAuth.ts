import { useAuthStore } from '../store/authStore'
import * as authApi from '../api/auth'

export function useAuth() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const usuario = useAuthStore((state) => state.usuario)

  const estaAutenticado = accessToken !== null

  return {
    usuario,
    estaAutenticado,
    login: authApi.login,
    logout: authApi.logout,
    registro: authApi.registro,
  }
}
import { useAuthStore } from '../store/authStore'
import * as authApi from '../api/auth'

export function useAuth() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const usuario = useAuthStore((state) => state.usuario)
  const inicializando = useAuthStore((state) => state.inicializando)

  const estaAutenticado = accessToken !== null

  return {
    usuario,
    inicializando,
    estaAutenticado,
    login: authApi.login,
    logout: authApi.logout,
    registro: authApi.registro,
    inicializarSesion: authApi.inicializarSesion,
  }
}

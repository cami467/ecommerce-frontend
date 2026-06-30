import { create } from 'zustand'

interface Usuario {
  id: number
  username: string
  email: string
  nombre_completo: string
  telefono: string | null
  avatar: string | null
  date_joined: string
}

interface AuthState {
  accessToken: string | null
  usuario: Usuario | null
  setAccessToken: (token: string | null) => void
  setUsuario: (usuario: Usuario | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  usuario: null,
  setAccessToken: (token) => set({ accessToken: token }),
  setUsuario: (usuario) => set({ usuario }),
  logout: () => set({ accessToken: null, usuario: null }),
}))
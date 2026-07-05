import { create } from 'zustand'

export interface Usuario {
  id: number
  email: string
  first_name: string
  last_name: string
  nombre_completo: string | null
  telefono: string | null
  avatar: string | null
  date_joined: string
}

interface AuthState {
  accessToken: string | null
  usuario: Usuario | null
  inicializando: boolean
  setAccessToken: (token: string | null) => void
  setUsuario: (usuario: Usuario | null) => void
  setInicializando: (inicializando: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  usuario: null,
  inicializando: true,
  setAccessToken: (token) => set({ accessToken: token }),
  setUsuario: (usuario) => set({ usuario }),
  setInicializando: (inicializando) => set({ inicializando }),
  logout: () => set({ accessToken: null, usuario: null }),
}))
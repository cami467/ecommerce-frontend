// src/hooks/useAuth.ts
import { useAuthStore } from "../store/authStore"
import * as authApi from "../api/auth"

export function useAuth() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const usuario = useAuthStore((state) => state.usuario)
  const inicializando = useAuthStore((state) => state.inicializando)

  const estaAutenticado = accessToken !== null

  // 🔑 Función para refrescar el access token
  async function refreshAccessToken(): Promise<string | null> {
    const refresh = localStorage.getItem("refresh")
    if (!refresh) return null

    try {
      const resp = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh })
      })

      if (resp.ok) {
        const data = await resp.json()
        localStorage.setItem("access", data.access)
        useAuthStore.getState().setAccessToken(data.access)
        return data.access
      } else {
        // si falla → cerrar sesión usando authApi.logout
        authApi.logout()
        return null
      }
    } catch {
      authApi.logout()
      return null
    }
  }

  // 🔑 Función para hacer fetch con token y refresco automático
  async function fetchConToken(url: string, options: RequestInit = {}) {
    let access = localStorage.getItem("access")

    let resp = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access}`
      }
    })

    if (resp.status === 401) {
      const newAccess = await refreshAccessToken()
      if (newAccess) {
        resp = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            "Content-Type": "application/json",
            "Authorization": `Bearer ${newAccess}`
          }
        })
      }
    }

    return resp
  }

  return {
    usuario,
    inicializando,
    estaAutenticado,
    login: authApi.login,
    logout: authApi.logout,
    registro: authApi.registro,
    inicializarSesion: authApi.inicializarSesion,
    refreshAccessToken,
    fetchConToken, // 👉 ahora podés usar esto en tus páginas
  }
}

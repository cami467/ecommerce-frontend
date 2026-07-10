import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
} from '../api/notificaciones'
import type { Notificacion } from '../types/notificacion'
import { useAuth } from '../hooks/useAuth'
import { useAuthStore } from '../store/authStore'

// Deriva la URL del WebSocket a partir de VITE_API_URL, reemplazando
// el esquema http(s) por ws(s) y quitando el sufijo /api.
// Ej: "http://127.0.0.1:8000/api" -> "ws://127.0.0.1:8000"
// En producción, "https://miapp.com/api" -> "wss://miapp.com"
function construirWsBaseUrl(): string {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api'
  const sinSufijoApi = apiUrl.replace(/\/api\/?$/, '')
  return sinSufijoApi.replace(/^http/, 'ws')
}

const WS_BASE_URL = construirWsBaseUrl()

// Fallback de seguridad: si el WebSocket se cae y no logra reconectar
// (por ejemplo, el usuario perdió wifi por un buen rato), este polling
// de baja frecuencia asegura que la lista igual se termine actualizando
// al volver a tener conexión. Ya no es la vía principal de actualización.
const INTERVALO_POLLING_FALLBACK_MS = 5 * 60_000 // 5 minutos

interface NotificacionesContextValue {
  notificaciones: Notificacion[]
  cantidadNoLeidas: number
  cargando: boolean
  refrescar: () => Promise<void>
  marcarLeida: (id: string) => Promise<void>
  marcarTodas: () => Promise<void>
}

const NotificacionesContext =
  createContext<NotificacionesContextValue | null>(null)

export function NotificacionesProvider({ children }: { children: ReactNode }) {
  const { estaAutenticado, refreshAccessToken } = useAuth()
  const accessToken = useAuthStore((state) => state.accessToken)

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0)
  const [cargando, setCargando] = useState(false)

  // Referencias para manejar la conexión y sus reintentos sin que
  // cambios de estado disparen recreaciones innecesarias del efecto.
  const wsRef = useRef<WebSocket | null>(null)
  const reconectarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intentosReconexionRef = useRef(0)

  const refrescar = useCallback(async () => {
    if (!estaAutenticado) {
      setNotificaciones([])
      setCantidadNoLeidas(0)
      return
    }

    try {
      setCargando(true)

      const data = await obtenerNotificaciones(false)

      setNotificaciones(data.resultados ?? [])
      setCantidadNoLeidas(
        (data.resultados ?? []).filter((item) => !item.leida).length
      )
    } catch {
      setNotificaciones([])
      setCantidadNoLeidas(0)
    } finally {
      setCargando(false)
    }
  }, [estaAutenticado])

  // Carga inicial al montar (o al loguearse/desloguearse).
  useEffect(() => {
    refrescar()
  }, [refrescar])

  // Fallback de polling de baja frecuencia (red de seguridad, ver
  // comentario de INTERVALO_POLLING_FALLBACK_MS más arriba).
  useEffect(() => {
    if (!estaAutenticado) return

    const intervalo = setInterval(() => {
      refrescar()
    }, INTERVALO_POLLING_FALLBACK_MS)

    return () => clearInterval(intervalo)
  }, [estaAutenticado, refrescar])

  // Conexión WebSocket: reemplaza el polling frecuente por push en
  // tiempo real. Incluye reconexión automática con backoff exponencial
  // (1s, 2s, 4s, 8s... hasta un máximo de 30s) para cubrir cortes de
  // wifi, sleep de la compu, o reinicios del backend en desarrollo.
  useEffect(() => {
    if (!estaAutenticado || !accessToken) {
      wsRef.current?.close()
      wsRef.current = null
      return
    }

    let cancelado = false

    function limpiarReintentoPendiente() {
      if (reconectarTimeoutRef.current) {
        clearTimeout(reconectarTimeoutRef.current)
        reconectarTimeoutRef.current = null
      }
    }

    async function conectar(tokenParaConectar: string) {
      if (cancelado) return

      const ws = new WebSocket(
        `${WS_BASE_URL}/ws/notificaciones/?token=${tokenParaConectar}`
      )
      wsRef.current = ws

      ws.onopen = () => {
        intentosReconexionRef.current = 0
      }

      ws.onmessage = (event) => {
        try {
          const nueva: Notificacion = JSON.parse(event.data)

          setNotificaciones((actuales) => [nueva, ...actuales])
          if (!nueva.leida) {
            setCantidadNoLeidas((cantidad) => cantidad + 1)
          }
        } catch {
          // Mensaje mal formado: se ignora, no debe romper la app.
        }
      }

      ws.onclose = async (event) => {
        if (cancelado) return

        // Código 4001: nuestro Consumer cierra así cuando el token no
        // autenticó (ver apps/notificaciones/consumers.py). Puede ser
        // que expiró mientras la conexión estaba abierta -> intentamos
        // refrescarlo una vez antes de reintentar con backoff normal.
        if (event.code === 4001) {
          const nuevoToken = await refreshAccessToken()
          if (nuevoToken && !cancelado) {
            conectar(nuevoToken)
            return
          }
          // Si no se pudo refrescar, no insistimos: el usuario
          // probablemente ya no está autenticado.
          return
        }

        // Reconexión con backoff exponencial para cualquier otro corte.
        const intento = intentosReconexionRef.current + 1
        intentosReconexionRef.current = intento
        const espera = Math.min(1000 * 2 ** (intento - 1), 30_000)

        reconectarTimeoutRef.current = setTimeout(() => {
          if (!cancelado) conectar(tokenParaConectar)
        }, espera)
      }

      ws.onerror = () => {
        // onclose se dispara igual después de onerror, ahí se maneja
        // la reconexión — no duplicamos lógica acá.
      }
    }

    conectar(accessToken)

    return () => {
      cancelado = true
      limpiarReintentoPendiente()
      wsRef.current?.close()
      wsRef.current = null
    }
  }, [estaAutenticado, accessToken, refreshAccessToken])

  async function marcarLeida(id: string) {
    await marcarNotificacionLeida(id)

    setNotificaciones((actuales) =>
      actuales.map((item) =>
        item.id === id ? { ...item, leida: true } : item
      )
    )

    setCantidadNoLeidas((cantidad) => Math.max(0, cantidad - 1))
  }

  async function marcarTodas() {
    await marcarTodasLeidas()

    setNotificaciones((actuales) =>
      actuales.map((item) => ({ ...item, leida: true }))
    )

    setCantidadNoLeidas(0)
  }

  return (
    <NotificacionesContext.Provider
      value={{
        notificaciones,
        cantidadNoLeidas,
        cargando,
        refrescar,
        marcarLeida,
        marcarTodas,
      }}
    >
      {children}
    </NotificacionesContext.Provider>
  )
}

export function useNotificaciones() {
  const context = useContext(NotificacionesContext)

  if (!context) {
    throw new Error(
      'useNotificaciones debe usarse dentro de NotificacionesProvider'
    )
  }

  return context
}
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { obtenerCarrito } from '../api/carrito'
import type { CarritoItem } from '../types/carrito'
import { useAuth } from '../hooks/useAuth'

interface CarritoItemsContextValue {
  items: CarritoItem[]
  cantidadItems: number
  total: number
  cargando: boolean
  obtenerItemPorVariante: (varianteId: string) => CarritoItem | undefined
  refrescar: () => Promise<void>
}

const CarritoItemsContext = createContext<CarritoItemsContextValue | null>(null)

export function CarritoItemsProvider({ children }: { children: ReactNode }) {
  const { estaAutenticado } = useAuth()
  const [items, setItems] = useState<CarritoItem[]>([])
  const [cantidadItems, setCantidadItems] = useState(0)
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(false)
  const ultimaPeticionId = useRef(0)

  const refrescar = useCallback(async () => {
    const idDeEstaPeticion = ++ultimaPeticionId.current

    if (!estaAutenticado) {
      setItems([])
      setCantidadItems(0)
      setTotal(0)
      return
    }

    try {
      setCargando(true)
      const carrito = await obtenerCarrito()

      // Si mientras esperábamos esta respuesta se disparó una petición
      // más nueva (otro agregar/quitar en el medio), esta ya quedó vieja.
      if (idDeEstaPeticion !== ultimaPeticionId.current) {
        return
      }

      setItems(carrito.items ?? [])
      setCantidadItems(carrito.cantidad_items ?? 0)
      setTotal(Number(carrito.total ?? 0))
    } catch {
      if (idDeEstaPeticion === ultimaPeticionId.current) {
        setItems([])
        setCantidadItems(0)
        setTotal(0)
      }
    } finally {
      if (idDeEstaPeticion === ultimaPeticionId.current) {
        setCargando(false)
      }
    }
  }, [estaAutenticado])

  useEffect(() => {
    refrescar()

    window.addEventListener('carrito:actualizado', refrescar)
    return () => {
      window.removeEventListener('carrito:actualizado', refrescar)
    }
  }, [refrescar])

  function obtenerItemPorVariante(varianteId: string) {
    return items.find((item) => item.variante === varianteId)
  }

  return (
    <CarritoItemsContext.Provider
      value={{
        items,
        cantidadItems,
        total,
        cargando,
        obtenerItemPorVariante,
        refrescar,
      }}
    >
      {children}
    </CarritoItemsContext.Provider>
  )
}

export function useCarritoItems() {
  const context = useContext(CarritoItemsContext)
  if (!context) {
    throw new Error(
      'useCarritoItems debe usarse dentro de un CarritoItemsProvider'
    )
  }
  return context
}
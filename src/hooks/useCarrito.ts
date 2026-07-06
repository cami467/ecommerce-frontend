import { useEffect, useState } from 'react'
import {
  actualizarCantidadItem,
  eliminarItemCarrito,
  obtenerCarrito,
  vaciarCarrito,
} from '../api/carrito'
import type { Carrito } from '../types/carrito'

export function useCarrito() {
  const [carrito, setCarrito] = useState<Carrito | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actualizando, setActualizando] = useState(false)

  async function cargarCarrito() {
    try {
      setCargando(true)
      setError(null)

      const data = await obtenerCarrito()
      setCarrito(data)
    } catch {
      setError('No se pudo cargar el carrito.')
    } finally {
      setCargando(false)
    }
  }

  async function cambiarCantidad(itemId: string, cantidad: number) {
    if (cantidad < 1) return

    try {
      setActualizando(true)
      await actualizarCantidadItem(itemId, cantidad)
      await cargarCarrito()
    } catch {
      setError('No se pudo actualizar la cantidad.')
    } finally {
      setActualizando(false)
    }
  }

  async function eliminarItem(itemId: string) {
    try {
      setActualizando(true)
      await eliminarItemCarrito(itemId)
      await cargarCarrito()
    } catch {
      setError('No se pudo eliminar el producto.')
    } finally {
      setActualizando(false)
    }
  }

  async function limpiarCarrito() {
    try {
      setActualizando(true)
      await vaciarCarrito()
      await cargarCarrito()
    } catch {
      setError('No se pudo vaciar el carrito.')
    } finally {
      setActualizando(false)
    }
  }

  useEffect(() => {
    cargarCarrito()
  }, [])

  return {
    carrito,
    cargando,
    error,
    actualizando,
    cambiarCantidad,
    eliminarItem,
    limpiarCarrito,
  }
}
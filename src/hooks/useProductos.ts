import { useEffect, useState } from 'react'
import { obtenerProductos } from '../api/productos'
import type { Producto } from '../types/producto'

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let activo = true

    async function cargarProductos() {
      try {
        setCargando(true)
        setError(null)

        const data = await obtenerProductos()

        if (activo) {
          setProductos(data)
        }
      } catch {
        if (activo) {
          setError('No se pudieron cargar los productos.')
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarProductos()

    return () => {
      activo = false
    }
  }, [])

  return {
    productos,
    cargando,
    error,
  }
}
import { useEffect, useState } from 'react'
import { obtenerProductoPorSlug } from '../api/productos'
import type { ProductoDetalle } from '../types/producto'

export function useProductoDetalle(slug?: string) {
  const [producto, setProducto] = useState<ProductoDetalle | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) {
      setProducto(null)
      setCargando(false)
      return
    }

    const slugActual = slug // <- esto sigue siendo necesario

    let activo = true

    async function cargarProducto() {
      try {
        setCargando(true)
        setError(null)

        const data = await obtenerProductoPorSlug(slugActual)

        if (activo) {
          setProducto(data)
        }
      } catch {
        if (activo) {
          setError('No se pudo cargar el producto.')
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarProducto()

    return () => {
      activo = false
    }
  }, [slug])

  return {
    producto,
    cargando,
    error,
  }
}
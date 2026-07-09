import { useState, useEffect } from 'react'
import { obtenerProductos } from '../api/productos'
import type { Producto } from '../types/producto'

export function useProductos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [pagina, setPagina] = useState(1)
  const [total, setTotal] = useState(0)
  const [paginas, setPaginas] = useState(1)

  useEffect(() => {
    let activo = true

    async function cargarProductos() {
      try {
        setCargando(true)
        setError(null)

        const data = await obtenerProductos(pagina)

        if (activo) {
          setProductos(data.resultados)
          setTotal(data.total)
          setPaginas(data.paginas)
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
  }, [pagina]) // ahora depende de la página

  return {
    productos,
    cargando,
    error,
    pagina,
    total,
    paginas,
    setPagina,
  }
}

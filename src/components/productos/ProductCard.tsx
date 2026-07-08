import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { isAxiosError } from 'axios'
import {
  agregarAlCarrito,
  actualizarCantidadItem,
  eliminarItemCarrito,
} from '../../api/carrito'
import { useCarritoItems } from '../../context/CarritoItemsContext'
import type { Producto } from '../../types/producto'
import type { CarritoItem } from '../../types/carrito'

interface ProductCardProps {
  producto: Producto
}

export function ProductCard({ producto }: ProductCardProps) {
  const navigate = useNavigate()
  const { obtenerItemPorVariante } = useCarritoItems()
  const [itemEnCarrito, setItemEnCarrito] = useState<CarritoItem | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tieneDescuento = Number(producto.porcentaje_descuento) > 0
  const estaDisponible = producto.esta_activo
  const precioBase = Number(producto.precio_base)
  const precioFinal = Number(producto.precio_con_descuento)

  // Ya no dependemos de producto.variantes (el listado no lo trae).
  // El backend nos dice directamente si hay una sola variante activa.
  const varianteUnicaId = producto.variante_unica_id
  const esVarianteUnica = Boolean(varianteUnicaId)

  // Sincroniza el estado local de la card con el carrito real
  // cada vez que el Context se actualiza (agregar, sumar, recargar, etc.)
  useEffect(() => {
    if (!varianteUnicaId) {
      setItemEnCarrito(null)
      return
    }
    const item = obtenerItemPorVariante(varianteUnicaId)
    setItemEnCarrito(item ?? null)
  }, [obtenerItemPorVariante, varianteUnicaId])

  async function handleAgregar(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    if (!estaDisponible || procesando) return

    if (!esVarianteUnica || !varianteUnicaId) {
      navigate(`/productos/${producto.slug}`)
      return
    }

    try {
      setProcesando(true)
      setError(null)
      const item = await agregarAlCarrito({
        variante_id: varianteUnicaId,
        cantidad: 1,
      })

      // agregarAlCarrito ya dispara 'carrito:actualizado' internamente
      // (ver api/carrito.ts). No lo repetimos acá para no duplicar el
      // fetch en el Header.
      setItemEnCarrito(item)
    } catch (err) {
      // Si el backend devuelve 401 (sesión vencida) o cualquier otro
      // error, mostramos algo al usuario en vez de fallar en silencio.
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('Tu sesión venció. Iniciá sesión de nuevo para agregar productos.')
      } else {
        setError('No se pudo agregar el producto. Intentá de nuevo.')
      }
    } finally {
      setProcesando(false)
    }
  }

  async function handleIncrementar(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    if (!itemEnCarrito || procesando) return

    try {
      setProcesando(true)
      setError(null)
      const nuevaCantidad = itemEnCarrito.cantidad + 1
      const item = await actualizarCantidadItem(itemEnCarrito.id, nuevaCantidad)

      // actualizarCantidadItem ya dispara 'carrito:actualizado' internamente.
      setItemEnCarrito(item)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('Tu sesión venció. Iniciá sesión de nuevo.')
      } else {
        setError('No se pudo actualizar la cantidad.')
      }
    } finally {
      setProcesando(false)
    }
  }

  async function handleEliminar(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    if (!itemEnCarrito || procesando) return

    try {
      setProcesando(true)
      setError(null)
      await eliminarItemCarrito(itemEnCarrito.id)

      // eliminarItemCarrito ya dispara 'carrito:actualizado' internamente.
      setItemEnCarrito(null)
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('Tu sesión venció. Iniciá sesión de nuevo.')
      } else {
        setError('No se pudo eliminar el producto.')
      }
    } finally {
      setProcesando(false)
    }
  }

  return (
    <article className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/productos/${producto.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          {producto.imagen_principal ? (
            <img
              src={producto.imagen_principal}
              alt={producto.nombre}
              className="h-full w-full object-cover transition duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Sin imagen
            </div>
          )}

          {tieneDescuento && (
            <span className="absolute left-3 top-3 rounded bg-red-600 px-2 py-1 text-xs font-bold text-white">
              -{Number(producto.porcentaje_descuento).toFixed(0)}%
            </span>
          )}

          {producto.es_destacado && (
            <span className="absolute right-3 top-3 rounded bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
              Destacado
            </span>
          )}

          {!estaDisponible && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded bg-white px-3 py-1 text-sm font-bold text-gray-900">
                AGOTADO
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {producto.categoria_nombre}
        </p>

        <Link to={`/productos/${producto.slug}`} className="hover:underline">
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
            {producto.nombre}
          </h3>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600">
            Gs. {precioFinal.toLocaleString('es-PY')}
          </span>

          {tieneDescuento && (
            <span className="text-sm text-gray-400 line-through">
              Gs. {precioBase.toLocaleString('es-PY')}
            </span>
          )}
        </div>

        {!estaDisponible && (
          <p className="text-sm font-medium text-red-600">Sin stock</p>
        )}

        {error && (
          <p className="text-xs font-medium text-red-600">{error}</p>
        )}

        {itemEnCarrito ? (
          <div className="mt-auto flex items-center gap-2">
            <button
              type="button"
              onClick={handleEliminar}
              disabled={procesando}
              aria-label="Quitar del carrito"
              className="flex h-9 w-9 items-center justify-center rounded bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
            >
              🗑️
            </button>

            <span className="flex-1 text-center text-sm font-medium text-gray-900">
              {itemEnCarrito.cantidad}
            </span>

            <button
              type="button"
              onClick={handleIncrementar}
              disabled={procesando}
              aria-label="Agregar una unidad más"
              className="flex h-9 w-9 items-center justify-center rounded bg-lime-500 text-lg font-bold text-white transition hover:bg-lime-600 disabled:opacity-50"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAgregar}
            disabled={!estaDisponible || procesando}
            className="mt-auto block w-full rounded bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {procesando ? 'Agregando...' : 'Agregar'}
          </button>
        )}
      </div>
    </article>
  )
}
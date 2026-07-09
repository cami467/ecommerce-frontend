import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard } from '../components/productos/ProductCard'
import { ProductCardSkeleton } from '../components/productos/ProductCardSkeleton'
import { useProductos } from '../hooks/useProductos'
import { obtenerCategorias } from '../api/categorias'
import type { Categoria } from '../types/categoria'

export function ProductosPage() {
  const {
    productos,
    cargando,
    error,
    pagina,
    paginas,
    total,
    setPagina,
  } = useProductos()

  const [searchParams, setSearchParams] = useSearchParams()

  // Fuente de verdad unica: la URL. Nada de estado local duplicado
  // ni useEffect de sincronizacion en ninguna direccion -- se lee
  // directo de searchParams en cada render, y se escribe directo
  // ahi mismo desde los handlers de los inputs.
  const busqueda = searchParams.get('buscar') ?? ''
  const categoriaSeleccionada = searchParams.get('categoria') ?? ''
  const soloDestacados = searchParams.get('destacados') === 'true'
  const orden = searchParams.get('orden') ?? 'relevancia'

  const [categorias, setCategorias] = useState<Categoria[]>([])

  // Carga de categorías (esto no vive en la URL, es independiente)
  useEffect(() => {
    obtenerCategorias()
      .then(setCategorias)
      .catch(() => setCategorias([]))
  }, [])

  // Actualiza un parametro puntual de la URL, sacandolo si queda vacio
  // o si vuelve a su valor por defecto, para no ensuciar la URL.
  function actualizarParam(clave: string, valor: string, valorPorDefecto = '') {
    const params = new URLSearchParams(searchParams)

    if (!valor || valor === valorPorDefecto) {
      params.delete(clave)
    } else {
      params.set(clave, valor)
    }

    setSearchParams(params, { replace: true })
  }

  if (cargando) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Explorá nuestro catálogo disponible.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </section>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded bg-red-50 p-4 text-red-700">{error}</div>
      </main>
    )
  }

  const productosFiltrados = productos.filter((producto) => {
    const coincideBusqueda = producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase())

    const coincideDestacado = soloDestacados ? producto.es_destacado : true

    const coincideCategoria = categoriaSeleccionada
      ? producto.categoria_nombre === categoriaSeleccionada
      : true

    return coincideBusqueda && coincideDestacado && coincideCategoria
  })

  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (orden === 'precio_asc') {
      return Number(a.precio_con_descuento) - Number(b.precio_con_descuento)
    }

    if (orden === 'precio_desc') {
      return Number(b.precio_con_descuento) - Number(a.precio_con_descuento)
    }

    return 0
  })

  const hayFiltrosActivos =
    busqueda.trim() !== '' ||
    categoriaSeleccionada !== '' ||
    soloDestacados ||
    orden !== 'relevancia'

  const limpiarFiltros = () => {
    setSearchParams({}, { replace: true })
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <p className="mt-1 text-sm text-gray-600">
          Explorá nuestro catálogo disponible.
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Mostrando {productosOrdenados.length} de {total} productos.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => actualizarParam('buscar', e.target.value)}
          placeholder="Buscar productos..."
          className="w-full rounded border border-gray-300 px-3 py-2 sm:max-w-xs"
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={soloDestacados}
              onChange={(e) =>
                actualizarParam(
                  'destacados',
                  e.target.checked ? 'true' : '',
                  ''
                )
              }
            />
            Solo destacados
          </label>

          <select
            value={categoriaSeleccionada}
            onChange={(e) => actualizarParam('categoria', e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.nombre}>
                {categoria.nombre}
              </option>
            ))}
          </select>

          <select
            value={orden}
            onChange={(e) =>
              actualizarParam('orden', e.target.value, 'relevancia')
            }
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="relevancia">Relevancia</option>
            <option value="precio_asc">Menor precio</option>
            <option value="precio_desc">Mayor precio</option>
          </select>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {productosOrdenados.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <h2 className="text-lg font-semibold text-gray-900">
            No encontramos productos
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Probá con otra búsqueda o limpiá los filtros aplicados.
          </p>

          {hayFiltrosActivos && (
            <button
              type="button"
              onClick={limpiarFiltros}
              className="mt-4 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productosOrdenados.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </section>

          {paginas > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPagina(Math.max(1, pagina - 1))}
                disabled={pagina <= 1}
                className="rounded border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
              >
                Anterior
              </button>

              <span className="text-sm text-gray-600">
                Página {pagina} de {paginas}
              </span>

              <button
                type="button"
                onClick={() => setPagina(Math.min(paginas, pagina + 1))}
                disabled={pagina >= paginas}
                className="rounded border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
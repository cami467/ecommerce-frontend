import { useState } from 'react'
import { ProductCard } from '../components/productos/ProductCard'
import { ProductCardSkeleton } from '../components/productos/ProductCardSkeleton'
import { useProductos } from '../hooks/useProductos'

export function ProductosPage() {
  const { productos, cargando, error } = useProductos()
  const [busqueda, setBusqueda] = useState('')
  const [soloDestacados, setSoloDestacados] = useState(false)
  const [orden, setOrden] = useState('relevancia')

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
    return coincideBusqueda && coincideDestacado
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

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <p className="mt-1 text-sm text-gray-600">
          Explorá nuestro catálogo disponible.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar productos..."
          className="w-full rounded border border-gray-300 px-3 py-2 sm:max-w-xs"
        />

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={soloDestacados}
              onChange={(e) => setSoloDestacados(e.target.checked)}
            />
            Solo destacados
          </label>

          <select
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="relevancia">Relevancia</option>
            <option value="precio_asc">Menor precio</option>
            <option value="precio_desc">Mayor precio</option>
          </select>
        </div>
      </div>

      {productosOrdenados.length === 0 ? (
        <div className="rounded bg-gray-50 p-6 text-center text-gray-600">
          No hay productos disponibles.
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productosOrdenados.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </section>
      )}
    </main>
  )
}
import { ProductCard } from '../components/productos/ProductCard'
import { useProductos } from '../hooks/useProductos'

export function ProductosPage() {
  const { productos, cargando, error } = useProductos()

  if (cargando) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-gray-600">Cargando productos...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded bg-red-50 p-4 text-red-700">
          {error}
        </div>
      </main>
    )
  }

  if (productos.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded bg-gray-50 p-6 text-center text-gray-600">
          No hay productos disponibles.
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <p className="mt-1 text-sm text-gray-600">
          Explorá nuestro catálogo disponible.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </section>
    </main>
  )
}
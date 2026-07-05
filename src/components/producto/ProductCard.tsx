import type { Producto } from '../../types/producto'

interface ProductCardProps {
  producto: Producto
}

export function ProductCard({ producto }: ProductCardProps) {
  const imagenPrincipal =
    producto.imagenes.find((imagen) => imagen.es_principal) ?? producto.imagenes[0]

  return (
    <article className="rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
        {imagenPrincipal ? (
          <img
            src={imagenPrincipal.imagen}
            alt={imagenPrincipal.alt_text || producto.nombre}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {producto.categoria?.nombre}
        </p>

        <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
          {producto.nombre}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600">
            Gs. {Number(producto.precio_final).toLocaleString('es-PY')}
          </span>

          {producto.tiene_descuento && (
            <span className="text-sm text-gray-400 line-through">
              Gs. {Number(producto.precio).toLocaleString('es-PY')}
            </span>
          )}
        </div>

        {!producto.esta_disponible && (
          <p className="text-sm font-medium text-red-600">Sin stock</p>
        )}

        <button
          type="button"
          disabled={!producto.esta_disponible}
          className="mt-2 w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Ver producto
        </button>
      </div>
    </article>
  )
}
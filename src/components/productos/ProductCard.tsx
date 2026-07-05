import type { Producto } from "../../types/producto";

interface ProductCardProps {
  producto: Producto;
}

export function ProductCard({ producto }: ProductCardProps) {
  const tieneDescuento = Number(producto.porcentaje_descuento) > 0;
  const estaDisponible = producto.esta_activo;
  const precioBase = Number(producto.precio_base);
  const precioFinal = Number(producto.precio_con_descuento);

  return (
    <article className="rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gray-100">
        {producto.imagen_principal ? (
          <img
            src={producto.imagen_principal}
            alt={producto.nombre}
            className="h-full w-full object-cover"
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

      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {producto.categoria_nombre}
        </p>

        <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
          {producto.nombre}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-blue-600">
            Gs. {precioFinal.toLocaleString("es-PY")}
          </span>

          {tieneDescuento && (
            <span className="text-sm text-gray-400 line-through">
              Gs. {precioBase.toLocaleString("es-PY")}
            </span>
          )}
        </div>

        {!estaDisponible && (
          <p className="text-sm font-medium text-red-600">Sin stock</p>
        )}

        <button
          type="button"
          disabled={!estaDisponible}
          className="mt-2 w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Ver producto
        </button>
      </div>
    </article>
  );
}
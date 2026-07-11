import { useEffect, useState } from "react";
import { AdminLayout } from "../../layout/AdminLayout";
import { obtenerProductosAdmin } from "../../api/admin";
import apiClient from "../../api/client";
import type { Producto } from "../../types/producto";
import { Link } from "react-router-dom";

function formatearGuaranies(valor: string | number) {
  return `Gs. ${Number(valor).toLocaleString("es-PY")}`;
}

export function AdminProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    async function cargarProductos() {
      try {
        setCargando(true);
        setError("");

        const respuesta = await obtenerProductosAdmin();
        setProductos(respuesta.resultados);
      } catch {
        setError("No se pudieron cargar los productos.");
      } finally {
        setCargando(false);
      }
    }

    cargarProductos();
  }, []);

  async function handleEliminar(slug: string, nombre: string) {
    const confirmado = window.confirm(
      `¿Desactivar "${nombre}"? Ya no aparecerá en el catálogo, pero podés reactivarlo después.`
    );
    if (!confirmado) return;

    try {
      setEliminando(slug);
      await apiClient.delete(`/productos/${slug}/`);
      setProductos((actuales) =>
        actuales.map((p) =>
          p.slug === slug ? { ...p, esta_activo: false } : p
        )
      );
    } catch {
      alert("No se pudo desactivar el producto.");
    } finally {
      setEliminando(null);
    }
  }

  return (
    <AdminLayout>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Gestión de productos
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            Consultá y administrá el catálogo de la tienda.
          </p>
        </div>

        <Link
          to="/admin-dashboard/productos/nuevo"
          className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
        >
          Nuevo producto
        </Link>
      </header>

      {error && (
        <div className="mt-6 rounded bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {cargando ? (
          <p className="p-6 text-gray-600">Cargando productos...</p>
        ) : productos.length === 0 ? (
          <div className="p-8 text-center text-gray-600">
            No hay productos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Descuento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 bg-white">
                {productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded bg-gray-100">
                          {producto.imagen_principal ? (
                            <img
                              src={producto.imagen_principal}
                              alt={producto.nombre}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-gray-400">
                              Sin imagen
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {producto.nombre}
                          </p>

                          {producto.es_destacado && (
                            <span className="mt-1 inline-block rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                              Destacado
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {producto.categoria_nombre}
                    </td>

                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium text-gray-900">
                        {formatearGuaranies(producto.precio_con_descuento)}
                      </p>

                      {Number(producto.porcentaje_descuento) > 0 && (
                        <p className="text-xs text-gray-400 line-through">
                          {formatearGuaranies(producto.precio_base)}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm text-gray-700">
                      {Number(producto.porcentaje_descuento).toFixed(0)}%
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded px-2 py-1 text-xs font-medium ${
                          producto.esta_activo
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {producto.esta_activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-3">
                        <Link
                          to={`/admin-dashboard/productos/${producto.slug}/editar`}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Editar
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleEliminar(producto.slug, producto.nombre)
                          }
                          disabled={eliminando === producto.slug}
                          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                        >
                          {eliminando === producto.slug
                            ? "Desactivando..."
                            : "Desactivar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useProductoDetalle } from "../hooks/useProductoDetalle";
import { agregarAlCarrito } from "../api/carrito";

function formatearGuaranies(valor: string | number) {
  return `Gs. ${Number(valor).toLocaleString("es-PY")}`;
}

export function ProductoDetallePage() {
  const { slug } = useParams();
  const { producto, cargando, error } = useProductoDetalle(slug);
  const [indiceActivo, setIndiceActivo] = useState(0);
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<
    string | null
  >(null);
  const [cantidad, setCantidad] = useState(1);
  const [agregando, setAgregando] = useState(false);
  const [mensajeCarrito, setMensajeCarrito] = useState("");
  const [errorCarrito, setErrorCarrito] = useState("");
  const contenedorRef = useRef<HTMLDivElement>(null);
  const imagenRef = useRef<HTMLImageElement>(null);
  const navigate = useNavigate();

  if (cargando) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <p className="text-gray-600">Cargando producto...</p>
      </main>
    );
  }

  if (error || !producto) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="rounded bg-red-50 p-4 text-red-700">
          {error || "Producto no encontrado."}
        </div>

        <Link
          to="/productos"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Volver al catálogo
        </Link>
      </main>
    );
  }

  const tieneDescuento = Number(producto.porcentaje_descuento) > 0;
  const estaDisponible = producto.esta_activo;

  const imagenes = producto.imagenes.length > 0 ? producto.imagenes : [];
  const imagenActiva = imagenes[indiceActivo]?.url ?? null;

  const requiereVariante = producto.variantes && producto.variantes.length > 0;
  const puedeAgregar =
    estaDisponible &&
    !agregando &&
    (!requiereVariante || varianteSeleccionada !== null) &&
    cantidad >= 1;

  function manejarMovimientoMouse(e: React.MouseEvent<HTMLDivElement>) {
    if (!contenedorRef.current || !imagenRef.current) return;

    const rect = contenedorRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    imagenRef.current.style.transformOrigin = `${x}% ${y}%`;
  }

  async function handleAgregarCarrito() {
    if (requiereVariante && !varianteSeleccionada) {
      setErrorCarrito("Seleccioná una opción antes de agregar al carrito.");
      return;
    }

    try {
      setAgregando(true);
      setErrorCarrito("");
      setMensajeCarrito("");

      await agregarAlCarrito({
        variante_id: varianteSeleccionada as string,
        cantidad,
      });

      setMensajeCarrito("Producto agregado al carrito correctamente.");

      setTimeout(() => {
        navigate("/carrito");
      }, 800);
    } catch {
      setErrorCarrito("No se pudo agregar el producto al carrito.");
    } finally {
      setAgregando(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/productos" className="text-sm text-blue-600 hover:underline">
        ← Volver al catálogo
      </Link>

      <section className="mt-6 grid gap-8 md:grid-cols-2">
        <div>
          <div
            ref={contenedorRef}
            onMouseMove={manejarMovimientoMouse}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-gray-100"
          >
            {imagenActiva ? (
              <img
                ref={imagenRef}
                src={imagenActiva}
                alt={producto.nombre}
                className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-150"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                Sin imagen
              </div>
            )}
          </div>

          {imagenes.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {imagenes.map((imagen, index) => (
                <button
                  key={imagen.id}
                  type="button"
                  onClick={() => setIndiceActivo(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded border-2 transition ${
                    index === indiceActivo
                      ? "border-blue-600"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <img
                    src={imagen.url}
                    alt={`${producto.nombre} - vista ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-gray-500">
            {producto.categoria_detalle.nombre}
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {producto.nombre}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl font-bold text-blue-600">
              {formatearGuaranies(producto.precio_con_descuento)}
            </span>

            {tieneDescuento && (
              <span className="text-lg text-gray-400 line-through">
                {formatearGuaranies(producto.precio_base)}
              </span>
            )}
          </div>

          {tieneDescuento && (
            <p className="mt-1 text-sm font-medium text-green-700">
              Ahorrás {Number(producto.porcentaje_descuento).toFixed(0)}%
            </p>
          )}

          <p className="mt-2 text-sm text-gray-500">
            IVA incluido: {formatearGuaranies(producto.monto_iva_incluido)}
          </p>

          <div className="mt-6">
            {estaDisponible ? (
              <span className="rounded bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
                Disponible
              </span>
            ) : (
              <span className="rounded bg-red-50 px-3 py-1 text-sm font-medium text-red-700">
                Agotado
              </span>
            )}
          </div>

          {producto.descripcion && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Descripción
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {producto.descripcion}
              </p>
            </section>
          )}

          {requiereVariante && (
            <section className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Opciones</h2>

              <div className="mt-3 grid gap-2">
                {producto.variantes.map((variante) => {
                  const seleccionada = varianteSeleccionada === variante.id;
                  const disponible =
                    variante.esta_activo && variante.tiene_stock;

                  return (
                    <button
                      key={variante.id}
                      type="button"
                      onClick={() => setVarianteSeleccionada(variante.id)}
                      disabled={!disponible}
                      className={`rounded border px-3 py-2 text-left text-sm transition ${
                        seleccionada
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-blue-600"
                      } disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400`}
                    >
                      <span className="font-medium">{variante.nombre}</span>
                      <span className="block text-xs text-gray-500">
                        Stock: {variante.inventario}
                      </span>
                    </button>
                  );
                })}
              </div>

              {!varianteSeleccionada && (
                <p className="mt-2 text-xs text-amber-600">
                  Elegí una opción antes de continuar.
                </p>
              )}
            </section>
          )}

          {producto.variantes && producto.variantes.length === 0 && (
            <p className="mt-4 text-sm text-gray-500">Opción única.</p>
          )}

          <div className="mt-6">
            <label
              htmlFor="cantidad"
              className="block text-sm font-medium text-gray-700"
            >
              Cantidad
            </label>

            <input
              id="cantidad"
              type="number"
              min={1}
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              className="mt-1 w-24 rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <button
            type="button"
            onClick={handleAgregarCarrito}
            disabled={!puedeAgregar}
            className="mt-6 w-full rounded bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {!estaDisponible
              ? "Producto agotado"
              : agregando
                ? "Agregando..."
                : requiereVariante && !varianteSeleccionada
                  ? "Elegí una opción"
                  : "Agregar al carrito"}
          </button>

          {mensajeCarrito && (
            <p className="mt-3 rounded bg-green-50 p-3 text-sm text-green-700">
              {mensajeCarrito}
            </p>
          )}

          {errorCarrito && (
            <p className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">
              {errorCarrito}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
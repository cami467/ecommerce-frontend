import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { obtenerProductosDestacados } from '../api/productos'
import { obtenerCategorias } from '../api/categorias'
import type { Producto } from '../types/producto'
import type { Categoria } from '../types/categoria'

function formatearGuaranies(valor: string | number) {
  return `Gs. ${Number(valor).toLocaleString('es-PY')}`
}

function TarjetaProducto({
  producto,
  indice,
}: {
  producto: Producto
  indice: number
}) {
  const tieneDescuento =
    Number(producto.porcentaje_descuento) > 0

  return (
    <Link
      to={`/productos/${producto.slug}`}
      className="group relative block overflow-hidden rounded-2xl border border-[#1F4B43]/10 bg-white opacity-0 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl animate-fade-in-up"
      style={{
        animationDelay: `${indice * 70}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {tieneDescuento && (
        <span className="absolute right-3 top-3 z-20 rounded-full bg-[#D9A441] px-3 py-1 text-xs font-bold text-[#16231C] shadow">
          -{Math.round(Number(producto.porcentaje_descuento))}%
        </span>
      )}

      {producto.es_destacado && (
        <span className="absolute left-3 top-3 z-20 rounded-full bg-[#1F4B43] px-3 py-1 text-[11px] font-semibold text-white shadow">
          Destacado
        </span>
      )}

      <div className="relative aspect-square overflow-hidden bg-[#EEF1EA]">
        {producto.imagen_principal ? (
          <img
            src={producto.imagen_principal}
            alt={producto.nombre}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#16231C]/40">
            Sin imagen
          </div>
        )}

        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#16231C]/70 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="translate-y-3 p-5 text-sm font-semibold text-white transition duration-300 group-hover:translate-y-0">
            Ver producto →
          </span>
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-[#1F4B43]/55">
          {producto.categoria_nombre}
        </p>

        <h3 className="mt-2 line-clamp-2 min-h-12 font-semibold text-[#16231C] transition group-hover:text-[#1F4B43]">
          {producto.nombre}
        </h3>

        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-bold text-[#D9A441]">
            {formatearGuaranies(producto.precio_con_descuento)}
          </span>

          {tieneDescuento && (
            <span className="text-sm text-[#16231C]/40 line-through">
              {formatearGuaranies(producto.precio_base)}
            </span>
          )}
        </div>

        <span className="mt-4 block rounded-full border border-[#1F4B43]/20 px-4 py-2 text-center text-sm font-semibold text-[#1F4B43] transition group-hover:border-[#1F4B43] group-hover:bg-[#1F4B43] group-hover:text-white">
          Ver detalles
        </span>
      </div>
    </Link>
  )
}

function HomePage() {
  const navigate = useNavigate()

  const [destacados, setDestacados] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  const [scrollCategorias, setScrollCategorias] = useState({
    inicio: true,
    fin: false,
  })

  const categoriasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let activo = true

    async function cargarInicio() {
      try {
        const [productosData, categoriasData] =
          await Promise.all([
            obtenerProductosDestacados(),
            obtenerCategorias(),
          ])

        if (activo) {
          setDestacados(productosData)
          setCategorias(
            categoriasData.filter(
              (categoria) => categoria.esta_activo
            )
          )
        }
      } catch {
        if (activo) {
          setDestacados([])
          setCategorias([])
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    cargarInicio()

    return () => {
      activo = false
    }
  }, [])

  function manejarScrollCategorias() {
    const elemento = categoriasRef.current

    if (!elemento) return

    setScrollCategorias({
      inicio: elemento.scrollLeft <= 4,
      fin:
        elemento.scrollLeft + elemento.clientWidth >=
        elemento.scrollWidth - 4,
    })
  }

  function desplazarCategorias(direccion: 'izquierda' | 'derecha') {
    categoriasRef.current?.scrollBy({
      left: direccion === 'derecha' ? 320 : -320,
      behavior: 'smooth',
    })
  }

  function handleBuscar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const termino = busqueda.trim()

    if (!termino) {
      navigate('/productos')
      return
    }

    navigate(
      `/productos?buscar=${encodeURIComponent(termino)}`
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F6F1]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#1F4B43]/10 px-6 py-20 sm:py-28">
        <div className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-[#D9A441]/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[#1F4B43]/10 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex rounded-full border border-[#D9A441]/30 bg-[#D9A441]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#9A6B16]">
            Bienvenido a Eimek
          </span>

          <h1
            className="mt-6 text-4xl leading-tight text-[#16231C] sm:text-6xl lg:text-7xl"
            style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}
          >
            Todo lo que buscás,
            <br />
            <span className="text-[#1F4B43]">
              a un clic de distancia.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#16231C]/70 sm:text-lg">
            Explorá productos, compará opciones, elegí variantes y
            pagá mediante efectivo, transferencia o tarjeta.
          </p>

          <form
            onSubmit={handleBuscar}
            className="mx-auto mt-8 flex max-w-2xl rounded-full border border-[#1F4B43]/15 bg-white p-2 shadow-lg shadow-[#1F4B43]/5"
          >
            <input
              type="search"
              value={busqueda}
              onChange={(event) =>
                setBusqueda(event.target.value)
              }
              placeholder="¿Qué producto estás buscando?"
              className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm text-[#16231C] outline-none placeholder:text-[#16231C]/40"
            />

            <button
              type="submit"
              className="rounded-full bg-[#1F4B43] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#16231C] active:scale-95"
            >
              Buscar
            </button>
          </form>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/productos"
              className="group inline-flex items-center gap-2 rounded-full bg-[#1F4B43] px-7 py-3 font-medium text-white transition hover:bg-[#16231C]"
            >
              Ver catálogo
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              to="/productos?ofertas=true"
              className="inline-flex items-center gap-2 rounded-full border border-[#1F4B43]/30 bg-white px-7 py-3 font-medium text-[#1F4B43] transition hover:border-[#D9A441] hover:text-[#9A6B16]"
            >
              Ver ofertas
              <span>🏷️</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="border-b border-[#1F4B43]/10 bg-white px-6 py-7">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icono: '🔒',
              titulo: 'Compra segura',
              texto: 'Pagos y datos protegidos',
            },
            {
              icono: '📦',
              titulo: 'Pedidos controlados',
              texto: 'Seguimiento desde tu cuenta',
            },
            {
              icono: '💳',
              titulo: 'Varios métodos',
              texto: 'Elegí cómo pagar',
            },
            {
              icono: '📄',
              titulo: 'Factura disponible',
              texto: 'Descarga tu comprobante',
            },
          ].map((beneficio) => (
            <article
              key={beneficio.titulo}
              className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#F5F6F1]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#D9A441]/15 text-xl">
                {beneficio.icono}
              </span>

              <div>
                <p className="text-sm font-semibold text-[#16231C]">
                  {beneficio.titulo}
                </p>
                <p className="text-xs text-[#16231C]/55">
                  {beneficio.texto}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Categorías */}
      {categorias.length > 0 && (
        <section className="px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2
                  className="text-2xl text-[#16231C]"
                  style={{
                    fontFamily:
                      "'Bricolage Grotesque', sans-serif",
                  }}
                >
                  Explorar por categoría
                </h2>

                <p className="mt-1 text-sm text-[#16231C]/55">
                  Encontrá más rápido lo que necesitás.
                </p>
              </div>

              <div className="hidden gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() =>
                    desplazarCategorias('izquierda')
                  }
                  disabled={scrollCategorias.inicio}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1F4B43]/20 bg-white text-[#1F4B43] transition hover:border-[#1F4B43] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Categorías anteriores"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={() =>
                    desplazarCategorias('derecha')
                  }
                  disabled={scrollCategorias.fin}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1F4B43]/20 bg-white text-[#1F4B43] transition hover:border-[#1F4B43] disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Siguientes categorías"
                >
                  →
                </button>
              </div>
            </div>

            <div className="relative">
              {!scrollCategorias.inicio && (
                <div className="pointer-events-none absolute bottom-2 left-0 top-0 z-10 w-14 bg-gradient-to-r from-[#F5F6F1] to-transparent" />
              )}

              <div
                ref={categoriasRef}
                onScroll={manejarScrollCategorias}
                className="flex snap-x gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {categorias.map((categoria) => (
                  <Link
                    key={categoria.id}
                    to={`/productos?categoria=${categoria.slug}`}
                    className="shrink-0 snap-start rounded-full border border-[#1F4B43]/20 bg-white px-6 py-3 text-sm font-semibold text-[#16231C] shadow-sm transition hover:-translate-y-0.5 hover:border-[#1F4B43] hover:bg-[#1F4B43] hover:text-white active:scale-95"
                  >
                    {categoria.nombre}
                  </Link>
                ))}
              </div>

              {!scrollCategorias.fin && (
                <div className="pointer-events-none absolute bottom-2 right-0 top-0 z-10 w-14 bg-gradient-to-l from-[#F5F6F1] to-transparent" />
              )}
            </div>
          </div>
        </section>
      )}

      {/* Destacados */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#D9A441]">
                Selección especial
              </span>

              <h2
                className="mt-2 text-2xl text-[#16231C] sm:text-3xl"
                style={{
                  fontFamily:
                    "'Bricolage Grotesque', sans-serif",
                }}
              >
                Productos destacados
              </h2>

              <p className="mt-2 text-sm text-[#16231C]/55">
                Una selección de los productos más interesantes.
              </p>
            </div>

            <Link
              to="/productos?destacados=true"
              className="group shrink-0 text-sm font-semibold text-[#1F4B43] hover:underline"
            >
              Ver todos{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {cargando && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, indice) => (
                <div
                  key={indice}
                  className="overflow-hidden rounded-2xl border border-[#1F4B43]/5 bg-white"
                >
                  <div className="aspect-square animate-pulse bg-[#1F4B43]/10" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-20 animate-pulse rounded bg-[#1F4B43]/10" />
                    <div className="h-5 animate-pulse rounded bg-[#1F4B43]/10" />
                    <div className="h-5 w-1/2 animate-pulse rounded bg-[#1F4B43]/10" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!cargando && destacados.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#1F4B43]/20 bg-white p-10 text-center">
              <span className="text-4xl">🛍️</span>

              <h3 className="mt-4 font-semibold text-[#16231C]">
                Todavía no hay productos destacados
              </h3>

              <p className="mt-2 text-sm text-[#16231C]/55">
                Podés explorar todos los productos disponibles.
              </p>

              <Link
                to="/productos"
                className="mt-5 inline-block rounded-full bg-[#1F4B43] px-6 py-2.5 text-sm font-medium text-white"
              >
                Ver catálogo
              </Link>
            </div>
          )}

          {!cargando && destacados.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {destacados.slice(0, 8).map((producto, indice) => (
                <TarjetaProducto
                  key={producto.id}
                  producto={producto}
                  indice={indice}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Accesos rápidos */}
      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          <Link
            to="/productos?ofertas=true"
            className="group relative overflow-hidden rounded-2xl bg-[#D9A441] p-8 text-[#16231C] transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative z-10">
              <span className="text-3xl">🏷️</span>
              <h2 className="mt-5 text-2xl font-bold">
                Productos en oferta
              </h2>
              <p className="mt-2 max-w-sm text-sm text-[#16231C]/70">
                Descubrí productos con descuentos y precios especiales.
              </p>
              <span className="mt-6 inline-block font-semibold">
                Ver ofertas →
              </span>
            </div>

            <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/20 transition group-hover:scale-125" />
          </Link>

          <Link
            to="/mi-cuenta"
            className="group relative overflow-hidden rounded-2xl bg-[#1F4B43] p-8 text-white transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative z-10">
              <span className="text-3xl">👤</span>
              <h2 className="mt-5 text-2xl font-bold">
                Tu cuenta, en un solo lugar
              </h2>
              <p className="mt-2 max-w-sm text-sm text-white/70">
                Revisá pedidos, pagos, facturas y datos personales.
              </p>
              <span className="mt-6 inline-block font-semibold">
                Ir a mi cuenta →
              </span>
            </div>

            <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 transition group-hover:scale-125" />
          </Link>
        </div>
      </section>

      {/* CTA final */}
      <section className="px-6 pb-20 pt-10">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-[#16231C] px-8 py-14 text-center sm:px-14">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#D9A441]/15 blur-2xl" />
          <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-[#1F4B43] blur-2xl" />

          <div className="relative">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D9A441]">
              Encontrá lo que necesitás
            </span>

            <h2
              className="mt-4 text-3xl text-white sm:text-4xl"
              style={{
                fontFamily:
                  "'Bricolage Grotesque', sans-serif",
              }}
            >
              ¿Ya sabés lo que buscás?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-white/65">
              Usá el catálogo para buscar, filtrar y ordenar todos
              los productos disponibles.
            </p>

            <Link
              to="/productos"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#D9A441] px-8 py-3 font-semibold text-[#16231C] transition hover:bg-[#c99436] active:scale-95"
            >
              Explorar productos
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
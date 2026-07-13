import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
  const tieneDescuento = Number(producto.porcentaje_descuento) > 0

  return (
    <Link
      to={`/productos/${producto.slug}`}
      className="group relative block animate-fade-in-up overflow-hidden rounded-lg border border-[#1F4B43]/10 bg-white opacity-0 transition hover:-translate-y-1 hover:shadow-lg"
      style={{ animationDelay: `${indice * 60}ms` }}
    >
      <span className="absolute left-4 top-0 z-10 h-4 w-4 -translate-y-1/2 rotate-45 border border-[#1F4B43]/10 bg-[#F5F6F1]" />

      {tieneDescuento && (
        <span className="absolute right-3 top-3 z-10 rounded-full bg-[#D9A441] px-2.5 py-1 text-[11px] font-semibold text-[#16231C] shadow-sm">
          -{Math.round(Number(producto.porcentaje_descuento))}%
        </span>
      )}

      <div className="relative aspect-square w-full overflow-hidden bg-[#F5F6F1]">
        {producto.imagen_principal ? (
          <img
            src={producto.imagen_principal}
            alt={producto.nombre}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#16231C]/40">
            Sin imagen
          </div>
        )}

        {/* Overlay al hacer hover */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[#16231C]/50 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="translate-y-2 p-4 text-sm font-medium text-white transition duration-300 group-hover:translate-y-0">
            Ver producto →
          </span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs uppercase tracking-wide text-[#1F4B43]/60">
          {producto.categoria_nombre}
        </p>

        <h3 className="mt-1 truncate font-medium text-[#16231C]">
          {producto.nombre}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-[#D9A441]">
            {formatearGuaranies(producto.precio_con_descuento)}
          </span>

          {tieneDescuento && (
            <span className="text-sm text-[#16231C]/40 line-through">
              {formatearGuaranies(producto.precio_base)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function HomePage() {
  const [destacados, setDestacados] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
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
        const [productosData, categoriasData] = await Promise.all([
          obtenerProductosDestacados(),
          obtenerCategorias(),
        ])

        if (activo) {
          setDestacados(productosData)
          setCategorias(categoriasData.filter((c) => c.esta_activo))
        }
      } catch {
        // Si falla, la portada igual muestra el hero y el CTA final.
      } finally {
        if (activo) setCargando(false)
      }
    }

    cargarInicio()

    return () => {
      activo = false
    }
  }, [])

  function manejarScrollCategorias() {
    const el = categoriasRef.current
    if (!el) return

    setScrollCategorias({
      inicio: el.scrollLeft <= 4,
      fin: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    })
  }

  return (
    <div className="bg-[#F5F6F1]">
      {/* Hero */}
      <section className="border-b border-[#1F4B43]/10 px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#D9A441]">
            Eimek
          </p>

          <h1
            className="mt-4 text-4xl leading-tight text-[#16231C] sm:text-6xl"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            Todo lo que buscás,
            <br />a un clic de distancia.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base text-[#16231C]/70">
            Explorá el catálogo, elegí tus variantes y pagá como prefieras:
            efectivo, transferencia o tarjeta.
          </p>

          <Link
            to="/productos"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#1F4B43] px-8 py-3 font-medium text-white transition hover:bg-[#16231C]"
          >
            Ver catálogo
            <span className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>

      {/* Categorias */}
      {categorias.length > 0 && (
        <section className="px-6 py-10">
          <div className="relative mx-auto max-w-6xl">
            {!scrollCategorias.inicio && (
              <div className="pointer-events-none absolute bottom-2 left-0 top-0 z-10 w-10 bg-gradient-to-r from-[#F5F6F1] to-transparent" />
            )}

            <div
              ref={categoriasRef}
              onScroll={manejarScrollCategorias}
              className="flex gap-3 overflow-x-auto pb-2"
            >
              {categorias.map((categoria) => (
                <Link
                  key={categoria.id}
                  to={`/productos?categoria=${categoria.slug}`}
                  className="shrink-0 rounded-full border border-[#1F4B43]/20 bg-white px-5 py-2 text-sm font-medium text-[#16231C] transition hover:border-[#1F4B43] hover:bg-[#1F4B43] hover:text-white active:scale-95"
                >
                  {categoria.nombre}
                </Link>
              ))}
            </div>

            {!scrollCategorias.fin && (
              <div className="pointer-events-none absolute bottom-2 right-0 top-0 z-10 w-10 bg-gradient-to-l from-[#F5F6F1] to-transparent" />
            )}
          </div>
        </section>
      )}

      {/* Destacados */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-end justify-between">
            <h2
              className="text-2xl text-[#16231C] sm:text-3xl"
              style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
            >
              Destacados
            </h2>

            <Link
              to="/productos"
              className="group text-sm font-medium text-[#1F4B43] hover:underline"
            >
              Ver todo{' '}
              <span className="inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {cargando && (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse rounded-lg bg-[#1F4B43]/5"
                />
              ))}
            </div>
          )}

          {!cargando && destacados.length === 0 && (
            <div className="rounded-lg border border-[#1F4B43]/10 bg-white p-8 text-center text-sm text-[#16231C]/60">
              Todavía no hay productos destacados. Mirá el catálogo completo.
            </div>
          )}

          {!cargando && destacados.length > 0 && (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {destacados.map((producto, indice) => (
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

      {/* CTA final */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-4xl rounded-lg bg-[#1F4B43] px-8 py-12 text-center">
          <h2
            className="text-2xl text-white sm:text-3xl"
            style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
          >
            ¿Ya sabés lo que buscás?
          </h2>

          <p className="mt-3 text-white/70">
            Filtrá por categoría, precio o nombre en el catálogo completo.
          </p>

          <Link
            to="/productos"
            className="mt-6 inline-block rounded-full bg-[#D9A441] px-8 py-3 font-medium text-[#16231C] transition hover:bg-[#c99436]"
          >
            Explorar productos
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
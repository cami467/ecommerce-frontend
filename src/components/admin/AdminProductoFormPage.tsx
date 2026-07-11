import { useEffect, useMemo, useState } from 'react'
import { isAxiosError } from 'axios'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  actualizarProducto,
  crearProducto,
  crearVariante,
  obtenerProductoAdminPorSlug,
  subirImagenProducto,
  type ProductoPayload,
} from '../../api/admin'
import { obtenerCategorias } from '../../api/categorias'
import { AdminLayout } from '../../layout/AdminLayout'
import type { Categoria } from '../../types/categoria'

interface ErroresBackend {
  [campo: string]: string[] | string | undefined
}

function obtenerPrimerError(
  errores: ErroresBackend,
  campo: string
): string | null {
  const valor = errores[campo]

  if (!valor) return null
  if (Array.isArray(valor)) return valor[0] ?? null

  return valor
}

export function AdminProductoFormPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const esEdicion = Boolean(slug)

  const [categorias, setCategorias] = useState<Categoria[]>([])

  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [precioBase, setPrecioBase] = useState('')
  const [porcentajeDescuento, setPorcentajeDescuento] = useState('0')
  const [tasaIva, setTasaIva] = useState<'10' | '5' | '0'>('10')
  const [esDestacado, setEsDestacado] = useState(false)
  const [estaActivo, setEstaActivo] = useState(true)

  // Solo aplican en modo creación: producto sin variante no tiene stock,
  // y sin al menos una imagen se ve vacío en el catálogo.
  const [imagenArchivo, setImagenArchivo] = useState<File | null>(null)
  const [varianteNombre, setVarianteNombre] = useState('Único')
  const [varianteSku, setVarianteSku] = useState('')
  const [varianteInventario, setVarianteInventario] = useState('0')

  const [cargando, setCargando] = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [errorGeneral, setErrorGeneral] = useState('')
  const [erroresBackend, setErroresBackend] =
    useState<ErroresBackend>({})

  useEffect(() => {
    async function cargarDatos() {
      try {
        setErrorGeneral('')

        const categoriasData = await obtenerCategorias()
        setCategorias(
          categoriasData.filter((item) => item.esta_activo)
        )

        if (slug) {
          const producto = await obtenerProductoAdminPorSlug(slug)

          setNombre(producto.nombre ?? '')
          setCategoria(
            producto.categoria_detalle?.slug ??
              producto.categoria_nombre ??
              ''
          )
          setDescripcion(producto.descripcion ?? '')
          setPrecioBase(String(producto.precio_base ?? ''))
          setPorcentajeDescuento(
            String(producto.porcentaje_descuento ?? '0')
          )
          setTasaIva(
            String(producto.tasa_iva ?? '10') as '10' | '5' | '0'
          )
          setEsDestacado(Boolean(producto.es_destacado))
          setEstaActivo(Boolean(producto.esta_activo))
        }
      } catch {
        setErrorGeneral(
          'No se pudieron cargar los datos del producto.'
        )
      } finally {
        setCargando(false)
      }
    }

    cargarDatos()
  }, [slug])

  const erroresLocales = useMemo(() => {
    const errores: Record<string, string> = {}

    if (!nombre.trim()) {
      errores.nombre = 'El nombre es obligatorio.'
    }

    if (!categoria) {
      errores.categoria = 'Seleccioná una categoría.'
    }

    const precio = Number(precioBase)

    if (!precioBase || Number.isNaN(precio) || precio <= 0) {
      errores.precio_base = 'El precio debe ser mayor a 0.'
    }

    const descuento = Number(porcentajeDescuento)

    if (
      Number.isNaN(descuento) ||
      descuento < 0 ||
      descuento > 90
    ) {
      errores.porcentaje_descuento =
        'El descuento debe estar entre 0 y 90.'
    }

    // La variante inicial solo es obligatoria al crear. En edición
    // el stock se maneja aparte, desde la lista de variantes.
    if (!esEdicion) {
      if (!varianteSku.trim()) {
        errores.variante_sku = 'El SKU es obligatorio.'
      } else if (!/^[A-Za-z0-9-]+$/.test(varianteSku.trim())) {
        errores.variante_sku =
          'El SKU solo permite letras, números y guiones.'
      }

      const inventario = Number(varianteInventario)
      if (
        varianteInventario === '' ||
        Number.isNaN(inventario) ||
        inventario < 0
      ) {
        errores.variante_inventario =
          'El inventario debe ser 0 o mayor.'
      }
    }

    return errores
  }, [
    nombre,
    categoria,
    precioBase,
    porcentajeDescuento,
    esEdicion,
    varianteSku,
    varianteInventario,
  ])

  const formularioValido =
    Object.keys(erroresLocales).length === 0

  function handleArchivoSeleccionado(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const archivo = event.target.files?.[0] ?? null

    if (archivo && archivo.size > 5 * 1024 * 1024) {
      setErrorGeneral('La imagen no puede superar los 5 MB.')
      event.target.value = ''
      setImagenArchivo(null)
      return
    }

    setErrorGeneral('')
    setImagenArchivo(archivo)
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!formularioValido || guardando) return

    try {
      setGuardando(true)
      setErrorGeneral('')
      setErroresBackend({})

      const payload: ProductoPayload = {
        nombre: nombre.trim(),
        categoria,
        descripcion: descripcion.trim(),
        precio_base: Number(precioBase),
        porcentaje_descuento: Number(porcentajeDescuento),
        tasa_iva: tasaIva,
        es_destacado: esDestacado,
        esta_activo: estaActivo,
      }

      if (slug) {
        await actualizarProducto(slug, payload)
      } else {
        // El producto se crea primero: recién con su id se pueden
        // subir la imagen y crear la variante, porque ambos endpoints
        // los piden como referencia.
        const productoCreado = await crearProducto(payload)

        if (imagenArchivo) {
          await subirImagenProducto(
            productoCreado.id,
            imagenArchivo,
            true
          )
        }

        await crearVariante({
          producto: productoCreado.id,
          nombre: varianteNombre.trim() || 'Único',
          sku: varianteSku.trim().toUpperCase(),
          inventario: Number(varianteInventario),
          esta_activo: true,
        })
      }

      navigate('/admin-dashboard/productos')
    } catch (error) {
      if (isAxiosError(error) && error.response?.data) {
        setErroresBackend(
          error.response.data as ErroresBackend
        )
      } else {
        setErrorGeneral(
          'No se pudo guardar el producto.'
        )
      }
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <AdminLayout>
        <p className="text-gray-600">
          Cargando producto...
        </p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl">
        <Link
          to="/admin-dashboard/productos"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver a productos
        </Link>

        <header className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {esEdicion
              ? 'Editar producto'
              : 'Nuevo producto'}
          </h1>

          <p className="mt-1 text-sm text-gray-600">
            {esEdicion
              ? 'Modificá los datos del producto.'
              : 'Registrá un nuevo producto en el catálogo.'}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          {errorGeneral && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-700">
              {errorGeneral}
            </div>
          )}

          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre
            </label>

            <input
              id="nombre"
              value={nombre}
              onChange={(event) =>
                setNombre(event.target.value)
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />

            {(erroresLocales.nombre ||
              obtenerPrimerError(
                erroresBackend,
                'nombre'
              )) && (
              <p className="mt-1 text-xs text-red-600">
                {erroresLocales.nombre ||
                  obtenerPrimerError(
                    erroresBackend,
                    'nombre'
                  )}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="categoria"
              className="block text-sm font-medium text-gray-700"
            >
              Categoría
            </label>

            <select
              id="categoria"
              value={categoria}
              onChange={(event) =>
                setCategoria(event.target.value)
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="">
                Seleccioná una categoría
              </option>

              {categorias.map((item) => (
                <option
                  key={item.id}
                  value={item.slug}
                >
                  {item.nombre}
                </option>
              ))}
            </select>

            {(erroresLocales.categoria ||
              obtenerPrimerError(
                erroresBackend,
                'categoria'
              )) && (
              <p className="mt-1 text-xs text-red-600">
                {erroresLocales.categoria ||
                  obtenerPrimerError(
                    erroresBackend,
                    'categoria'
                  )}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="descripcion"
              className="block text-sm font-medium text-gray-700"
            >
              Descripción
            </label>

            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(event) =>
                setDescripcion(event.target.value)
              }
              rows={4}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />

            {obtenerPrimerError(
              erroresBackend,
              'descripcion'
            ) && (
              <p className="mt-1 text-xs text-red-600">
                {obtenerPrimerError(
                  erroresBackend,
                  'descripcion'
                )}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="precio-base"
                className="block text-sm font-medium text-gray-700"
              >
                Precio base
              </label>

              <input
                id="precio-base"
                type="number"
                min="1"
                value={precioBase}
                onChange={(event) =>
                  setPrecioBase(event.target.value)
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />

              {(erroresLocales.precio_base ||
                obtenerPrimerError(
                  erroresBackend,
                  'precio_base'
                )) && (
                <p className="mt-1 text-xs text-red-600">
                  {erroresLocales.precio_base ||
                    obtenerPrimerError(
                      erroresBackend,
                      'precio_base'
                    )}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="descuento"
                className="block text-sm font-medium text-gray-700"
              >
                Descuento (%)
              </label>

              <input
                id="descuento"
                type="number"
                min="0"
                max="90"
                value={porcentajeDescuento}
                onChange={(event) =>
                  setPorcentajeDescuento(
                    event.target.value
                  )
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />

              {(erroresLocales.porcentaje_descuento ||
                obtenerPrimerError(
                  erroresBackend,
                  'porcentaje_descuento'
                )) && (
                <p className="mt-1 text-xs text-red-600">
                  {erroresLocales.porcentaje_descuento ||
                    obtenerPrimerError(
                      erroresBackend,
                      'porcentaje_descuento'
                    )}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="tasa-iva"
              className="block text-sm font-medium text-gray-700"
            >
              Tasa de IVA
            </label>

            <select
              id="tasa-iva"
              value={tasaIva}
              onChange={(event) =>
                setTasaIva(
                  event.target.value as '10' | '5' | '0'
                )
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            >
              <option value="10">10%</option>
              <option value="5">5%</option>
              <option value="0">Exento</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={esDestacado}
                onChange={(event) =>
                  setEsDestacado(event.target.checked)
                }
              />
              Producto destacado
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={estaActivo}
                onChange={(event) =>
                  setEstaActivo(event.target.checked)
                }
              />
              Producto activo
            </label>
          </div>

          {!esEdicion && (
            <>
              <div className="border-t pt-5">
                <label
                  htmlFor="imagen"
                  className="block text-sm font-medium text-gray-700"
                >
                  Imagen del producto
                </label>

                <input
                  id="imagen"
                  type="file"
                  accept="image/*"
                  onChange={handleArchivoSeleccionado}
                  className="mt-1 block w-full text-sm text-gray-600"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Opcional al crear, máximo 5 MB. Se puede agregar después desde la edición.
                </p>

                {imagenArchivo && (
                  <img
                    src={URL.createObjectURL(imagenArchivo)}
                    alt="Previsualización"
                    className="mt-2 h-24 w-24 rounded object-cover"
                  />
                )}
              </div>

              <div className="border-t pt-5">
                <h2 className="text-sm font-semibold text-gray-800">
                  Stock inicial
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  El stock se maneja por variante. Esta es la primera; podés agregar más después desde el detalle del producto.
                </p>

                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="variante-nombre"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre de la variante
                    </label>

                    <input
                      id="variante-nombre"
                      value={varianteNombre}
                      onChange={(event) =>
                        setVarianteNombre(event.target.value)
                      }
                      placeholder="Único, Talle M, Rojo..."
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="variante-sku"
                      className="block text-sm font-medium text-gray-700"
                    >
                      SKU
                    </label>

                    <input
                      id="variante-sku"
                      value={varianteSku}
                      onChange={(event) =>
                        setVarianteSku(event.target.value)
                      }
                      placeholder="CAM-FUT-M"
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />

                    {erroresLocales.variante_sku && (
                      <p className="mt-1 text-xs text-red-600">
                        {erroresLocales.variante_sku}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="variante-inventario"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Inventario
                    </label>

                    <input
                      id="variante-inventario"
                      type="number"
                      min="0"
                      value={varianteInventario}
                      onChange={(event) =>
                        setVarianteInventario(event.target.value)
                      }
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                    />

                    {erroresLocales.variante_inventario && (
                      <p className="mt-1 text-xs text-red-600">
                        {erroresLocales.variante_inventario}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex gap-3 border-t pt-5">
            <button
              type="submit"
              disabled={!formularioValido || guardando}
              className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {guardando
                ? 'Guardando...'
                : esEdicion
                  ? 'Guardar cambios'
                  : 'Crear producto'}
            </button>

            <Link
              to="/admin-dashboard/productos"
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
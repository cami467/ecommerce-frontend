import { useRef, useState } from 'react'
import {
  eliminarImagenProducto,
  marcarImagenPrincipal,
  subirImagenProducto,
} from '../../api/admin'
import type { ProductoImagen } from '../../types/producto'

interface ImagenesProductoAdminProps {
  productoId: string
  imagenesIniciales: ProductoImagen[]
  onActualizar?: (imagenes: ProductoImagen[]) => void
}

export function ImagenesProductoAdmin({
  productoId,
  imagenesIniciales,
  onActualizar,
}: ImagenesProductoAdminProps) {
  const [imagenes, setImagenes] =
    useState<ProductoImagen[]>(imagenesIniciales)

  const [subiendo, setSubiendo] = useState(false)
  const [procesandoId, setProcesandoId] = useState<string | null>(
    null
  )
  const [error, setError] = useState('')

  const inputArchivoRef = useRef<HTMLInputElement>(null)

  function actualizarLista(nuevasImagenes: ProductoImagen[]) {
    setImagenes(nuevasImagenes)
    onActualizar?.(nuevasImagenes)
  }

  async function handleSeleccionArchivos(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const archivos = event.target.files

    if (!archivos || archivos.length === 0) return

    try {
      setSubiendo(true)
      setError('')

      let listaActual = imagenes

      for (const archivo of Array.from(archivos)) {
        const esPrincipal = listaActual.length === 0

        const nuevaImagen = await subirImagenProducto(
          productoId,
          archivo,
          esPrincipal
        )

        listaActual = [...listaActual, nuevaImagen]
      }

      actualizarLista(listaActual)
    } catch {
      setError('No se pudieron subir una o más imágenes.')
    } finally {
      setSubiendo(false)

      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = ''
      }
    }
  }

  async function handleMarcarPrincipal(imagenId: string) {
    try {
      setProcesandoId(imagenId)
      setError('')

      await marcarImagenPrincipal(imagenId)

      actualizarLista(
        imagenes.map((imagen) => ({
          ...imagen,
          es_principal: imagen.id === imagenId,
        }))
      )
    } catch {
      setError('No se pudo marcar la imagen como principal.')
    } finally {
      setProcesandoId(null)
    }
  }

  async function handleEliminar(imagenId: string) {
    const confirmado = window.confirm(
      '¿Eliminar esta imagen? Esta acción no se puede deshacer.'
    )

    if (!confirmado) return

    try {
      setProcesandoId(imagenId)
      setError('')

      await eliminarImagenProducto(imagenId)

      actualizarLista(
        imagenes.filter((imagen) => imagen.id !== imagenId)
      )
    } catch {
      setError('No se pudo eliminar la imagen.')
    } finally {
      setProcesandoId(null)
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Imágenes del producto
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Subí fotos y elegí cuál se muestra como principal en el
            catálogo.
          </p>
        </div>

        <div>
          <input
            ref={inputArchivoRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleSeleccionArchivos}
            disabled={subiendo}
            className="hidden"
            id="input-imagenes"
          />

          <label
            htmlFor="input-imagenes"
            className={`inline-block cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 ${
              subiendo ? 'pointer-events-none opacity-60' : ''
            }`}
          >
            {subiendo ? 'Subiendo...' : 'Subir imágenes'}
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {imagenes.length === 0 ? (
        <div className="mt-6 rounded bg-gray-50 p-6 text-center text-sm text-gray-600">
          Este producto todavía no tiene imágenes.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {imagenes
            .slice()
            .sort((a, b) => a.orden - b.orden)
            .map((imagen) => (
              <div
                key={imagen.id}
                className="group relative overflow-hidden rounded-lg border border-gray-200"
              >
                <img
                  src={imagen.url}
                  alt="Imagen del producto"
                  className="h-32 w-full object-cover"
                />

                {imagen.es_principal && (
                  <span className="absolute left-2 top-2 rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                    Principal
                  </span>
                )}

                <div className="flex items-center justify-between gap-2 bg-white p-2">
                  {!imagen.es_principal && (
                    <button
                      type="button"
                      onClick={() =>
                        handleMarcarPrincipal(imagen.id)
                      }
                      disabled={procesandoId === imagen.id}
                      className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                    >
                      Marcar principal
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleEliminar(imagen.id)}
                    disabled={procesandoId === imagen.id}
                    className="ml-auto text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    {procesandoId === imagen.id
                      ? '...'
                      : 'Eliminar'}
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </section>
  )
}
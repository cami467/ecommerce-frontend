import { useState } from 'react'
import {
  actualizarVariante,
  crearVariante,
  type VarianteBasePayload,
} from '../../api/admin'
import type { ProductoVariante } from '../../types/producto'

interface VariantesProductoAdminProps {
  productoId: string
  variantesIniciales: ProductoVariante[]
  onActualizar?: (variantes: ProductoVariante[]) => void
}

const varianteVacia: VarianteBasePayload = {
  nombre: '',
  sku: '',
  modificador_precio: 0,
  inventario: 0,
  stock_minimo: 0,
  atributos: {},
  esta_activo: true,
}

export function VariantesProductoAdmin({
  productoId,
  variantesIniciales,
  onActualizar,
}: VariantesProductoAdminProps) {
  const [variantes, setVariantes] =
    useState<ProductoVariante[]>(variantesIniciales)

  const [formulario, setFormulario] =
    useState<VarianteBasePayload>(varianteVacia)

  const [varianteEditandoId, setVarianteEditandoId] =
    useState<string | null>(null)

  const [atributosTexto, setAtributosTexto] = useState('{}')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  function actualizarLista(nuevasVariantes: ProductoVariante[]) {
    setVariantes(nuevasVariantes)
    onActualizar?.(nuevasVariantes)
  }

  function abrirNuevaVariante() {
    setVarianteEditandoId(null)
    setFormulario(varianteVacia)
    setAtributosTexto('{}')
    setError('')
    setMostrarFormulario(true)
  }

  function abrirEdicion(variante: ProductoVariante) {
    setVarianteEditandoId(variante.id)

    setFormulario({
      nombre: variante.nombre,
      sku: variante.sku,
      modificador_precio: Number(variante.modificador_precio ?? 0),
      inventario: variante.inventario,
      stock_minimo: variante.stock_minimo,
      atributos: variante.atributos ?? {},
      esta_activo: variante.esta_activo,
    })

    setAtributosTexto(
      JSON.stringify(variante.atributos ?? {}, null, 2)
    )

    setError('')
    setMostrarFormulario(true)
  }

  function cerrarFormulario() {
    setMostrarFormulario(false)
    setVarianteEditandoId(null)
    setError('')
  }

  async function handleGuardar(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    if (!formulario.nombre.trim()) {
      setError('El nombre de la variante es obligatorio.')
      return
    }

    if (!formulario.sku.trim()) {
      setError('El SKU es obligatorio.')
      return
    }

    if (formulario.inventario < 0) {
      setError('El inventario no puede ser negativo.')
      return
    }

    if (formulario.stock_minimo < 0) {
      setError('El stock mínimo no puede ser negativo.')
      return
    }

    let atributos: Record<string, string>

    try {
      const resultado = JSON.parse(atributosTexto)

      if (
        typeof resultado !== 'object' ||
        resultado === null ||
        Array.isArray(resultado)
      ) {
        setError('Los atributos deben ser un objeto JSON.')
        return
      }

      atributos = resultado
    } catch {
      setError('Los atributos no contienen un JSON válido.')
      return
    }

    try {
      setGuardando(true)
      setError('')

      if (varianteEditandoId) {
        const varianteActualizada = await actualizarVariante(
          varianteEditandoId,
          {
            nombre: formulario.nombre.trim(),
            sku: formulario.sku.trim().toUpperCase(),
            modificador_precio: Number(
              formulario.modificador_precio
            ),
            inventario: Number(formulario.inventario),
            stock_minimo: Number(formulario.stock_minimo),
            atributos,
            esta_activo: formulario.esta_activo,
          }
        )

        actualizarLista(
          variantes.map((item) =>
            item.id === varianteActualizada.id
              ? varianteActualizada
              : item
          )
        )
      } else {
        const nuevaVariante = await crearVariante({
          producto: productoId,
          nombre: formulario.nombre.trim(),
          sku: formulario.sku.trim().toUpperCase(),
          modificador_precio: Number(
            formulario.modificador_precio
          ),
          inventario: Number(formulario.inventario),
          stock_minimo: Number(formulario.stock_minimo),
          atributos,
          esta_activo: formulario.esta_activo,
        })

        actualizarLista([...variantes, nuevaVariante])
      }

      cerrarFormulario()
    } catch {
      setError(
        'No se pudo guardar la variante. Verificá que el SKU sea único.'
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Variantes e inventario
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Administrá talles, colores, precios y existencias.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirNuevaVariante}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nueva variante
        </button>
      </div>

      {variantes.length === 0 ? (
        <div className="mt-6 rounded bg-gray-50 p-6 text-center text-sm text-gray-600">
          Este producto todavía no tiene variantes.
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Variante
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  SKU
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Modificador
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Inventario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Stock mínimo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">
                  Acción
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {variantes.map((variante) => (
                <tr key={variante.id}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {variante.nombre}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    {variante.sku}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    Gs.{' '}
                    {Number(
                      variante.modificador_precio ?? 0
                    ).toLocaleString('es-PY')}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    {variante.inventario}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    {variante.stock_minimo}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        variante.esta_activo
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {variante.esta_activo
                        ? 'Activa'
                        : 'Inactiva'}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => abrirEdicion(variante)}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900">
              {varianteEditandoId
                ? 'Editar variante'
                : 'Nueva variante'}
            </h3>

            <form
              onSubmit={handleGuardar}
              className="mt-5 space-y-4"
            >
              {error && (
                <div className="rounded bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>

                  <input
                    value={formulario.nombre}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        nombre: event.target.value,
                      }))
                    }
                    placeholder="Ej: Talle 42 - Negro"
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    SKU
                  </label>

                  <input
                    value={formulario.sku}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        sku: event.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="ZAP-RUN-42"
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Modificador de precio
                  </label>

                  <input
                    type="number"
                    value={formulario.modificador_precio}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        modificador_precio: Number(
                          event.target.value
                        ),
                      }))
                    }
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Inventario
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formulario.inventario}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        inventario: Number(event.target.value),
                      }))
                    }
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stock mínimo
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={formulario.stock_minimo}
                    onChange={(event) =>
                      setFormulario((actual) => ({
                        ...actual,
                        stock_minimo: Number(
                          event.target.value
                        ),
                      }))
                    }
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Atributos JSON
                </label>

                <textarea
                  value={atributosTexto}
                  onChange={(event) =>
                    setAtributosTexto(event.target.value)
                  }
                  rows={5}
                  placeholder={'{\n  "talle": "42",\n  "color": "negro"\n}'}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Debe ser un objeto JSON válido.
                </p>
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formulario.esta_activo}
                  onChange={(event) =>
                    setFormulario((actual) => ({
                      ...actual,
                      esta_activo: event.target.checked,
                    }))
                  }
                />

                Variante activa
              </label>

              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={cerrarFormulario}
                  className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={guardando}
                  className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:bg-gray-300"
                >
                  {guardando
                    ? 'Guardando...'
                    : 'Guardar variante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
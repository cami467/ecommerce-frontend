import { useEffect, useState } from 'react'
import { actualizarPerfil, obtenerPerfil } from '../api/auth'
import {
  normalizeSpaces,
  sanitizePhone,
  validatePersonName,
} from '../utils/validators'

function MiCuentaPage() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [telefono, setTelefono] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [modoEdicion, setModoEdicion] = useState(false)

  useEffect(() => {
    async function cargarPerfil() {
      try {
        const perfil = await obtenerPerfil()
        setEmail(perfil.email ?? '')
        setFirstName(perfil.first_name ?? '')
        setLastName(perfil.last_name ?? '')
        setTelefono(perfil.telefono ?? '')
      } catch {
        setError('No se pudo cargar tu perfil.')
      } finally {
        setCargando(false)
      }
    }

    cargarPerfil()
  }, [])

  const errorNombre = firstName
    ? validatePersonName(firstName, 'El nombre')
    : null

  const errorApellido = lastName
    ? validatePersonName(lastName, 'El apellido')
    : null

  const formularioValido = !errorNombre && !errorApellido

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formularioValido) return

    try {
      setGuardando(true)
      setError('')
      setMensaje('')

      await actualizarPerfil({
        first_name: normalizeSpaces(firstName),
        last_name: normalizeSpaces(lastName),
        telefono: telefono || undefined,
      })

      setMensaje('Perfil actualizado correctamente.')
      setModoEdicion(false)
    } catch {
      setError('No se pudo actualizar tu perfil.')
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-gray-600">Cargando perfil...</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Mi cuenta</h1>

      {!modoEdicion && (
        <div className="mt-6 rounded-lg bg-white p-6 shadow space-y-3">
          {mensaje && (
            <div className="rounded bg-green-50 p-3 text-sm text-green-700">
              {mensaje}
            </div>
          )}

          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <p>
            <span className="font-medium">Nombre:</span>{' '}
            {firstName || lastName
              ? `${firstName} ${lastName}`.trim()
              : 'Completa tu perfil'}
          </p>

          <p>
            <span className="font-medium">Email:</span> {email}
          </p>

          <p>
            <span className="font-medium">Teléfono:</span>{' '}
            {telefono || 'No registrado'}
          </p>

          <button
            type="button"
            onClick={() => setModoEdicion(true)}
            className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Editar perfil
          </button>
        </div>
      )}

      {modoEdicion && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow"
        >
          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              value={email}
              disabled
              className="mt-1 w-full rounded border border-gray-300 bg-gray-100 px-3 py-2 text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
            {errorNombre && (
              <p className="mt-1 text-xs text-red-600">{errorNombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Apellido
            </label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
            {errorApellido && (
              <p className="mt-1 text-xs text-red-600">{errorApellido}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              value={telefono}
              onChange={(e) => setTelefono(sanitizePhone(e.target.value))}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={guardando || !formularioValido}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-gray-300"
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>

            <button
              type="button"
              onClick={() => setModoEdicion(false)}
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </main>
  )
}

export default MiCuentaPage

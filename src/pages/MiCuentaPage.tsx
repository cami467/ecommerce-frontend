import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerPerfil } from '../api/auth'
import {
  normalizeSpaces,
  sanitizePhone,
  validatePersonName,
} from '../utils/validators'
import apiClient from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { AccountSidebar } from '../components/account/AccountSidebar'

function MiCuentaPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [telefono, setTelefono] = useState('')
  const [avatar, setAvatar] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [modoEdicion, setModoEdicion] = useState(false)
  const [expandido, setExpandido] = useState(false)

  useEffect(() => {
    async function cargarPerfil() {
      try {
        const perfil = await obtenerPerfil()
        setEmail(perfil.email ?? '')
        setFirstName(perfil.first_name ?? '')
        setLastName(perfil.last_name ?? '')
        setTelefono(perfil.telefono ?? '')
        setAvatar(perfil.avatar ?? '')
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

      const formData = new FormData()
      formData.append('first_name', normalizeSpaces(firstName))
      formData.append('last_name', normalizeSpaces(lastName))
      if (telefono) formData.append('telefono', telefono)
      if (avatarFile) formData.append('avatar', avatarFile)

      const response = await apiClient.patch('/usuarios/perfil/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setMensaje('Perfil actualizado correctamente.')
      setModoEdicion(false)
      setAvatar(response.data.avatar ?? avatar)
    } catch {
      setError('No se pudo actualizar tu perfil.')
    } finally {
      setGuardando(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const nombreCompleto =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Usuario'

  return (
    // "flex" real en vez de position fijo + margin-left calculado a mano.
    // Así el <main> siempre ocupa el espacio restante junto al sidebar,
    // sin importar si el sidebar está expandido (w-56) o colapsado (w-20).
    <div className="flex min-h-screen">
      <AccountSidebar
        nombreUsuario={nombreCompleto}
        avatar={avatar || undefined}
        seccionActiva="perfil"
        onLogout={handleLogout}
        expandido={expandido}
        setExpandido={setExpandido}
      />

      <main className="min-w-0 flex-1 bg-gray-50 px-6 py-8">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
          <h1 className="mb-6 w-full max-w-2xl text-2xl font-bold text-gray-900">
            Mi cuenta
          </h1>

          <section className="w-full max-w-2xl">
            {cargando ? (
              <p className="text-gray-600">Cargando perfil...</p>
            ) : (
              <>
                {!modoEdicion && (
                  <div className="rounded-lg bg-white p-6 shadow">
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

                  <div className="flex items-center gap-4">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-700">
                        {(firstName || email).charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {firstName || lastName
                          ? `${firstName} ${lastName}`.trim()
                          : 'Completa tu perfil'}
                      </h2>
                      <p className="text-sm text-gray-500">{email}</p>
                    </div>
                  </div>

                  <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2">
                    <div className="min-w-0 rounded border border-gray-200 p-4">
                      <p className="text-xs uppercase text-gray-500">Nombre</p>
                      <p className="mt-1 truncate font-medium text-gray-900">
                        {firstName || 'No registrado'}
                      </p>
                    </div>

                    <div className="min-w-0 rounded border border-gray-200 p-4">
                      <p className="text-xs uppercase text-gray-500">Apellido</p>
                      <p className="mt-1 truncate font-medium text-gray-900">
                        {lastName || 'No registrado'}
                      </p>
                    </div>

                    <div className="min-w-0 rounded border border-gray-200 p-4">
                      <p className="text-xs uppercase text-gray-500">Correo</p>
                      <p className="mt-1 truncate font-medium text-gray-900">{email}</p>
                    </div>

                    <div className="min-w-0 rounded border border-gray-200 p-4">
                      <p className="text-xs uppercase text-gray-500">Teléfono</p>
                      <p className="mt-1 truncate font-medium text-gray-900">
                        {telefono || 'No registrado'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setModoEdicion(true)}
                    className="mt-6 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Editar perfil
                  </button>
                </div>
              )}

              {modoEdicion && (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 rounded-lg bg-white p-6 shadow"
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Foto de perfil
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setAvatarFile(file)
                      }}
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
            </>
          )}
          </section>
        </div>
      </main>
    </div>
  )
}

export default MiCuentaPage
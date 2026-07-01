import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isAxiosError } from 'axios'

interface ErroresCampo {
  username?: string[]
  email?: string[]
  password?: string[]
  password2?: string[]
  telefono?: string[]
  non_field_errors?: string[]
}

function RegistroPage() {
  const { registro } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [telefono, setTelefono] = useState('')

  const [errores, setErrores] = useState<ErroresCampo>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrores({})
    setErrorGeneral(null)
    setCargando(true)

    try {
      await registro({
        username,
        email,
        password,
        password2,
        telefono: telefono || undefined,
      })
      navigate('/login')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 400) {
        setErrores(err.response.data as ErroresCampo)
      } else {
        setErrorGeneral('Ocurrio un error al registrarte. Intenta de nuevo.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6">Crear cuenta</h1>

        {errorGeneral && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">
            {errorGeneral}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="username">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errores.username && (
            <p className="text-red-600 text-xs mt-1">{errores.username[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errores.email && (
            <p className="text-red-600 text-xs mt-1">{errores.email[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="telefono">
            Telefono (opcional)
          </label>
          <input
            id="telefono"
            type="text"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errores.telefono && (
            <p className="text-red-600 text-xs mt-1">{errores.telefono[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errores.password && (
            <p className="text-red-600 text-xs mt-1">{errores.password[0]}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" htmlFor="password2">
            Confirmar contraseña
          </label>
          <input
            id="password2"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errores.password2 && (
            <p className="text-red-600 text-xs mt-1">{errores.password2[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-sm text-center mt-4">
          Ya tenes cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesion
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegistroPage
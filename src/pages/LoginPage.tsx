import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isAxiosError } from 'axios'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setCargando(true)

    try {
      await login({ username, password })
      navigate('/mi-cuenta')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('Usuario o contraseña incorrectos.')
      } else {
        setError('Ocurrio un error al iniciar sesion. Intenta de nuevo.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6">Iniciar sesion</h1>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">
            {error}
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
        </div>

        <div className="mb-6">
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
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
        <p className="text-sm text-center mt-4">
          No tenes cuenta?{' '}
          <Link to="/registro" className="text-blue-600 hover:underline">
            Registrate
          </Link>
        </p>
      </form>
    </div>
  )
}

export default LoginPage
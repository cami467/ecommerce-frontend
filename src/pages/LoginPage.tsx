import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isAxiosError } from 'axios'

import {
isValidEmail,
} from "../utils/validators";


function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [emailTocado, setEmailTocado] = useState(false)

  const emailValido = isValidEmail(email)
  const formularioValido = emailValido && password.length > 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!formularioValido) return

    setError('')
    setCargando(true)

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      })
      navigate('/mi-cuenta')
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('Correo electrónico o contraseña incorrectos.')
      } else if (isAxiosError(err) && err.response?.status === 429) {
        setError('Demasiados intentos. Espera un momento e intenta de nuevo.')
      } else {
        setError('Ocurrió un error al iniciar sesión. Intenta de nuevo.')
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
        noValidate
      >
        <h1 className="text-2xl font-bold mb-6">Iniciar sesión</h1>

        {error && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setEmailTocado(true)}
            required
            autoComplete="email"
            aria-invalid={emailTocado && !emailValido}
            aria-describedby={
              emailTocado && email && !emailValido ? 'email-error' : undefined
            }
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {emailTocado && email && !emailValido && (
            <p id="email-error" className="text-red-600 text-xs mt-1">
              Ingresá un correo electrónico válido.
            </p>
          )}
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
            autoComplete="current-password"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={cargando || !formularioValido}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {cargando ? 'Ingresando...' : 'Iniciar sesión'}
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
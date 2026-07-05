import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { isAxiosError } from 'axios'
import {
  isPasswordStrong,
  isValidEmail,
  isValidPersonName,
  normalizeSpaces,
  sanitizePhone,
  validatePasswordRules,
} from '../utils/validators'

interface ErroresCampo {
  email?: string[]
  password?: string[]
  password2?: string[]
  telefono?: string[]
  first_name?: string[]
  last_name?: string[]
  non_field_errors?: string[]
}

function RegistroPage() {
  const { registro } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [telefono, setTelefono] = useState('')

  const [errores, setErrores] = useState<ErroresCampo>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  const passwordRules = useMemo(() => validatePasswordRules(password), [password])

  const firstNameValido = firstName.length > 0 && isValidPersonName(firstName)
  const lastNameValido = lastName.length > 0 && isValidPersonName(lastName)
  const emailValido = isValidEmail(email)
  const passwordValida = isPasswordStrong(password)
  const passwordCoincide = password.length > 0 && password === password2
  const telefonoValido = telefono.length === 0 || /^\d{6,15}$/.test(telefono)

  const formularioValido =
    firstNameValido &&
    lastNameValido &&
    emailValido &&
    passwordValida &&
    passwordCoincide &&
    telefonoValido

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!formularioValido || cargando) {
      return
    }

    setErrores({})
    setErrorGeneral(null)
    setCargando(true)

    try {
      await registro({
        first_name: normalizeSpaces(firstName),
        last_name: normalizeSpaces(lastName),
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
        setErrorGeneral('Ocurrió un error al registrarte. Intenta de nuevo.')
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

        {errores.non_field_errors && (
          <div className="bg-red-100 text-red-700 text-sm p-3 rounded mb-4">
            {errores.non_field_errors[0]}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="firstName">
            Nombre
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {firstName && !firstNameValido && (
            <p className="text-red-600 text-xs mt-1">
              El nombre solo puede contener letras, espacios, guiones o apóstrofes.
            </p>
          )}
          {errores.first_name && (
            <p className="text-red-600 text-xs mt-1">{errores.first_name[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="lastName">
            Apellido
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {lastName && !lastNameValido && (
            <p className="text-red-600 text-xs mt-1">
              El apellido solo puede contener letras, espacios, guiones o apóstrofes.
            </p>
          )}
          {errores.last_name && (
            <p className="text-red-600 text-xs mt-1">{errores.last_name[0]}</p>
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
          {email && !emailValido && (
            <p className="text-red-600 text-xs mt-1">Correo electrónico inválido.</p>
          )}
          {errores.email && (
            <p className="text-red-600 text-xs mt-1">{errores.email[0]}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="telefono">
            Teléfono (opcional)
          </label>
          <input
            id="telefono"
            type="text"
            inputMode="numeric"
            value={telefono}
            onChange={(e) => setTelefono(sanitizePhone(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {telefono && !telefonoValido && (
            <p className="text-red-600 text-xs mt-1">
              El teléfono debe tener entre 6 y 15 números.
            </p>
          )}
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
          <ul className="text-xs mt-2 space-y-1">
            <li className={passwordRules.minLength ? 'text-green-600' : 'text-gray-500'}>
              ✓ mínimo 10 caracteres
            </li>
            <li className={passwordRules.uppercase ? 'text-green-600' : 'text-gray-500'}>
              ✓ una mayúscula
            </li>
            <li className={passwordRules.lowercase ? 'text-green-600' : 'text-gray-500'}>
              ✓ una minúscula
            </li>
            <li className={passwordRules.number ? 'text-green-600' : 'text-gray-500'}>
              ✓ un número
            </li>
            <li className={passwordRules.specialChar ? 'text-green-600' : 'text-gray-500'}>
              ✓ un carácter especial
            </li>
          </ul>
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
          {password2 && !passwordCoincide && (
            <p className="text-red-600 text-xs mt-1">Las contraseñas no coinciden.</p>
          )}
          {errores.password2 && (
            <p className="text-red-600 text-xs mt-1">{errores.password2[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={cargando || !formularioValido}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-sm text-center mt-4">
          Ya tenés cuenta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  )
}

export default RegistroPage
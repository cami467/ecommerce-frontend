import { AccountLayout } from "../layout/AccountLayout"
import { useState } from "react"
import { AxiosError } from "axios"
import { validatePasswordRules } from "../utils/validators"
import apiClient from "../api/client"

export function CambiarPasswordPage() {
  const [passwordActual, setPasswordActual] = useState("")
  const [passwordNueva, setPasswordNueva] = useState("")
  const [confirmarPassword, setConfirmarPassword] = useState("")
  const [mensaje, setMensaje] = useState("")
  const [esError, setEsError] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // 1. Validar reglas de la nueva contraseña
    const reglas = validatePasswordRules(passwordNueva)
    if (
      !reglas.minLength ||
      !reglas.uppercase ||
      !reglas.lowercase ||
      !reglas.number ||
      !reglas.specialChar
    ) {
      setEsError(true)
      setMensaje("La nueva contraseña no cumple con los requisitos.")
      return
    }

    // 2. Confirmar coincidencia
    if (passwordNueva !== confirmarPassword) {
      setEsError(true)
      setMensaje("Las contraseñas no coinciden.")
      return
    }
    try {
      setEnviando(true)
      setEsError(false)

      const resp = await apiClient.post("/usuarios/cambiar-password/", {
        password_actual: passwordActual,
        password_nueva: passwordNueva,
      })

      setMensaje(resp.data.mensaje || "Contraseña cambiada correctamente")
      setPasswordActual("")
      setPasswordNueva("")
      setConfirmarPassword("")
    } catch (err) {
      setEsError(true)

      if (err instanceof AxiosError) {
        setMensaje(
          err.response?.data?.error ||
            err.response?.data?.detail ||
            "Error al cambiar contraseña"
        )
      } else {
        setMensaje("Error de conexión con el servidor")
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AccountLayout seccionActiva="password">
      <h1 className="text-2xl font-bold mb-6">Cambiar contraseña</h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Contraseña actual</label>
          <input
            type="password"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block mb-1">Nueva contraseña</label>
          <input
            type="password"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Debe tener mínimo 10 caracteres, incluir mayúscula, minúscula, número y carácter especial.
          </p>
        </div>

        <div>
          <label className="block mb-1">Confirmar nueva contraseña</label>
          <input
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {enviando ? "Guardando..." : "Guardar"}
        </button>
      </form>

      {mensaje && (
        <p className={`mt-4 text-sm ${esError ? "text-red-600" : "text-green-600"}`}>
          {mensaje}
        </p>
      )}
    </AccountLayout>
  )
}
import { useAuth } from '../hooks/useAuth'

function MiCuentaPage() {
  const { usuario } = useAuth()

  const nombre = usuario?.nombre_completo || 'Completa tu perfil'

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mi cuenta</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        <p>
          <span className="font-medium">Nombre:</span> {nombre}
        </p>
        <p>
          <span className="font-medium">Email:</span> {usuario?.email}
        </p>
        <p>
          <span className="font-medium">Telefono:</span>{' '}
          {usuario?.telefono || 'No registrado'}
        </p>
      </div>
    </div>
  )
}

export default MiCuentaPage

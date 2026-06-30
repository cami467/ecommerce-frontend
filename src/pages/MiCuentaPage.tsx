import { useAuth } from '../hooks/useAuth'

function MiCuentaPage() {
  const { usuario } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Mi cuenta</h1>
      <p>Username: {usuario?.username}</p>
    </div>
  )
}

export default MiCuentaPage
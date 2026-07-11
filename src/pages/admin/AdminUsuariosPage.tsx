import { AdminLayout } from '../../layout/AdminLayout'

export function AdminUsuariosPage() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900">
        Gestión de usuarios
      </h1>

      <p className="mt-2 text-gray-600">
        Desde esta sección podrás consultar los usuarios registrados.
      </p>
    </AdminLayout>
  )
}
import { AdminLayout } from '../../layout/AdminLayout'

export function AdminOrdenesPage() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900">
        Gestión de órdenes
      </h1>

      <p className="mt-2 text-gray-600">
        Desde esta sección podrás consultar y administrar las órdenes.
      </p>
    </AdminLayout>
  )
}
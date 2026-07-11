import { AdminLayout } from '../../layout/AdminLayout'

export function AdminPagosPage() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900">
        Gestión de pagos
      </h1>

      <p className="mt-2 text-gray-600">
        Desde esta sección podrás consultar los pagos registrados.
      </p>
    </AdminLayout>
  )
}
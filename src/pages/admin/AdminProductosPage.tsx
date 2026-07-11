import { AdminLayout } from '../../layout/AdminLayout'

export function AdminProductosPage() {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900">
        Gestión de productos
      </h1>

      <p className="mt-2 text-gray-600">
        Desde esta sección podrás administrar los productos de la tienda.
      </p>
    </AdminLayout>
  )
}
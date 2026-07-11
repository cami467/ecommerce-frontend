import { Routes, Route } from "react-router-dom";
import { Header } from "./components/layout/Header";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MiCuentaPage from "./pages/MiCuentaPage";
import RegistroPage from "./pages/RegistroPage";
import { AuthBootstrap } from "./components/AuthBootstrap";
import { ProductosPage } from "./pages/ProductosPage";
import { ProductoDetallePage } from "./pages/ProductoDetallePage";
import { CarritoPage } from "./pages/CarritoPage";
import { CarritoItemsProvider } from "./context/CarritoItemsContext";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdenDetallePage } from "./pages/OrdenDetallePage";
import { MisPedidosPage } from "./pages/MisPedidosPage";
import { CambiarPasswordPage } from "./pages/CambiarPasswordPage";
import { PagoPage } from "./pages/PagoPage";
import { AdminRoute } from "./components/admin/AdminRoute";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminProductosPage } from "./pages/admin/AdminProductosPage";
import { AdminOrdenesPage } from "./pages/admin/AdminOrdenesPage";
import { AdminPagosPage } from "./pages/admin/AdminPagosPage";
import { AdminUsuariosPage } from "./pages/admin/AdminUsuariosPage";
import { AdminProductoFormPage } from "./components/admin/AdminProductoFormPage";

function App() {
  return (
    <CarritoItemsProvider>
      <AuthBootstrap />
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/productos" element={<ProductosPage />} />
            <Route path="/productos/:slug" element={<ProductoDetallePage />} />
            <Route path="/carrito" element={<CarritoPage />} />
            <Route path="/cambiar-password" element={<CambiarPasswordPage />} />
            <Route path="/pagos/:ordenId" element={<PagoPage />} />

            {/* Ruta protegida para admin */}
            <Route
              path="/admin-dashboard"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />

            <Route
              path="/admin-dashboard/productos"
              element={
                <AdminRoute>
                  <AdminProductosPage />
                </AdminRoute>
              }
            />

            <Route
              path="/admin-dashboard/productos/nuevo"
              element={
                <AdminRoute>
                  <AdminProductoFormPage />
                </AdminRoute>
              }
            />

            <Route
              path="/admin-dashboard/productos/:slug/editar"
              element={
                <AdminRoute>
                  <AdminProductoFormPage />
                </AdminRoute>
              }
            />

            <Route
              path="/admin-dashboard/ordenes"
              element={
                <AdminRoute>
                  <AdminOrdenesPage />
                </AdminRoute>
              }
            />

            <Route
              path="/admin-dashboard/pagos"
              element={
                <AdminRoute>
                  <AdminPagosPage />
                </AdminRoute>
              }
            />

            <Route
              path="/admin-dashboard/usuarios"
              element={
                <AdminRoute>
                  <AdminUsuariosPage />
                </AdminRoute>
              }
            />

            <Route element={<ProtectedRoute />}>
              <Route path="/mi-cuenta" element={<MiCuentaPage />} />
              <Route path="/mis-pedidos" element={<MisPedidosPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/ordenes/:id" element={<OrdenDetallePage />} />
            </Route>
          </Routes>
        </div>
      </div>
    </CarritoItemsProvider>
  );
}

export default App;

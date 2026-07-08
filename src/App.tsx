import { Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { ProtectedRoute } from './routes/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MiCuentaPage from './pages/MiCuentaPage'
import RegistroPage from './pages/RegistroPage'
import { AuthBootstrap } from './components/AuthBootstrap'
import { ProductosPage } from './pages/ProductosPage'
import { ProductoDetallePage } from './pages/ProductoDetallePage'
import { CarritoPage } from './pages/CarritoPage'
import { CarritoItemsProvider } from './context/CarritoItemsContext'
import { CheckoutPage } from './pages/CheckoutPage'

function App() {
  return (
    <CarritoItemsProvider>
      <AuthBootstrap />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/productos" element={<ProductosPage />} />
        <Route path="/productos/:slug" element={<ProductoDetallePage />} />
        <Route path="/carrito" element={<CarritoPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/mi-cuenta" element={<MiCuentaPage />} />
        </Route>
      </Routes>
    </CarritoItemsProvider>
  )
}

export default App
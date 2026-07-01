import { Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { ProtectedRoute } from './routes/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MiCuentaPage from './pages/MiCuentaPage'
import RegistroPage from './pages/RegistroPage'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/mi-cuenta" element={<MiCuentaPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
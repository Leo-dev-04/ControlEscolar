import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Alumnos from './pages/Alumnos'
import AsistenciaDiaria from './pages/AsistenciaDiaria'
import Tareas from './pages/Tareas'
import Conducta from './pages/Conducta'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'
import Grupos from './pages/Grupos'
import Rezago from './pages/Rezago'

// Componente que protege rutas por rol
function RoleRoute({ children, allowedRoles }) {
  const { usuario } = useAuth()
  if (!allowedRoles.includes(usuario?.rol)) {
    return <Navigate to="/" replace />
  }
  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta de Login - Pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas - Requieren autenticación */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/alumnos" element={<Alumnos />} />
                    <Route path="/asistencia" element={<AsistenciaDiaria />} />
                    <Route path="/tareas" element={<Tareas />} />
                    <Route path="/conducta" element={<Conducta />} />
                    <Route path="/reportes" element={<Reportes />} />
                    <Route path="/usuarios" element={
                      <RoleRoute allowedRoles={['director']}>
                        <Usuarios />
                      </RoleRoute>
                    } />
                    <Route path="/grupos" element={
                      <RoleRoute allowedRoles={['director']}>
                        <Grupos />
                      </RoleRoute>
                    } />
                    <Route path="/rezago" element={
                      <RoleRoute allowedRoles={['director']}>
                        <Rezago />
                      </RoleRoute>
                    } />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App


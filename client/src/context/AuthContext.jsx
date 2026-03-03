import { createContext, useState, useContext, useEffect } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Cargar usuario desde localStorage al iniciar, verificando que el token no haya expirado
        const token = localStorage.getItem('token')
        if (token) {
            try {
                // Decodificar payload del JWT para verificar expiración
                const payload = JSON.parse(atob(token.split('.')[1]))
                if (payload.exp && payload.exp * 1000 > Date.now()) {
                    // Token aún válido
                    const usuarioGuardado = authService.getCurrentUser()
                    if (usuarioGuardado) {
                        setUsuario(usuarioGuardado)
                    }
                } else {
                    // Token expirado, limpiar sesión
                    localStorage.removeItem('token')
                    localStorage.removeItem('usuario')
                }
            } catch (error) {
                // Token malformado, limpiar sesión
                localStorage.removeItem('token')
                localStorage.removeItem('usuario')
            }
        }
        setLoading(false)
    }, [])

    const login = async (email, password) => {
        const resultado = await authService.login(email, password)
        if (resultado.success) {
            setUsuario(resultado.usuario)
        }
        return resultado
    }

    const logout = () => {
        authService.logout()
        setUsuario(null)
    }

    const value = {
        usuario,
        login,
        logout,
        isAuthenticated: !!usuario,
        loading
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider')
    }
    return context
}

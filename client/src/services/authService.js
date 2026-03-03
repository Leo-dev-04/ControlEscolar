import api from './api'

/**
 * Servicio de autenticación
 */
class AuthService {
    /**
     * Iniciar sesión
     */
    async login(email, password) {
        try {
            const response = await api.post('/auth/login', { email, password })

            if (response.data.success && response.data.data.token) {
                // Guardar token y usuario en localStorage
                localStorage.setItem('token', response.data.data.token)
                localStorage.setItem('usuario', JSON.stringify(response.data.data.usuario))

                return {
                    success: true,
                    usuario: response.data.data.usuario
                }
            }

            return {
                success: false,
                message: response.data.message || 'Error en el login'
            }
        } catch (error) {
            console.error('Error en login:', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Error de conexión'
            }
        }
    }

    /**
     * Cerrar sesión
     */
    logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        window.location.href = '/login'
    }

    /**
     * Obtener usuario actual desde localStorage
     */
    getCurrentUser() {
        const usuarioStr = localStorage.getItem('usuario')
        if (usuarioStr) {
            try {
                return JSON.parse(usuarioStr)
            } catch (error) {
                console.error('Error parsing usuario:', error)
                return null
            }
        }
        return null
    }

    /**
     * Verificar si hay un token válido
     */
    isAuthenticated() {
        const token = localStorage.getItem('token')
        return !!token
    }

    /**
     * Obtener el token actual
     */
    getToken() {
        return localStorage.getItem('token')
    }
}

export default new AuthService()

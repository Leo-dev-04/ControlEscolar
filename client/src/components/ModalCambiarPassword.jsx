import { useState } from 'react'
import api from '../services/api'

export default function ModalCambiarPassword({ onClose }) {
    const [formData, setFormData] = useState({
        passwordAntigua: '',
        passwordNueva: '',
        confirmarPassword: ''
    })
    const [showPasswordAntigua, setShowPasswordAntigua] = useState(false)
    const [showPasswordNueva, setShowPasswordNueva] = useState(false)
    const [showConfirmar, setShowConfirmar] = useState(false)
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [exito, setExito] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validaciones
        if (formData.passwordNueva.length < 6) {
            setError('La nueva contraseña debe tener al menos 6 caracteres')
            return
        }

        if (formData.passwordNueva !== formData.confirmarPassword) {
            setError('Las contraseñas no coinciden')
            return
        }

        if (formData.passwordAntigua === formData.passwordNueva) {
            setError('La nueva contraseña debe ser diferente a la actual')
            return
        }

        setLoading(true)

        try {
            await api.post('/auth/change-password', {
                passwordAntigua: formData.passwordAntigua,
                passwordNueva: formData.passwordNueva
            })

            setExito(true)
            setTimeout(() => {
                onClose()
            }, 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Error al cambiar la contraseña')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">🔑 Cambiar Contraseña</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
                        ✕
                    </button>
                </div>

                {exito ? (
                    <div className="p-8 text-center">
                        <div className="text-5xl mb-4">✅</div>
                        <h3 className="text-lg font-bold text-green-700 mb-2">¡Contraseña actualizada!</h3>
                        <p className="text-gray-500">Tu contraseña ha sido cambiada exitosamente.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Contraseña Actual
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswordAntigua ? "text" : "password"}
                                    required
                                    value={formData.passwordAntigua}
                                    onChange={e => setFormData({ ...formData, passwordAntigua: e.target.value })}
                                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="••••••••"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordAntigua(!showPasswordAntigua)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPasswordAntigua ? (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswordNueva ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={formData.passwordNueva}
                                    onChange={e => setFormData({ ...formData, passwordNueva: e.target.value })}
                                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Mínimo 6 caracteres"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordNueva(!showPasswordNueva)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPasswordNueva ? (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">
                                Confirmar Nueva Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmar ? "text" : "password"}
                                    required
                                    minLength={6}
                                    value={formData.confirmarPassword}
                                    onChange={e => setFormData({ ...formData, confirmarPassword: e.target.value })}
                                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    placeholder="Repite la nueva contraseña"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmar(!showConfirmar)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showConfirmar ? (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-4 py-2 text-white rounded-lg font-medium transition ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

import { useState, useEffect } from 'react'
import { usuariosService } from '../services/usuarios.service'
import SelectorGrupos from './SelectorGrupos'
import { useAuth } from '../context/AuthContext'

export default function ModalUsuario({ usuario, onClose, onSave }) {
    const { usuario: usuarioLogueado } = useAuth()
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'maestro',
        activo: true
    })
    const [gruposSeleccionados, setGruposSeleccionados] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (usuario) {
            setFormData({
                nombre: usuario.nombre,
                email: usuario.email,
                password: '', // No mostrar password
                rol: usuario.rol,
                activo: usuario.activo
            })
            cargarGruposAsignados(usuario.id)
        } else {
            // Generar password temporal para nuevos usuarios
            generarPassword()
        }
    }, [usuario])

    const cargarGruposAsignados = async (id) => {
        try {
            const response = await usuariosService.getAssignedGroups(id)
            setGruposSeleccionados(response.data.map(g => g.id))
        } catch (error) {
            console.error('Error cargando grupos asignados:', error)
        }
    }

    const generarPassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        let pass = ''
        for (let i = 0; i < 8; i++) {
            pass += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        setFormData(prev => ({ ...prev, password: pass }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            let usuarioId

            if (usuario) {
                // Actualizar
                await usuariosService.update(usuario.id, formData)
                usuarioId = usuario.id
            } else {
                // Crear
                const response = await usuariosService.create(formData)
                usuarioId = response.data.id
            }

            // Asignar grupos si es maestro
            if (formData.rol === 'maestro') {
                await usuariosService.assignGroups(usuarioId, gruposSeleccionados)
            }

            onSave()
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Error al guardar usuario')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">
                        {usuario ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre Completo</label>
                            <input
                                type="text"
                                required
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
                            <select
                                value={formData.rol}
                                onChange={e => setFormData({ ...formData, rol: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-100"
                                disabled
                            >
                                <option value="maestro">Maestro</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Solo se pueden crear cuentas de maestro</p>
                        </div>

                        {!usuario && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Contraseña Temporal
                                    <button
                                        type="button"
                                        onClick={generarPassword}
                                        className="ml-2 text-xs text-blue-600 hover:underline"
                                    >
                                        🔄 Generar
                                    </button>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg bg-gray-50 font-mono text-center tracking-wider"
                                />
                            </div>
                        )}
                    </div>

                    {formData.rol === 'maestro' && (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Grupos Asignados
                                <span className="ml-2 text-xs font-normal text-gray-500">
                                    Selecciona los grupos que impartirá este maestro
                                </span>
                            </label>
                            <SelectorGrupos
                                seleccionados={gruposSeleccionados}
                                onChange={setGruposSeleccionados}
                            />
                        </div>
                    )}

                    {usuario && (
                        <div className="mb-6">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.activo}
                                    onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-700 font-medium">Usuario Activo</span>
                            </label>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 text-white rounded-lg font-medium ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {loading ? 'Guardando...' : 'Guardar Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

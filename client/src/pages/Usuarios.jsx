import { useState, useEffect } from 'react'
import { usuariosService } from '../services/usuarios.service'
import ModalUsuario from '../components/ModalUsuario'

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [usuarioEditar, setUsuarioEditar] = useState(null)
    const [filtro, setFiltro] = useState('')

    useEffect(() => {
        cargarUsuarios()
    }, [])

    const cargarUsuarios = async () => {
        try {
            setLoading(true)
            const response = await usuariosService.getAll()
            setUsuarios(response.data)
        } catch (error) {
            console.error('Error cargando usuarios:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditar = (usuario) => {
        setUsuarioEditar(usuario)
        setModalOpen(true)
    }

    const handleNuevo = () => {
        setUsuarioEditar(null)
        setModalOpen(true)
    }

    const handleGuardar = () => {
        setModalOpen(false)
        cargarUsuarios()
    }

    const handleDelete = async (usuario) => {
        if (!confirm(`¿Estás seguro de desactivar al usuario ${usuario.nombre}?`)) return

        try {
            await usuariosService.delete(usuario.id)
            cargarUsuarios()
        } catch (error) {
            alert('Error al desactivar usuario')
        }
    }

    const usuariosFiltrados = usuarios.filter(u =>
        u.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
        u.email.toLowerCase().includes(filtro.toLowerCase())
    )

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">👥 Gestión de Usuarios</h1>
                    <p className="text-gray-600">Administra maestros, directores y administradores</p>
                </div>
                <button
                    onClick={handleNuevo}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                    <span>+</span> Nuevo Usuario
                </button>
            </div>

            {/* Filtro */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <input
                    type="text"
                    placeholder="🔍 Buscar por nombre o email..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Registro</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        Cargando usuarios...
                                    </td>
                                </tr>
                            ) : usuariosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            ) : (
                                usuariosFiltrados.map((usuario) => (
                                    <tr key={usuario.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                                                    {usuario.nombre.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">{usuario.nombre}</div>
                                                    <div className="text-sm text-gray-500">{usuario.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.rol === 'director' ? 'bg-indigo-100 text-indigo-800' :
                                                'bg-green-100 text-green-800'
                                                }`}>
                                                {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${usuario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {usuario.activo ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(usuario.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEditar(usuario)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(usuario)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Desactivar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <ModalUsuario
                    usuario={usuarioEditar}
                    onClose={() => setModalOpen(false)}
                    onSave={handleGuardar}
                />
            )}
        </div>
    )
}

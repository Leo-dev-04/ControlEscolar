import { useState, useEffect } from 'react'
import { gruposService } from '../services/grupos.service'
import { usuariosService } from '../services/usuarios.service'

const ESCUELAS = ['Gabino Barreda', 'Luis Donaldo Colosio']

export default function Grupos() {
    const [grupos, setGrupos] = useState([])
    const [maestros, setMaestros] = useState([])
    const [loading, setLoading] = useState(true)
    const [escuelaActiva, setEscuelaActiva] = useState(ESCUELAS[0])
    const [modalAbierto, setModalAbierto] = useState(false)
    const [editando, setEditando] = useState(null)
    const [formData, setFormData] = useState({
        escuela: ESCUELAS[0],
        grado: '',
        seccion: '',
        maestro_id: '',
        ciclo_escolar: '2025-2026'
    })
    const [errores, setErrores] = useState({})
    const [guardando, setGuardando] = useState(false)

    useEffect(() => {
        cargarDatos()
    }, [])

    const cargarDatos = async () => {
        try {
            setLoading(true)
            const [gruposRes, maestrosRes] = await Promise.all([
                gruposService.obtenerTodos(),
                usuariosService.getAll()
            ])
            setGrupos(gruposRes.data?.data || gruposRes.data || [])
            const todosUsuarios = maestrosRes.data?.data || maestrosRes.data || []
            setMaestros(todosUsuarios.filter(u => u.rol === 'maestro' && u.activo))
        } catch (error) {
            console.error('Error cargando datos:', error)
        } finally {
            setLoading(false)
        }
    }

    const gruposFiltrados = grupos.filter(g => g.escuela === escuelaActiva)

    const abrirModal = (grupo = null) => {
        if (grupo) {
            setEditando(grupo)
            setFormData({
                escuela: grupo.escuela || ESCUELAS[0],
                grado: grupo.grado?.toString() || '',
                seccion: grupo.seccion || '',
                maestro_id: grupo.maestro_id?.toString() || '',
                ciclo_escolar: grupo.ciclo_escolar || '2025-2026'
            })
        } else {
            setEditando(null)
            setFormData({
                escuela: escuelaActiva,
                grado: '',
                seccion: '',
                maestro_id: '',
                ciclo_escolar: '2025-2026'
            })
        }
        setErrores({})
        setModalAbierto(true)
    }

    const validarFormulario = () => {
        const nuevosErrores = {}
        if (!formData.escuela) nuevosErrores.escuela = 'La escuela es obligatoria'
        if (!formData.grado) nuevosErrores.grado = 'El grado es obligatorio'
        if (!formData.seccion.trim()) nuevosErrores.seccion = 'La sección es obligatoria'
        setErrores(nuevosErrores)
        return Object.keys(nuevosErrores).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validarFormulario()) return

        setGuardando(true)
        try {
            const datos = {
                ...formData,
                nombre: `${formData.grado}° ${formData.seccion}`,
                maestro_id: formData.maestro_id ? parseInt(formData.maestro_id) : null
            }

            if (editando) {
                await gruposService.actualizar(editando.id, datos)
            } else {
                await gruposService.crear(datos)
            }

            setModalAbierto(false)
            cargarDatos()
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.message || 'Error al guardar el grupo'
            setErrores({ general: msg })
        } finally {
            setGuardando(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este grupo?')) return
        try {
            await gruposService.eliminar(id)
            cargarDatos()
        } catch (error) {
            alert('Error al eliminar el grupo')
        }
    }

    const contarPorEscuela = (escuela) => grupos.filter(g => g.escuela === escuela).length

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📁 Gestión de Grupos</h1>
                <button
                    onClick={() => abrirModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    + Nuevo Grupo
                </button>
            </div>

            {/* Tabs de escuelas */}
            <div className="flex gap-2 mb-6 border-b">
                {ESCUELAS.map(escuela => (
                    <button
                        key={escuela}
                        onClick={() => setEscuelaActiva(escuela)}
                        className={`px-4 py-3 font-medium text-sm rounded-t-lg transition-colors ${escuelaActiva === escuela
                                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                            }`}
                    >
                        🏫 {escuela}
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${escuelaActiva === escuela
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                            {contarPorEscuela(escuela)}
                        </span>
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando grupos...</p>
                </div>
            ) : gruposFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p className="text-4xl mb-2">📁</p>
                    <p>No hay grupos en {escuelaActiva}</p>
                    <button onClick={() => abrirModal()} className="text-blue-600 hover:underline mt-2">
                        Crear el primer grupo
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {gruposFiltrados.map((grupo) => (
                        <div key={grupo.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {grupo.grado}° {grupo.seccion}
                                    </h3>
                                    <p className="text-sm text-gray-500">{grupo.ciclo_escolar}</p>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                    {grupo.total_alumnos || 0} alumnos
                                </span>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Maestro:</span>{' '}
                                    {grupo.maestro_nombre ? (
                                        <span className="text-green-700 font-medium">{grupo.maestro_nombre}</span>
                                    ) : (
                                        <span className="text-orange-500 italic">Sin asignar</span>
                                    )}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-3 border-t">
                                <button
                                    onClick={() => abrirModal(grupo)}
                                    className="flex-1 text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-1 rounded hover:bg-blue-50 transition-colors"
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(grupo.id)}
                                    className="flex-1 text-center text-sm text-red-600 hover:text-red-800 font-medium py-1 rounded hover:bg-red-50 transition-colors"
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Crear/Editar */}
            {modalAbierto && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                {editando ? '✏️ Editar Grupo' : '📁 Nuevo Grupo'}
                            </h2>

                            {errores.general && (
                                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                    {errores.general}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Escuela *</label>
                                    <select
                                        value={formData.escuela}
                                        onChange={e => { setFormData({ ...formData, escuela: e.target.value }); setErrores({ ...errores, escuela: '' }) }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errores.escuela ? 'border-red-500' : ''}`}
                                    >
                                        {ESCUELAS.map(esc => (
                                            <option key={esc} value={esc}>{esc}</option>
                                        ))}
                                    </select>
                                    {errores.escuela && <p className="text-red-500 text-xs mt-1">{errores.escuela}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Grado *</label>
                                    <select
                                        value={formData.grado}
                                        onChange={e => { setFormData({ ...formData, grado: e.target.value }); setErrores({ ...errores, grado: '' }) }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errores.grado ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Seleccionar grado</option>
                                        <option value="1">1° Primero</option>
                                        <option value="2">2° Segundo</option>
                                        <option value="3">3° Tercero</option>
                                        <option value="4">4° Cuarto</option>
                                        <option value="5">5° Quinto</option>
                                        <option value="6">6° Sexto</option>
                                    </select>
                                    {errores.grado && <p className="text-red-500 text-xs mt-1">{errores.grado}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sección *</label>
                                    <select
                                        value={formData.seccion}
                                        onChange={e => { setFormData({ ...formData, seccion: e.target.value }); setErrores({ ...errores, seccion: '' }) }}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errores.seccion ? 'border-red-500' : ''}`}
                                    >
                                        <option value="">Seleccionar sección</option>
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                        <option value="D">D</option>
                                    </select>
                                    {errores.seccion && <p className="text-red-500 text-xs mt-1">{errores.seccion}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ciclo Escolar</label>
                                    <input
                                        type="text"
                                        value={formData.ciclo_escolar}
                                        onChange={e => setFormData({ ...formData, ciclo_escolar: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: 2025-2026"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Maestro Asignado</label>
                                    <select
                                        value={formData.maestro_id}
                                        onChange={e => setFormData({ ...formData, maestro_id: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- Sin asignar --</option>
                                        {maestros.map(m => (
                                            <option key={m.id} value={m.id}>{m.nombre} ({m.email})</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Selecciona el maestro responsable de este grupo</p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setModalAbierto(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                        disabled={guardando}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        disabled={guardando}
                                    >
                                        {guardando ? 'Guardando...' : (editando ? 'Actualizar' : 'Crear Grupo')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

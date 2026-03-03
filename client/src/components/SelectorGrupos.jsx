import { useState, useEffect } from 'react'
import { gruposService } from '../services/grupos.service'

export default function SelectorGrupos({ seleccionados = [], onChange, disabled = false }) {
    const [grupos, setGrupos] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        cargarGrupos()
    }, [])

    const cargarGrupos = async () => {
        try {
            const response = await gruposService.obtenerTodos()
            setGrupos(response.data)
        } catch (error) {
            console.error('Error cargando grupos:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleGrupo = (grupoId) => {
        if (disabled) return

        const nuevosSeleccionados = seleccionados.includes(grupoId)
            ? seleccionados.filter(id => id !== grupoId)
            : [...seleccionados, grupoId]

        onChange(nuevosSeleccionados)
    }

    if (loading) return <div className="text-sm text-gray-500">Cargando grupos...</div>

    // Agrupar por grado
    const gruposPorGrado = grupos.reduce((acc, grupo) => {
        const grado = grupo.grado
        if (!acc[grado]) acc[grado] = []
        acc[grado].push(grupo)
        return acc
    }, {})

    return (
        <div className="border rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
            {Object.keys(gruposPorGrado).map(grado => (
                <div key={grado} className="mb-3 last:mb-0">
                    <h4 className="font-bold text-sm text-gray-700 mb-2">{grado}° Grado</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {gruposPorGrado[grado].map(grupo => (
                            <label
                                key={grupo.id}
                                className={`flex items-center p-2 rounded border cursor-pointer transition-colors ${seleccionados.includes(grupo.id)
                                        ? 'bg-blue-50 border-blue-500'
                                        : 'bg-white border-gray-200 hover:bg-gray-100'
                                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={seleccionados.includes(grupo.id)}
                                    onChange={() => toggleGrupo(grupo.id)}
                                    disabled={disabled}
                                    className="mr-2 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm">
                                    {grupo.seccion} - {grupo.turno ? grupo.turno.charAt(0).toUpperCase() + grupo.turno.slice(1) : ''}
                                    {grupo.maestro_id && !seleccionados.includes(grupo.id) && (
                                        <span className="text-xs text-gray-500 ml-1">(Ocupado)</span>
                                    )}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            {grupos.length === 0 && (
                <p className="text-sm text-gray-500 text-center">No hay grupos disponibles</p>
            )}
        </div>
    )
}

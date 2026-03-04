import { useState, useEffect } from 'react'
import { alumnosService } from '../services/alumnos.service'
import { gruposService } from '../services/grupos.service'
import { tareasService } from '../services/tareas.service'

export default function Tareas() {
  const [grupos, setGrupos] = useState([])
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('')
  const [alumnos, setAlumnos] = useState([])
  const [nombreTarea, setNombreTarea] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaEntrega, setFechaEntrega] = useState(new Date().toISOString().split('T')[0])
  const [tareasEntregadas, setTareasEntregadas] = useState({})
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mostrarFormulario, setMostrarFormulario] = useState(true)

  useEffect(() => {
    cargarGrupos()
  }, [])

  useEffect(() => {
    if (grupoSeleccionado) {
      cargarAlumnos()
    }
  }, [grupoSeleccionado])

  const cargarGrupos = async () => {
    try {
      const response = await gruposService.obtenerTodos()
      setGrupos(response.data)
      if (response.data.length > 0) {
        setGrupoSeleccionado(response.data[0].id)
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error)
      alert('Error al cargar grupos.')
    } finally {
      setLoading(false)
    }
  }

  const cargarAlumnos = async () => {
    try {
      const response = await alumnosService.getAll()
      // El backend retorna { success, data: { data: [...], pagination: {...} } }
      const todosLosAlumnos = response.data.data || response.data || []
      const alumnosDelGrupo = todosLosAlumnos.filter(a => a.grupo_id == grupoSeleccionado)
      setAlumnos(alumnosDelGrupo)
      // Inicializar todos como "entregaron" por defecto
      const tareasIniciales = {}
      alumnosDelGrupo.forEach(alumno => {
        tareasIniciales[alumno.id] = true
      })
      setTareasEntregadas(tareasIniciales)
    } catch (error) {
      console.error('Error al cargar alumnos:', error)
      setAlumnos([])
    }
  }

  const toggleTarea = (alumnoId) => {
    setTareasEntregadas({
      ...tareasEntregadas,
      [alumnoId]: !tareasEntregadas[alumnoId]
    })
  }

  const contarEntregadas = () => {
    return Object.values(tareasEntregadas).filter(t => t).length
  }

  const contarPendientes = () => {
    return Object.values(tareasEntregadas).filter(t => !t).length
  }

  const handleGuardar = async () => {
    if (!nombreTarea.trim()) {
      alert('⚠️ Por favor escribe el nombre de la tarea')
      return
    }

    setGuardando(true)
    try {
      // 1. Crear la tarea
      const tareaResponse = await tareasService.crear({
        grupo_id: grupoSeleccionado,
        titulo: nombreTarea,
        descripcion: descripcion || null,
        fecha_asignacion: new Date().toISOString().split('T')[0],
        fecha_entrega: fechaEntrega
      })

      const tareaId = tareaResponse.data?.data?.tarea_id || tareaResponse.data?.tarea_id

      // 2. Registrar entregas
      const entregasArray = alumnos.map(alumno => ({
        alumno_id: alumno.id,
        entregada: tareasEntregadas[alumno.id] === true
      }))

      await tareasService.registrarEntregas({
        tarea_id: tareaId,
        entregas: entregasArray
      })

      alert(`✅ Tarea "${nombreTarea}" guardada correctamente`)

      // Limpiar formulario
      setNombreTarea('')
      setDescripcion('')
      setFechaEntrega(new Date().toISOString().split('T')[0])
      const tareasIniciales = {}
      alumnos.forEach(alumno => {
        tareasIniciales[alumno.id] = true
      })
      setTareasEntregadas(tareasIniciales)
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('❌ Error al guardar: ' + (error.response?.data?.error || error.message))
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">📝 Control de Tareas</h1>

      {/* Formulario de tarea */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="w-full flex items-center justify-between text-left font-semibold text-lg mb-4"
        >
          <span>📋 Información de la Tarea</span>
          <span className="text-2xl">{mostrarFormulario ? '▼' : '▶'}</span>
        </button>

        {mostrarFormulario && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Grupo</label>
              <select
                value={grupoSeleccionado}
                onChange={(e) => setGrupoSeleccionado(e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {grupos.map(grupo => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.grado}° {grupo.seccion} - {grupo.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la Tarea
              </label>
              <input
                type="text"
                value={nombreTarea}
                onChange={(e) => setNombreTarea(e.target.value)}
                placeholder="Ej: Maqueta del Volcán, Ejercicios pág. 45..."
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detalles adicionales..."
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows="2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de Entrega
              </label>
              <input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                className="w-full md:w-auto px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600">{contarEntregadas()}</div>
            <div className="text-sm text-gray-600">✅ Entregaron</div>
          </div>
          <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-orange-600">{contarPendientes()}</div>
            <div className="text-sm text-gray-600">⚠️ No entregaron</div>
          </div>
        </div>
      </div>

      {/* Lista de alumnos */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <p className="text-sm text-gray-600 mb-4">
          💡 Toca a un alumno que NO entregó. Por defecto todos entregaron.
        </p>

        <div className="space-y-2">
          {alumnos.map((alumno) => (
            <button
              key={alumno.id}
              onClick={() => toggleTarea(alumno.id)}
              className={`w-full p-4 rounded-lg font-semibold text-left transition-all transform active:scale-95 ${tareasEntregadas[alumno.id]
                ? 'bg-green-100 border-2 border-green-500 text-green-800'
                : 'bg-orange-100 border-2 border-orange-500 text-orange-800'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">
                    {tareasEntregadas[alumno.id] ? '✅' : '⚠️'}
                  </div>
                  <div>
                    <div className="text-lg">{alumno.nombre} {alumno.apellidos}</div>
                    <div className="text-sm opacity-75">{alumno.grado}° "{alumno.grupo}"</div>
                  </div>
                </div>
                <div className="text-sm font-bold">
                  {tareasEntregadas[alumno.id] ? 'ENTREGÓ' : 'NO ENTREGÓ'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Botón de guardar fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 md:relative md:bg-transparent md:border-0">
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transition-all ${guardando
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 active:scale-95'
            }`}
        >
          {guardando ? '⏳ Guardando...' : '💾 Guardar Tarea'}
        </button>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { alumnosService } from '../services/alumnos.service'
import { gruposService } from '../services/grupos.service'
import { tareasService } from '../services/tareas.service'
import { useAuth } from '../context/AuthContext'

export default function Tareas() {
  const { usuario } = useAuth()
  const esDirector = usuario?.rol === 'director'
  const [grupos, setGrupos] = useState([])
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('')
  const [alumnos, setAlumnos] = useState([])
  const [nombreTarea, setNombreTarea] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaEntrega, setFechaEntrega] = useState(new Date().toISOString().split('T')[0])
  const [tareasEntregadas, setTareasEntregadas] = useState({})
  const [tareasExistentes, setTareasExistentes] = useState([])
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargarGrupos() }, [])

  useEffect(() => {
    if (grupoSeleccionado) cargarDatos()
  }, [grupoSeleccionado])

  const cargarGrupos = async () => {
    try {
      const response = await gruposService.obtenerTodos()
      const data = response.data?.data || response.data || []
      const lista = Array.isArray(data) ? data : []
      setGrupos(lista)
      if (lista.length > 0) setGrupoSeleccionado(String(lista[0].id))
    } catch (error) {
      console.error('Error al cargar grupos:', error)
      setGrupos([])
    } finally {
      setLoading(false)
    }
  }

  const cargarDatos = async () => {
    if (!grupoSeleccionado) return
    setLoading(true)
    try {
      // Cargar alumnos y tareas existentes simultáneamente
      const [resAlumnos, resTareas] = await Promise.all([
        alumnosService.getByGrupo(grupoSeleccionado).catch(() => ({ data: [] })),
        tareasService.obtenerPorGrupo(grupoSeleccionado).catch(() => ({ data: [] }))
      ])

      const rawAlumnos = resAlumnos.data?.data || resAlumnos.data || []
      const lista = Array.isArray(rawAlumnos) ? rawAlumnos : []
      setAlumnos(lista)
      
      const iniciales = {}
      lista.forEach(a => { iniciales[a.id] = true })
      setTareasEntregadas(iniciales)

      // Procesar tareas existentes
      const tareasData = resTareas.data?.data || resTareas.data || []
      setTareasExistentes(Array.isArray(tareasData) ? tareasData : [])
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setAlumnos([])
      setTareasExistentes([])
    } finally {
      setLoading(false)
    }
  }

  const toggleTarea = (alumnoId) => {
    if (esDirector) return
    setTareasEntregadas(prev => ({ ...prev, [alumnoId]: !prev[alumnoId] }))
  }

  const contarEntregadas = () => Object.values(tareasEntregadas).filter(Boolean).length
  const contarPendientes = () => Object.values(tareasEntregadas).filter(t => !t).length

  const handleGuardar = async () => {
    if (esDirector) return
    if (!nombreTarea.trim()) return alert('Por favor escribe el nombre de la tarea')
    if (alumnos.length === 0) return alert('No hay alumnos en este grupo')
    setGuardando(true)
    try {
      const tareaResponse = await tareasService.crear({
        grupo_id: parseInt(grupoSeleccionado),
        titulo: nombreTarea,
        descripcion: descripcion || null,
        fecha_asignacion: new Date().toISOString().split('T')[0],
        fecha_entrega: fechaEntrega
      })
      const tareaId = tareaResponse.data?.data?.tarea_id || tareaResponse.data?.tarea_id
      if (!tareaId) { alert('❌ Error: No se pudo obtener el ID de la tarea'); setGuardando(false); return }

      await tareasService.registrarEntregas({
        tarea_id: tareaId,
        entregas: alumnos.map(a => ({ alumno_id: a.id, entregada: tareasEntregadas[a.id] === true }))
      })
      alert(`✅ Tarea "${nombreTarea}" guardada correctamente`)
      setNombreTarea(''); setDescripcion(''); setFechaEntrega(new Date().toISOString().split('T')[0])
      const reset = {}; alumnos.forEach(a => { reset[a.id] = true }); setTareasEntregadas(reset)
      cargarDatos()
    } catch (error) {
      alert('❌ Error al guardar: ' + (error.response?.data?.message || error.message))
    } finally {
      setGuardando(false)
    }
  }

  if (loading && alumnos.length === 0 && tareasExistentes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">📝 Control de Tareas</h1>

      {esDirector && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700 font-medium">
          👁️ Vista de supervisión — Solo lectura
        </div>
      )}

      {/* Selector de grupo (siempre visible) */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Grupo</label>
        <select value={grupoSeleccionado} onChange={e => setGrupoSeleccionado(e.target.value)}
          className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
          {grupos.map(g => (
            <option key={g.id} value={String(g.id)}>{g.grado}° {g.seccion} - {g.nombre}</option>
          ))}
        </select>
      </div>

      {/* Botón Historial de Tareas */}
      {tareasExistentes.length > 0 && (
        <button
          onClick={() => setMostrarHistorial(true)}
          className="w-full bg-white border-2 border-purple-100 shadow-sm rounded-lg p-4 mb-4 flex items-center justify-between text-left hover:bg-purple-50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xl group-hover:bg-purple-200 transition-colors">
              📋
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-800 group-hover:text-purple-700 transition-colors">Historial de Tareas</h2>
              <p className="text-sm text-gray-500">Ver {tareasExistentes.length} tareas registradas anteriormente</p>
            </div>
          </div>
          <span className="text-purple-400 group-hover:text-purple-600 font-bold px-3 py-1 bg-purple-50 rounded-full">Abrir</span>
        </button>
      )}

      {/* Modal de Historial */}
      {mostrarHistorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <h2 className="font-bold text-xl text-gray-800">Historial de Tareas</h2>
              </div>
              <button 
                onClick={() => setMostrarHistorial(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-red-100 hover:text-red-600 transition-colors"
                title="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-gray-50">
               {tareasExistentes.map(t => {
                const pct = t.total_alumnos > 0 ? Math.round((t.total_entregadas / t.total_alumnos) * 100) : 0
                const fechaStr = t.fecha_entrega
                  ? (() => { try { const d = new Date(t.fecha_entrega + 'T12:00:00'); return isNaN(d) ? '' : d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) } catch { return '' } })()
                  : ''
                return (
                  <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-purple-200 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-gray-800 text-base md:text-lg block truncate">{t.titulo}</span>
                        {t.descripcion && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{t.descripcion}</p>}
                        {fechaStr && <p className="text-xs text-purple-600 font-medium mt-2">📅 Para el {fechaStr}</p>}
                      </div>
                      <div className="flex flex-col items-end shrink-0 bg-gray-50 p-3 rounded-lg border border-gray-100 w-full md:w-auto">
                        <span className={`text-sm font-bold mb-2 ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {t.total_entregadas || 0} / {t.total_alumnos || 0} entregaron
                        </span>
                        <div className="w-full md:w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-2.5 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="p-4 border-t border-gray-100 bg-white">
              <button 
                onClick={() => setMostrarHistorial(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario solo para maestros */}
      {!esDirector && (
        <>
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <h2 className="font-bold text-lg text-gray-800 mb-4">📋 Nueva Tarea</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Tarea</label>
                <input type="text" value={nombreTarea} onChange={e => setNombreTarea(e.target.value)}
                  placeholder="Ej: Maqueta del Volcán, Ejercicios pág. 45..."
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción (opcional)</label>
                <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
                  placeholder="Detalles adicionales..." rows="2"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Entrega</label>
                <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)}
                  className="w-full md:w-auto px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">{contarEntregadas()}</div>
                <div className="text-sm text-gray-600">✅ Entregaron</div>
              </div>
              <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4">
                <div className="text-3xl font-bold text-orange-600">{contarPendientes()}</div>
                <div className="text-sm text-gray-600">⚠️ No entregaron</div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              💡 Toca a un alumno que NO entregó. Por defecto todos entregaron.
            </p>

            {alumnos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p className="font-semibold">No hay alumnos en este grupo</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alumnos.map(alumno => (
                  <button key={alumno.id} onClick={() => toggleTarea(alumno.id)}
                    className={`w-full p-4 rounded-lg font-semibold text-left transition-all transform active:scale-95 ${
                      tareasEntregadas[alumno.id]
                        ? 'bg-green-100 border-2 border-green-500 text-green-800'
                        : 'bg-orange-100 border-2 border-orange-500 text-orange-800'
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{tareasEntregadas[alumno.id] ? '✅' : '⚠️'}</div>
                        <div className="text-lg">{alumno.nombre} {alumno.apellidos}</div>
                      </div>
                      <div className="text-sm font-bold">
                        {tareasEntregadas[alumno.id] ? 'ENTREGÓ' : 'NO ENTREGÓ'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {alumnos.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 md:relative md:bg-transparent md:border-0">
              <button onClick={handleGuardar} disabled={guardando}
                className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transition-all ${guardando
                  ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 active:scale-95'}`}>
                {guardando ? '⏳ Guardando...' : '💾 Guardar Tarea'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

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

      {/* Tareas existentes - colapsado por defecto */}
      {tareasExistentes.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <button
            onClick={() => setMostrarHistorial(prev => !prev)}
            className="w-full flex items-center justify-between"
          >
            <span className="font-bold text-lg text-gray-800">📋 Tareas registradas</span>
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                {tareasExistentes.length} tareas
              </span>
              <span className="text-gray-400 text-lg">{mostrarHistorial ? '▲' : '▼'}</span>
            </div>
          </button>

          {mostrarHistorial && (
            <div className="mt-3 space-y-1 border-t pt-3">
              {tareasExistentes.map(t => {
                const pct = t.total_alumnos > 0 ? Math.round((t.total_entregadas / t.total_alumnos) * 100) : 0
                const fechaStr = t.fecha_entrega
                  ? (() => { try { const d = new Date(t.fecha_entrega + 'T12:00:00'); return isNaN(d) ? '' : d.toLocaleDateString('es-MX') } catch { return '' } })()
                  : ''
                return (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-gray-800 text-sm truncate block">{t.titulo}</span>
                      {fechaStr && <span className="text-xs text-gray-400">Entrega: {fechaStr}</span>}
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-1.5 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs font-bold w-16 text-right ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {t.total_entregadas || 0}/{t.total_alumnos || 0}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
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

import { useState, useEffect } from 'react'
import { reportesService } from '../services/reportes.service'
import { gruposService } from '../services/grupos.service'
import { useAuth } from '../context/AuthContext'

export default function Reportes() {
  const { usuario } = useAuth()
  const [grupos, setGrupos] = useState([])
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('')
  const [reportes, setReportes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generando, setGenerando] = useState(false)

  useEffect(() => {
    cargarGrupos()
    cargarReportes()
  }, [])

  const cargarGrupos = async () => {
    try {
      const response = await gruposService.obtenerTodos()
      const data = response.data?.data || response.data || []
      setGrupos(data)
      if (data.length > 0) {
        setGrupoSeleccionado(data[0].id)
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error)
    }
  }

  const cargarReportes = async () => {
    try {
      setLoading(true)
      const response = await reportesService.getAll()
      setReportes(response.data.data || response.data || [])
    } catch (error) {
      console.error('Error al cargar reportes:', error)
      setReportes([])
    } finally {
      setLoading(false)
    }
  }

  const generarReportesSemanales = async () => {
    if (!grupoSeleccionado) {
      alert('⚠️ Selecciona un grupo primero')
      return
    }

    if (!confirm('¿Generar reportes semanales para todo el grupo? Los datos quedarán disponibles para consulta de los padres vía QR.')) {
      return
    }

    setGenerando(true)
    try {
      const response = await reportesService.generar({ grupo_id: grupoSeleccionado })
      const resultado = response.data.data || response.data || {}

      alert(`✅ Reportes generados:\n\n` +
        `📊 Total: ${resultado.reportesGenerados || 0}\n\n` +
        `Los padres pueden consultar los reportes escaneando el código QR de cada alumno.`)

      cargarReportes()
    } catch (error) {
      console.error('Error al generar reportes:', error)
      alert('❌ Error al generar reportes: ' + (error.response?.data?.error || error.message))
    } finally {
      setGenerando(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este reporte?')) {
      try {
        await reportesService.delete(id)
        setReportes(reportes.filter(r => r.id !== id))
      } catch (error) {
        console.error('Error al eliminar reporte:', error)
        alert('Error al eliminar.')
      }
    }
  }

  const getConductaResumen = (reporte) => {
    const verde = reporte.conducta_verde || 0
    const amarillo = reporte.conducta_amarillo || 0
    const rojo = reporte.conducta_rojo || 0

    if (verde >= 4) return { color: 'bg-green-100 text-green-800', label: 'Excelente' }
    if (rojo >= 2) return { color: 'bg-red-100 text-red-800', label: 'Necesita mejorar' }
    if (amarillo >= 2) return { color: 'bg-yellow-100 text-yellow-800', label: 'Regular' }
    return { color: 'bg-blue-100 text-blue-800', label: 'Buena' }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">📊 Reportes Semanales</h1>

        {/* Panel de generación */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">✨ Generar Reportes de la Semana</h2>
          <p className="text-gray-700 mb-4">
            Genera automáticamente los reportes semanales consolidando asistencias, tareas y conducta.
            Los padres podrán consultar los reportes escaneando el código QR de cada alumno.
          </p>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccionar Grupo</label>
              <select
                value={grupoSeleccionado}
                onChange={(e) => setGrupoSeleccionado(e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {grupos.map(grupo => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.grado}° {grupo.seccion} - {grupo.nombre}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={generarReportesSemanales}
              disabled={generando || !grupoSeleccionado}
              className={`px-6 py-3 rounded-lg font-bold text-white text-lg shadow-lg transition-all ${generando || !grupoSeleccionado
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:scale-95'
                }`}
            >
              {generando ? '⏳ Generando...' : '📊 Generar Reportes'}
            </button>
          </div>
        </div>

        <h2 className="text-lg font-bold text-gray-700 mb-3">Historial de Reportes</h2>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500 text-sm">Cargando reportes...</p>
        </div>
      ) : reportes.length === 0 ? (
        <div className="text-center py-14 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-600 font-semibold">No hay reportes generados</p>
          <p className="text-sm text-gray-400 mt-1">Selecciona un grupo arriba y genera los reportes de la semana</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reportes.map((reporte) => {
            const totalDias = (reporte.total_asistencias || 0) + (reporte.total_faltas || 0)
            const pctAsistencia = totalDias > 0 ? Math.round((reporte.total_asistencias / totalDias) * 100) : 0
            const pctTareas = reporte.total_tareas > 0 ? Math.round((reporte.tareas_entregadas / reporte.total_tareas) * 100) : 0
            const conductaInfo = getConductaResumen(reporte)

            const colorAsist = pctAsistencia >= 90 ? 'bg-emerald-500' : pctAsistencia >= 70 ? 'bg-amber-400' : 'bg-red-400'
            const colorTarea = pctTareas >= 80 ? 'bg-violet-500' : pctTareas >= 50 ? 'bg-amber-400' : 'bg-red-400'

            return (
              <div key={reporte.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">

                {/* Encabezado */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">
                        {reporte.alumno_nombre}
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {reporte.grado}° Grado &nbsp;·&nbsp; {reporte.grupo_nombre}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${conductaInfo.color}`}>
                      {conductaInfo.label}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    📅 {new Date(reporte.fecha_inicio).toLocaleDateString('es-MX')} — {new Date(reporte.fecha_fin).toLocaleDateString('es-MX')}
                  </p>
                </div>

                {/* Cuerpo */}
                <div className="px-5 py-4 flex-1 space-y-4">
                  {/* Asistencia */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">✅ Asistencia</span>
                      <span className={`text-sm font-bold ${pctAsistencia >= 90 ? 'text-emerald-600' : pctAsistencia >= 70 ? 'text-amber-500' : 'text-red-500'}`}>
                        {pctAsistencia}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${colorAsist} transition-all`} style={{ width: `${pctAsistencia}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {reporte.total_asistencias} asist. · {reporte.total_faltas} faltas · {reporte.total_retardos || 0} retardos
                    </p>
                  </div>

                  {/* Tareas */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">📝 Tareas</span>
                      <span className={`text-sm font-bold ${pctTareas >= 80 ? 'text-violet-600' : pctTareas >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                        {reporte.tareas_entregadas}/{reporte.total_tareas}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full ${colorTarea} transition-all`} style={{ width: `${pctTareas}%` }} />
                    </div>
                  </div>

                  {/* Conducta semáforo */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">🚦 Conducta</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      🟢 {reporte.conducta_verde}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      🟡 {reporte.conducta_amarillo}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      🔴 {reporte.conducta_rojo}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t flex items-center justify-between bg-gray-50 border-gray-100">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    📊 Disponible para consulta QR
                  </span>
                  {usuario?.rol === 'director' && (
                    <button onClick={() => handleDelete(reporte.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-medium transition">
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

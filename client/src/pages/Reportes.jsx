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
      if (data.length > 0) setGrupoSeleccionado(data[0].id)
    } catch (error) {
      console.error('Error al cargar grupos:', error)
    }
  }

  const cargarReportes = async () => {
    try {
      setLoading(true)
      const response = await reportesService.getAll()
      setReportes(response.data?.data || response.data || [])
    } catch (error) {
      console.error('Error al cargar reportes:', error)
      setReportes([])
    } finally {
      setLoading(false)
    }
  }

  const generarReportesSemanales = async () => {
    if (!grupoSeleccionado) return alert('Selecciona un grupo primero')
    if (!confirm('¿Generar reportes semanales para todo el grupo?')) return

    setGenerando(true)
    try {
      const response = await reportesService.generar({ grupo_id: grupoSeleccionado })
      const resultado = response.data?.data || response.data || {}
      alert(`✅ Reportes generados: ${resultado.reportesGenerados || 0} alumnos`)
      cargarReportes()
    } catch (error) {
      alert('❌ Error: ' + (error.response?.data?.message || error.message))
    } finally {
      setGenerando(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este reporte?')) return
    try {
      await reportesService.delete(id)
      setReportes(prev => prev.filter(r => r.id !== id))
    } catch { alert('Error al eliminar.') }
  }

  const enviarWhatsApp = (reporte) => {
    if (!reporte.parent_telefono) {
      alert('Este alumno no tiene teléfono de tutor registrado.')
      return
    }
    const tel = reporte.parent_telefono.replace(/\D/g, '')
    const telCompleto = tel.length === 10 ? `52${tel}` : tel
    const url = `${window.location.origin}/reporte/${reporte.qr_token}`
    const pctAsist = ((reporte.total_asistencias || 0) + (reporte.total_faltas || 0)) > 0
      ? Math.round((reporte.total_asistencias / ((reporte.total_asistencias || 0) + (reporte.total_faltas || 0))) * 100) : 0

    const mensaje = `📊 *Reporte Semanal*\n\n` +
      `👤 *${reporte.alumno_nombre}*\n` +
      `📅 ${new Date(reporte.fecha_inicio).toLocaleDateString('es-MX')} - ${new Date(reporte.fecha_fin).toLocaleDateString('es-MX')}\n\n` +
      `✅ Asistencia: ${pctAsist}%\n` +
      `📝 Tareas: ${reporte.tareas_entregadas}/${reporte.total_tareas}\n` +
      `🟢${reporte.conducta_verde} 🟡${reporte.conducta_amarillo} 🔴${reporte.conducta_rojo}\n\n` +
      `📱 Ver reporte completo:\n${url}`

    window.open(`https://wa.me/${telCompleto}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  const getConductaResumen = (r) => {
    if ((r.conducta_rojo || 0) >= 2) return { color: 'bg-red-100 text-red-800', label: 'Necesita mejorar' }
    if ((r.conducta_amarillo || 0) >= 2) return { color: 'bg-yellow-100 text-yellow-800', label: 'Regular' }
    if ((r.conducta_verde || 0) >= 4) return { color: 'bg-green-100 text-green-800', label: 'Excelente' }
    return { color: 'bg-blue-100 text-blue-800', label: 'Buena' }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">📊 Reportes Semanales</h1>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">✨ Generar Reportes de la Semana</h2>
          <p className="text-gray-700 mb-4">
            Genera los reportes consolidando asistencias, tareas y conducta. Los padres los verán al escanear el QR.
          </p>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Seleccionar Grupo</label>
              <select value={grupoSeleccionado} onChange={e => setGrupoSeleccionado(e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                {grupos.map(g => (
                  <option key={g.id} value={g.id}>{g.grado}° {g.seccion} - {g.nombre}</option>
                ))}
              </select>
            </div>
            <button onClick={generarReportesSemanales} disabled={generando || !grupoSeleccionado}
              className={`px-6 py-3 rounded-lg font-bold text-white text-lg shadow-lg transition-all ${generando || !grupoSeleccionado ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 active:scale-95'
                }`}>
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
          {reportes.map(reporte => {
            const totalDias = (reporte.total_asistencias || 0) + (reporte.total_faltas || 0)
            const pctAsistencia = totalDias > 0 ? Math.round((reporte.total_asistencias / totalDias) * 100) : 0
            const pctTareas = reporte.total_tareas > 0 ? Math.round((reporte.tareas_entregadas / reporte.total_tareas) * 100) : 0
            const conductaInfo = getConductaResumen(reporte)
            const colorAsist = pctAsistencia >= 90 ? 'bg-emerald-500' : pctAsistencia >= 70 ? 'bg-amber-400' : 'bg-red-400'
            const colorTarea = pctTareas >= 80 ? 'bg-violet-500' : pctTareas >= 50 ? 'bg-amber-400' : 'bg-red-400'

            return (
              <div key={reporte.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-5 py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{reporte.alumno_nombre}</h3>
                      <p className="text-slate-400 text-xs mt-0.5">{reporte.grado}° Grado · {reporte.grupo_nombre}</p>
                    </div>
                    <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${conductaInfo.color}`}>
                      {conductaInfo.label}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    📅 {new Date(reporte.fecha_inicio).toLocaleDateString('es-MX')} — {new Date(reporte.fecha_fin).toLocaleDateString('es-MX')}
                  </p>
                </div>

                {/* Body */}
                <div className="px-5 py-4 flex-1 space-y-4">
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

                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2.5">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">🚦</span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">🟢 {reporte.conducta_verde}</span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">🟡 {reporte.conducta_amarillo}</span>
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">🔴 {reporte.conducta_rojo}</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t flex items-center justify-between bg-gray-50 border-gray-100">
                  {reporte.parent_telefono && reporte.qr_token ? (
                    <button onClick={() => enviarWhatsApp(reporte)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 transition">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.243-1.212l-.252-.149-2.868.852.852-2.868-.168-.268A8 8 0 1112 20z" />
                      </svg>
                      WhatsApp
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">Sin teléfono</span>
                  )}
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

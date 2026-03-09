import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardService } from '../services/dashboard.service'

export default function Home() {
  const { usuario } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargarDashboard() }, [])

  const cargarDashboard = async () => {
    try {
      const response = await dashboardService.getResumen()
      setData(response.data?.data || response.data || null)
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const hoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const acciones = [
    { to: '/asistencia', icon: '📋', label: 'Asistencia', desc: 'Registrar asistencia del día', color: 'emerald' },
    { to: '/tareas', icon: '📝', label: 'Tareas', desc: 'Registrar tareas', color: 'violet' },
    { to: '/conducta', icon: '🚦', label: 'Conducta', desc: 'Semáforo de conducta', color: 'amber' },
    { to: '/reportes', icon: '📊', label: 'Reportes', desc: 'Generar y enviar reportes', color: 'sky' },
    { to: '/alumnos', icon: '👥', label: 'Alumnos', desc: 'Gestionar alumnos', color: 'rose' },
  ]

  if (usuario?.rol === 'director') {
    acciones.push(
      { to: '/grupos', icon: '🏫', label: 'Grupos', desc: 'Administrar grupos', color: 'indigo' },
      { to: '/usuarios', icon: '👤', label: 'Usuarios', desc: 'Gestionar maestros', color: 'gray' },
      { to: '/rezago', icon: '⚠️', label: 'Rezago', desc: 'Detección de rezago', color: 'orange' },
    )
  }

  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    violet: 'bg-violet-50 border-violet-200 hover:border-violet-400',
    amber: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    sky: 'bg-sky-50 border-sky-200 hover:border-sky-400',
    rose: 'bg-rose-50 border-rose-200 hover:border-rose-400',
    indigo: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    gray: 'bg-gray-50 border-gray-200 hover:border-gray-400',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {getGreeting()}, {usuario?.nombre || 'Maestro'} 👋
        </h1>
        <p className="text-gray-500 capitalize">{hoy}</p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Alumnos */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">👥</div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Alumnos</span>
            </div>
            <div className="text-3xl font-bold text-gray-800">{data.total_alumnos}</div>
            <p className="text-xs text-gray-400 mt-1">activos en tu{usuario?.rol === 'director' ? ' escuela' : 's grupos'}</p>
          </div>

          {/* Asistencia hoy */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">📋</div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Asistencia hoy</span>
            </div>
            {data.asistencia_hoy.registrados > 0 ? (
              <>
                <div className="text-3xl font-bold text-emerald-600">{data.asistencia_hoy.presentes}</div>
                <p className="text-xs text-gray-400 mt-1">
                  <span className="text-red-500 font-semibold">{data.asistencia_hoy.faltas}</span> faltas · <span className="text-yellow-500 font-semibold">{data.asistencia_hoy.retardos}</span> retardos
                </p>
              </>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-300">—</div>
                <p className="text-xs text-orange-500 font-semibold mt-1">Sin registrar hoy</p>
              </>
            )}
          </div>

          {/* Tareas semana */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">📝</div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tareas semana</span>
            </div>
            <div className="text-3xl font-bold text-violet-600">{data.tareas_semana.entregadas || 0}</div>
            <p className="text-xs text-gray-400 mt-1">
              de {data.tareas_semana.total_entregas || 0} entregas registradas
            </p>
          </div>

          {/* Reportes */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl">📊</div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reportes</span>
            </div>
            <div className="text-3xl font-bold text-sky-600">{data.reportes.total}</div>
            <p className="text-xs text-gray-400 mt-1">
              {data.reportes.ultimo ? `Último: ${new Date(data.reportes.ultimo).toLocaleDateString('es-MX')}` : 'Sin generar aún'}
            </p>
          </div>
        </div>
      ) : null}

      {/* Alertas conducta roja */}
      {data?.conducta_roja_hoy?.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
            <span className="text-lg">🔴</span> Alertas de conducta hoy
          </h3>
          <div className="space-y-2">
            {data.conducta_roja_hoy.map((a, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-red-100">
                <div>
                  <span className="font-semibold text-gray-800">{a.nombre} {a.apellidos}</span>
                  <span className="text-xs text-gray-400 ml-2">{a.grado}° {a.seccion}</span>
                </div>
                {a.observaciones && (
                  <span className="text-xs text-red-600 italic max-w-[200px] truncate">"{a.observaciones}"</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Accesos rápidos */}
      <h2 className="text-lg font-bold text-gray-700 mb-3">Accesos rápidos</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {acciones.map(a => (
          <Link key={a.to} to={a.to}
            className={`${colorMap[a.color]} border-2 rounded-xl p-5 transition-all hover:shadow-md group`}>
            <div className="text-3xl mb-2">{a.icon}</div>
            <h3 className="font-bold text-gray-800">{a.label}</h3>
            <p className="text-xs text-gray-500 mt-1">{a.desc}</p>
          </Link>
        ))}
      </div>

      {/* Auto-reportes info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl">⏰</span>
        <div>
          <p className="text-sm font-semibold text-blue-800">Reportes automáticos activados</p>
          <p className="text-xs text-blue-600">Los reportes semanales se generan automáticamente cada viernes a las 6:00 PM</p>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

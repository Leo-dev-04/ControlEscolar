import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const { usuario } = useAuth()

  const hoy = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-800 rounded-2xl p-7 md:p-8">
        {/* Decoración sutil */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1 capitalize">{hoy}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {saludo}, <span className="text-indigo-400">{usuario?.nombre || 'Maestr@'}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-md">
              Captura rápido, informa automático. Tu asistente para mantener a los padres al día.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-3.5 py-2 rounded-full">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            En línea
          </div>
        </div>
      </div>

      {/* ── Acciones principales ────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ActionCard
          to="/asistencia"
          label="Asistencia Diaria"
          desc="Tomar lista del día"
          icon={<ClipboardCheckIcon />}
          color="emerald"
        />
        <ActionCard
          to="/tareas"
          label="Control de Tareas"
          desc="Registrar entregas"
          icon={<PencilIcon />}
          color="violet"
        />
        <ActionCard
          to="/conducta"
          label="Semáforo Conducta"
          desc="Evaluar comportamiento"
          icon={<LightBulbIcon />}
          color="amber"
        />
      </div>

      {/* ── Accesos rápidos + Flujo ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Accesos rápidos — ocupa 2 columnas */}
        <div className="lg:col-span-2 space-y-4">
          <Link to="/reportes"
            className="group flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4
              hover:border-indigo-200 hover:shadow-md transition-all duration-200">
            <div className="w-10 h-10 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600 flex-shrink-0
              group-hover:bg-sky-100 transition-colors">
              <ChartIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-800 text-sm">Reportes</p>
              <p className="text-gray-400 text-xs">Consultar y enviar a padres</p>
            </div>
            <ChevronIcon />
          </Link>

          <Link to="/alumnos"
            className="group flex items-center gap-4 bg-white border border-gray-200 rounded-xl px-5 py-4
              hover:border-indigo-200 hover:shadow-md transition-all duration-200">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0
              group-hover:bg-rose-100 transition-colors">
              <UsersIcon />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-800 text-sm">Alumnos</p>
              <p className="text-gray-400 text-xs">Administrar estudiantes</p>
            </div>
            <ChevronIcon />
          </Link>
        </div>

        {/* Flujo semanal — ocupa 3 columnas */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Flujo semanal</p>

          <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-0">
            <Step
              num="1"
              title="Lun – Vie"
              desc="Captura asistencia, tareas y conducta desde tu celular"
              gradient="from-indigo-500 to-blue-600"
            />
            <Connector />
            <Step
              num="2"
              title="Viernes 6 PM"
              desc="El sistema genera y envía reportes a los padres"
              gradient="from-emerald-500 to-teal-600"
            />
            <Connector />
            <Step
              num="3"
              title="Fin de semana"
              desc="Padres informados, tú descansas. Cero WhatsApp"
              gradient="from-violet-500 to-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Componentes internos ──────────────────────────────────── */

// Mapa de colores estáticos para que Tailwind JIT los detecte
const colorMap = {
  emerald: {
    bg: 'bg-emerald-50',
    bgHover: 'group-hover:bg-emerald-100',
    text: 'text-emerald-600',
    border: 'hover:border-emerald-200',
    bar: 'bg-emerald-500',
  },
  violet: {
    bg: 'bg-violet-50',
    bgHover: 'group-hover:bg-violet-100',
    text: 'text-violet-600',
    border: 'hover:border-violet-200',
    bar: 'bg-violet-500',
  },
  amber: {
    bg: 'bg-amber-50',
    bgHover: 'group-hover:bg-amber-100',
    text: 'text-amber-600',
    border: 'hover:border-amber-200',
    bar: 'bg-amber-500',
  },
}

function ActionCard({ to, label, desc, icon, color }) {
  const c = colorMap[color]
  return (
    <Link to={to}
      className={`group relative bg-white border border-gray-200 rounded-xl p-5
        ${c.border} hover:shadow-md transition-all duration-200 overflow-hidden`}>
      <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center
        ${c.text} ${c.bgHover} transition-colors mb-3`}>
        {icon}
      </div>
      <p className="font-semibold text-gray-800">{label}</p>
      <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
      <div className={`absolute top-0 left-0 w-full h-0.5 ${c.bar}
        scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
    </Link>
  )
}

function Step({ num, title, desc, gradient }) {
  return (
    <div className="flex sm:flex-col sm:items-center sm:text-center sm:flex-1 gap-3">
      <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} text-white
        flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-sm`}>
        {num}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function Connector() {
  return (
    <>
      <div className="hidden sm:flex items-center flex-shrink-0 px-2">
        <div className="w-8 border-t border-dashed border-gray-300" />
      </div>
      <div className="sm:hidden flex pl-4">
        <div className="h-3 border-l border-dashed border-gray-300" />
      </div>
    </>
  )
}

/* ── Iconos ─────────────────────────────────────────────────── */

function ClipboardCheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  )
}

function LightBulbIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

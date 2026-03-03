import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ModalCambiarPassword from './ModalCambiarPassword'

// ── Definición de links ────────────────────────────────────────────
const navSections = [
  {
    label: 'GENERAL',
    links: [
      { to: '/', label: 'Inicio', icon: HomeIcon, roles: ['director', 'maestro', 'admin'] },
      { to: '/asistencia', label: 'Asistencia', icon: CheckIcon, roles: ['director', 'maestro', 'admin'] },
      { to: '/tareas', label: 'Tareas', icon: ClipboardIcon, roles: ['director', 'maestro', 'admin'] },
      { to: '/conducta', label: 'Conducta', icon: LightIcon, roles: ['director', 'maestro', 'admin'] },
      { to: '/reportes', label: 'Reportes', icon: ChartIcon, roles: ['director', 'maestro', 'admin'] },
      { to: '/alumnos', label: 'Alumnos', icon: UsersIcon, roles: ['director', 'maestro', 'admin'] },
    ],
  },
  {
    label: 'ADMINISTRACIÓN',
    links: [
      { to: '/rezago', label: 'Rezago', icon: AlertIcon, roles: ['director'] },
      { to: '/grupos', label: 'Grupos', icon: FolderIcon, roles: ['director'] },
      { to: '/usuarios', label: 'Usuarios', icon: CogIcon, roles: ['director'] },
    ],
  },
]

export default function Layout({ children }) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [modalPassword, setModalPassword] = useState(false)
  const { usuario, logout } = useAuth()

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) logout()
  }

  const currentLabel = navSections
    .flatMap(s => s.links)
    .find(l => isActive(l.to))?.label ?? 'Inicio'

  // Sections filtered by role
  const filteredSections = navSections.map(sec => ({
    ...sec,
    links: sec.links.filter(l => l.roles.includes(usuario?.rol)),
  })).filter(sec => sec.links.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Mobile overlay ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* ══ SIDEBAR ════════════════════════════════════════════════════ */}
      <aside className={`
        fixed top-0 left-0 h-full z-30 flex flex-col
        bg-slate-900 shadow-2xl
        transition-all duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:z-auto
        ${collapsed ? 'md:w-[72px]' : 'md:w-64'}
        w-64
      `}>

        {/* Header del sidebar */}
        <div className={`flex items-center border-b border-slate-700/60 flex-shrink-0
                         ${collapsed ? 'justify-center px-0 py-5' : 'gap-3 px-5 py-5'}`}>
          <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
            <SchoolIcon />
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <p className="text-white font-bold text-sm tracking-tight">Control Escolar</p>
              <p className="text-slate-400 text-xs">Sistema de Gestión</p>
            </div>
          )}
        </div>

        {/* Perfil */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-slate-700/60 flex-shrink-0">
            <div className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                              flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
                {usuario?.nombre?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate leading-tight">{usuario?.nombre}</p>
                <p className="text-blue-300 text-xs capitalize mt-0.5">{usuario?.rol}</p>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed avatar */}
        {collapsed && (
          <div className="flex justify-center py-3 border-b border-slate-700/60 flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600
                            flex items-center justify-center text-white font-bold text-sm shadow"
              title={usuario?.nombre}>
              {usuario?.nombre?.[0]?.toUpperCase()}
            </div>
          </div>
        )}

        {/* Navegación */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
          {filteredSections.map((sec) => (
            <div key={sec.label}>
              {/* Label de sección */}
              {!collapsed && (
                <p className="text-slate-500 text-[10px] font-bold tracking-widest px-3 mb-1.5">
                  {sec.label}
                </p>
              )}
              {collapsed && (
                <div className="border-t border-slate-700/50 my-2" />
              )}
              <div className="space-y-0.5">
                {sec.links.map(({ to, label, icon: Icon }) => {
                  const active = isActive(to)
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileOpen(false)}
                      title={collapsed ? label : undefined}
                      className={`
                        relative flex items-center gap-3 rounded-lg text-sm font-medium
                        transition-all duration-150 group
                        ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'}
                        ${active
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
                      `}
                    >
                      {/* Borde izquierdo activo */}
                      {active && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5
                                         bg-blue-400 rounded-full"/>
                      )}
                      <Icon active={active} />
                      {!collapsed && <span>{label}</span>}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Acciones inferiores */}
        <div className={`border-t border-slate-700/60 flex-shrink-0 py-3
                         ${collapsed ? 'px-1.5 space-y-1' : 'px-3 space-y-1'}`}>
          {/* Toggle colapsar — solo desktop */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden md:flex items-center gap-3 w-full text-slate-400
                         hover:bg-slate-800 hover:text-slate-100 rounded-lg text-sm
                         font-medium transition-all py-2
                         ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            title={collapsed ? 'Expandir panel' : 'Colapsar panel'}
          >
            <CollapseIcon flipped={collapsed} />
            {!collapsed && <span>Colapsar</span>}
          </button>

          <button
            onClick={() => { setModalPassword(true); setMobileOpen(false) }}
            className={`flex items-center gap-3 w-full text-slate-400
                         hover:bg-slate-800 hover:text-slate-100 rounded-lg text-sm
                         font-medium transition-all py-2
                         ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            title={collapsed ? 'Cambiar Contraseña' : undefined}
          >
            <KeyIcon />
            {!collapsed && <span>Contraseña</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full text-red-400
                         hover:bg-red-500/10 hover:text-red-300 rounded-lg text-sm
                         font-medium transition-all py-2
                         ${collapsed ? 'justify-center px-0' : 'px-3'}`}
            title={collapsed ? 'Cerrar Sesión' : undefined}
          >
            <LogoutIcon />
            {!collapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* ══ ÁREA PRINCIPAL ═════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3
                           flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburguesa — solo móvil */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-9 h-9 flex items-center justify-center
                         rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            >
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-gray-800 font-bold text-base leading-tight">{currentLabel}</h1>
              <p className="text-gray-400 text-xs hidden sm:block">
                {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          {/* Info usuario */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <span className="text-gray-400 text-xs capitalize">{usuario?.rol}</span>
            <span className="text-gray-300">·</span>
            <span className="text-gray-700 font-semibold text-sm">{usuario?.nombre}</span>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>

      {modalPassword && (
        <ModalCambiarPassword onClose={() => setModalPassword(false)} />
      )}
    </div>
  )
}

/* ── Iconos ─────────────────────────────────────────────────────── */
const ic = (active) =>
  `w-[18px] h-[18px] flex-shrink-0 transition-colors
   ${active ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-200'}`

function HomeIcon({ active }) {
  return <svg className={ic(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3
         m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
  </svg>
}
function CheckIcon({ active }) {
  return <svg className={ic(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2
         M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
  </svg>
}
function ClipboardIcon({ active }) {
  return <svg className={ic(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
         m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
}
function LightIcon({ active }) {
  return <svg className={ic(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3
         m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547
         A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531
         c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
  </svg>
}
function ChartIcon({ active }) {
  return <svg className={ic(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9
         a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5
         a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
  </svg>
}
function UsersIcon({ active }) {
  return <svg className={ic(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
  </svg>
}
function FolderIcon({ active }) {
  return <svg className={ic(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
  </svg>
}
function CogIcon({ active }) {
  return <svg className={ic(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066
         c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35
         a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065
         c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37
         a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573
         c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
}
function SchoolIcon() {
  return <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5
         M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
  </svg>
}
function CollapseIcon({ flipped }) {
  return <svg className={`w-4 h-4 flex-shrink-0 transition-transform ${flipped ? 'rotate-180' : ''}`}
    fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
}
function KeyIcon() {
  return <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586
         a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
  </svg>
}
function LogoutIcon() {
  return <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
}
function MenuIcon() {
  return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
}
function AlertIcon({ active }) {
  return <svg className={ic(active)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4
         c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
  </svg>
}

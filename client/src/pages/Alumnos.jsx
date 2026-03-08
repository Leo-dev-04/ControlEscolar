import { useState, useEffect, useMemo } from 'react'
import { alumnosService } from '../services/alumnos.service'
import { gruposService } from '../services/grupos.service'
import { useAuth } from '../context/AuthContext'

const COLORES = [
  { avatar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', ring: 'ring-blue-200', header: 'bg-blue-600' },
  { avatar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700', ring: 'ring-emerald-200', header: 'bg-emerald-600' },
  { avatar: 'bg-violet-500', badge: 'bg-violet-100 text-violet-700', ring: 'ring-violet-200', header: 'bg-violet-600' },
  { avatar: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', ring: 'ring-orange-200', header: 'bg-orange-600' },
]

function Campo({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className={`w-full border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                  transition placeholder-gray-300 ${props.error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`}
    />
  )
}

// Generador simple de QR usando API pública de Google Charts
function QRCodeImage({ url, size = 200 }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&margin=8`
  return <img src={qrUrl} alt="Código QR" width={size} height={size} style={{ borderRadius: '12px' }} />
}

export default function Alumnos() {
  const { usuario } = useAuth()
  const isDirector = usuario?.rol === 'director'

  const [alumnos, setAlumnos] = useState([])
  const [grupos, setGrupos] = useState([])
  const [loading, setLoading] = useState(true)
  const [escuelaActiva, setEscuelaActiva] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [grupoAbierto, setGrupoAbierto] = useState({})

  // Modal alumno
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [errores, setErrores] = useState({})
  const [guardando, setGuardando] = useState(false)

  // Modal QR
  const [qrAlumno, setQrAlumno] = useState(null)
  const [regenerando, setRegenerando] = useState(false)
  const [copiado, setCopiad] = useState(false)

  function emptyForm() {
    return {
      nombre: '', apellidos: '', grupo_id: '', fecha_nacimiento: '',
      parent_nombre: '', parent_email: '', parent_telefono: ''
    }
  }

  const getReporteUrl = (token) => {
    const base = window.location.origin
    return `${base}/reporte/${token}`
  }

  useEffect(() => { cargar() }, [])

  const cargar = async () => {
    setLoading(true)
    try {
      const [rAlumnos, rGrupos] = await Promise.all([
        alumnosService.getAll(),
        gruposService.obtenerTodos(),
      ])
      const data = rAlumnos.data.data || rAlumnos.data || []
      const grps = rGrupos.data || []
      setAlumnos(data)
      setGrupos(grps)
      const abiertos = {}
      data.forEach(a => { abiertos[`${a.escuela}|${a.grado}°${a.grupo}`] = true })
      setGrupoAbierto(abiertos)
      const primera = [...new Set(data.map(a => a.escuela || 'Sin escuela'))].sort()[0]
      setEscuelaActiva(primera)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  // ── Datos derivados
  const alumnosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return alumnos
    const q = busqueda.toLowerCase()
    return alumnos.filter(a =>
      `${a.nombre} ${a.apellidos}`.toLowerCase().includes(q) ||
      `${a.grado}° ${a.grupo}`.toLowerCase().includes(q)
    )
  }, [alumnos, busqueda])

  const agrupado = useMemo(() => {
    const mapa = {}
    alumnosFiltrados.forEach(a => {
      const esc = a.escuela || 'Sin escuela'
      const grp = `${a.grado}°${a.grupo}`
      if (!mapa[esc]) mapa[esc] = {}
      if (!mapa[esc][grp]) mapa[esc][grp] = []
      mapa[esc][grp].push(a)
    })
    return mapa
  }, [alumnosFiltrados])

  const escuelas = useMemo(() => Object.keys(agrupado).sort(), [agrupado])
  const color = (i) => COLORES[i % COLORES.length]
  const escIdx = (esc) => escuelas.indexOf(esc)

  const gruposOrdenados = (esc) =>
    Object.keys(agrupado[esc] || {}).sort((a, b) => {
      const [ga, sa] = a.split('°'); const [gb, sb] = b.split('°')
      return parseInt(ga) - parseInt(gb) || sa.localeCompare(sb)
    })

  const totalEscuela = (esc) =>
    Object.values(agrupado[esc] || {}).reduce((s, a) => s + a.length, 0)

  const toggleGrupo = (key) => setGrupoAbierto(p => ({ ...p, [key]: !p[key] }))

  // ── Formulario
  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Obligatorio'
    if (!form.apellidos.trim()) e.apellidos = 'Obligatorio'
    if (!form.grupo_id) e.grupo_id = 'Selecciona un grupo'
    if (!form.fecha_nacimiento) e.fecha_nacimiento = 'Obligatorio'
    if (!form.parent_nombre.trim()) e.parent_nombre = 'Obligatorio'
    if (!form.parent_email.trim()) e.parent_email = 'Obligatorio'
    if (!form.parent_telefono.trim()) e.parent_telefono = 'Obligatorio'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errores[k]) setErrores(e => ({ ...e, [k]: '' }))
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validar()) return
    setGuardando(true)
    try {
      if (editando) await alumnosService.update(editando.id, form)
      else await alumnosService.create(form)
      await cargar()
      cerrarModal()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Error al guardar.'
      alert('⚠️ ' + msg)
    } finally {
      setGuardando(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este alumno?')) return
    try {
      await alumnosService.delete(id)
      setAlumnos(prev => prev.filter(a => a.id !== id))
    } catch { alert('Error al eliminar.') }
  }

  const abrirModal = (alumno = null) => {
    setEditando(alumno)
    setForm(alumno ? {
      nombre: alumno.nombre, apellidos: alumno.apellidos, grupo_id: alumno.grupo_id,
      fecha_nacimiento: alumno.fecha_nacimiento?.split('T')[0] || '',
      parent_email: alumno.parent_email || '', parent_nombre: alumno.parent_nombre || '',
      parent_telefono: alumno.parent_telefono || '',
    } : emptyForm())
    setErrores({})
    setShowModal(true)
  }

  const cerrarModal = () => {
    setShowModal(false); setEditando(null)
    setForm(emptyForm()); setErrores({})
  }

  // ── QR Modal
  const abrirQrModal = (alumno) => {
    setQrAlumno(alumno)
    setCopiad(false)
  }

  const cerrarQrModal = () => {
    setQrAlumno(null)
    setRegenerando(false)
    setCopiad(false)
  }

  const handleRegenerarQr = async () => {
    if (!window.confirm('¿Regenerar el código QR? El enlace anterior dejará de funcionar.')) return
    setRegenerando(true)
    try {
      const res = await alumnosService.regenerarQr(qrAlumno.id)
      const newToken = res.data.data?.qr_token || res.data.qr_token
      // Actualizar en el estado local
      setAlumnos(prev => prev.map(a => a.id === qrAlumno.id ? { ...a, qr_token: newToken } : a))
      setQrAlumno(prev => ({ ...prev, qr_token: newToken }))
      setCopiad(false)
    } catch (err) {
      alert('Error al regenerar QR: ' + (err.response?.data?.message || err.message))
    } finally {
      setRegenerando(false)
    }
  }

  const handleCopiarEnlace = () => {
    const url = getReporteUrl(qrAlumno.qr_token)
    navigator.clipboard.writeText(url)
    setCopiad(true)
    setTimeout(() => setCopiad(false), 2000)
  }

  const handleCompartirWhatsApp = () => {
    const url = getReporteUrl(qrAlumno.qr_token)
    const texto = `Consulta el reporte del alumno ${qrAlumno.nombre} ${qrAlumno.apellidos}: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank')
  }

  const handleDescargarQr = () => {
    const url = getReporteUrl(qrAlumno.qr_token)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}&margin=8&format=png`
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `QR_${qrAlumno.nombre}_${qrAlumno.apellidos}.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Grupos agrupados por escuela para el select
  const gruposPorEscuela = useMemo(() => {
    const mapa = {}
    grupos.forEach(g => {
      const esc = g.escuela || 'Sin escuela'
      if (!mapa[esc]) mapa[esc] = []
      mapa[esc].push(g)
    })
    return mapa
  }, [grupos])

  // ── Render
  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Cargando alumnos...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-5">

      {/* ── Barra superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alumnos</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {alumnos.length} alumno{alumnos.length !== 1 ? 's' : ''} ·{' '}
            {escuelas.length} {escuelas.length === 1 ? 'escuela' : 'escuelas'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Buscador */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
            </svg>
            <input
              type="text" placeholder="Buscar alumno..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="pl-9 pr-4 py-2 w-52 border border-gray-200 rounded-lg text-sm
                         bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            onClick={() => abrirModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
                       px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo alumno
          </button>
        </div>
      </div>

      {alumnos.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium mb-1">Sin alumnos registrados</p>
          <button onClick={() => abrirModal()} className="text-blue-600 text-sm hover:underline mt-1">
            Registrar el primero →
          </button>
        </div>
      ) : (
        <>
          {/* ── Tabs de escuelas */}
          {escuelas.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {escuelas.map((esc, i) => {
                const c = color(i)
                const activa = escuelaActiva === esc
                return (
                  <button key={esc} onClick={() => setEscuelaActiva(esc)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                                whitespace-nowrap transition-all
                                ${activa ? `${c.header} text-white shadow-md` : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5
                           M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                    {esc}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold
                                     ${activa ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {totalEscuela(esc)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Sin resultados */}
          {escuelaActiva && !agrupado[escuelaActiva] && (
            <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
              No hay alumnos que coincidan con la búsqueda.
            </div>
          )}

          {/* ── Grupos de la escuela activa */}
          {escuelaActiva && agrupado[escuelaActiva] && (
            <div className="space-y-4">
              {gruposOrdenados(escuelaActiva).map(grpKey => {
                const ci = escIdx(escuelaActiva)
                const c = color(ci)
                const panelKey = `${escuelaActiva}|${grpKey}`
                const abierto = grupoAbierto[panelKey] !== false
                const [grado, sec] = grpKey.split('°')
                const lista = agrupado[escuelaActiva][grpKey] || []

                return (
                  <div key={grpKey} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Cabecera colapsable */}
                    <button
                      onClick={() => toggleGrupo(panelKey)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 ${c.header} rounded-lg flex items-center justify-center
                                         text-white text-xs font-bold shadow-sm flex-shrink-0`}>
                          {grado}°{sec}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-800 text-sm leading-tight">
                            {grado}° Grado — Sección {sec}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{escuelaActiva}</p>
                        </div>
                        <span className={`${c.badge} text-xs font-bold px-2.5 py-1 rounded-full ml-1`}>
                          {lista.length} {lista.length === 1 ? 'alumno' : 'alumnos'}
                        </span>
                      </div>
                      <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0
                                       ${abierto ? 'rotate-0' : '-rotate-90'}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Lista de alumnos */}
                    {abierto && (
                      <div className="border-t border-gray-100">
                        {lista.map((alumno, idx) => (
                          <div key={alumno.id}
                            className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50
                                           transition-colors ${idx !== 0 ? 'border-t border-gray-100' : ''}`}>
                            {/* Avatar */}
                            <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200
                                            flex items-center justify-center text-gray-500
                                            text-[11px] font-semibold flex-shrink-0">
                              {alumno.nombre?.[0]}{alumno.apellidos?.[0]}
                            </div>

                            {/* Nombre */}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-[15px] leading-tight truncate">
                                {alumno.apellidos}, {alumno.nombre}
                              </p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {alumno.parent_nombre || '—'}
                                {alumno.parent_email ? ` · ${alumno.parent_email}` : ''}
                              </p>
                            </div>

                            {/* Teléfono — desktop */}
                            {alumno.parent_telefono && (
                              <p className="hidden lg:block text-xs text-gray-400 flex-shrink-0">
                                {alumno.parent_telefono}
                              </p>
                            )}

                            {/* Acciones */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {/* Botón QR */}
                              {alumno.qr_token && (
                                <button onClick={() => abrirQrModal(alumno)}
                                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50
                                             rounded-lg transition-colors" title="Ver QR / Compartir">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm14 3h.01M17 14h.01M14 17h.01M14 14h3v3h-3v-3zm0 4h3v3h-3v-3zm4-4h3v3h-3v-3z" />
                                  </svg>
                                </button>
                              )}
                              <button onClick={() => abrirModal(alumno)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50
                                           rounded-lg transition-colors" title="Editar">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5
                                       m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                              {isDirector && (
                                <button onClick={() => handleDelete(alumno.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50
                                             rounded-lg transition-colors" title="Eliminar">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6
                                         m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ══ Modal Alumno ════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">

            {/* Header modal */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-base leading-tight">
                    {editando ? 'Editar alumno' : 'Nuevo alumno'}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {editando ? `${editando.nombre} ${editando.apellidos}` : 'Completa todos los campos obligatorios'}
                  </p>
                </div>
              </div>
              <button onClick={cerrarModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">

              {/* Datos del alumno */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Datos del alumno</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Campo label="Nombre *" error={errores.nombre}>
                    <Input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
                      placeholder="Ej. Juan" error={errores.nombre} />
                  </Campo>
                  <Campo label="Apellidos *" error={errores.apellidos}>
                    <Input value={form.apellidos} onChange={e => handleChange('apellidos', e.target.value)}
                      placeholder="Ej. Pérez García" error={errores.apellidos} />
                  </Campo>
                  <Campo label="Grupo *" error={errores.grupo_id}>
                    <select value={form.grupo_id} onChange={e => handleChange('grupo_id', e.target.value)}
                      className={`w-full border rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
                                  bg-gray-50 focus:bg-white transition ${errores.grupo_id ? 'border-red-400' : 'border-gray-200'}`}>
                      <option value="">Seleccionar grupo</option>
                      {Object.entries(gruposPorEscuela).sort().map(([esc, gs]) => (
                        <optgroup key={esc} label={`🏫 ${esc}`}>
                          {gs.map(g => (
                            <option key={g.id} value={g.id}>{g.grado}° {g.seccion} — {g.nombre}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </Campo>
                  <Campo label="Fecha de nacimiento *" error={errores.fecha_nacimiento}>
                    <Input type="date" value={form.fecha_nacimiento}
                      onChange={e => handleChange('fecha_nacimiento', e.target.value)}
                      error={errores.fecha_nacimiento} />
                  </Campo>
                </div>
              </div>

              {/* Datos del tutor */}
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Padre / Tutor</p>
                <div className="space-y-4">
                  <Campo label="Nombre completo *" error={errores.parent_nombre}>
                    <Input value={form.parent_nombre} onChange={e => handleChange('parent_nombre', e.target.value)}
                      placeholder="Nombre del padre o tutor" error={errores.parent_nombre} />
                  </Campo>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Campo label="Correo electrónico *" error={errores.parent_email}>
                      <Input type="email" value={form.parent_email}
                        onChange={e => handleChange('parent_email', e.target.value)}
                        placeholder="correo@ejemplo.com" error={errores.parent_email} />
                    </Campo>
                    <Campo label="Teléfono *" error={errores.parent_telefono}>
                      <Input type="tel" value={form.parent_telefono}
                        onChange={e => handleChange('parent_telefono', e.target.value)}
                        placeholder="1234567890" error={errores.parent_telefono} />
                    </Campo>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button type="button" onClick={cerrarModal}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando}
                  className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600
                             hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2">
                  {guardando && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {editando ? 'Actualizar' : 'Guardar alumno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Modal QR ═══════════════════════════════════════════════════════════ */}
      {qrAlumno && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-lg leading-tight">Código QR del Alumno</h2>
                  <p className="text-emerald-100 text-sm mt-0.5">{qrAlumno.nombre} {qrAlumno.apellidos}</p>
                </div>
                <button onClick={cerrarQrModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="px-6 py-6 flex flex-col items-center">
              <div className="bg-white p-3 rounded-xl border-2 border-gray-100 shadow-sm mb-4">
                <QRCodeImage url={getReporteUrl(qrAlumno.qr_token)} size={200} />
              </div>
              <p className="text-xs text-gray-400 text-center mb-1">
                Los padres pueden escanear este código para ver el reporte
              </p>
              <p className="text-xs text-gray-300 text-center break-all px-4">
                {getReporteUrl(qrAlumno.qr_token)}
              </p>
            </div>

            {/* Acciones */}
            <div className="px-6 pb-6 grid grid-cols-2 gap-3">
              <button onClick={handleDescargarQr}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white
                           px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                📥 Descargar QR
              </button>
              <button onClick={handleCopiarEnlace}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors
                           ${copiado ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>
                {copiado ? '✅ ¡Copiado!' : '🔗 Copiar enlace'}
              </button>
              <button onClick={handleCompartirWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white
                           px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                📱 WhatsApp
              </button>
              <button onClick={handleRegenerarQr} disabled={regenerando}
                className="flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700
                           px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-60">
                {regenerando ? '⏳ ...' : '🔄 Regenerar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

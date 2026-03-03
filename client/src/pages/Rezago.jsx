import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import api from '../services/api'

// Umbrales (deben coincidir con el backend)
const UMBRAL_ASIST = 40
const UMBRAL_TAREAS = 30
const UMBRAL_ROJOS = 30

function NivelBadge({ nivel }) {
    const cfg = [
        null,
        { label: 'Riesgo Bajo', cls: 'bg-amber-100 text-amber-700 border border-amber-200' },
        { label: 'Riesgo Medio', cls: 'bg-orange-100 text-orange-700 border border-orange-200' },
        { label: 'Riesgo Alto', cls: 'bg-red-100 text-red-700 border border-red-200' },
    ]
    const c = cfg[nivel]
    if (!c) return null
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.cls}`}>
            {c.label}
        </span>
    )
}

function IndicadorCell({ ok, valor, umbral, sufijo = '%' }) {
    if (!ok) return (
        <span className="flex items-center gap-1 text-gray-700 text-sm font-medium">
            {valor}{sufijo}
        </span>
    )
    return (
        <span className="flex items-center gap-1 text-red-600 font-bold text-sm">
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42
             c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3
             a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {valor}{sufijo}
        </span>
    )
}

export default function Rezago() {
    const { usuario } = useAuth()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [busqueda, setBusqueda] = useState('')
    const [escuela, setEscuela] = useState('todas')

    // Redirigir si no es director
    if (usuario?.rol !== 'director') return <Navigate to="/" replace />

    useEffect(() => {
        const cargar = async () => {
            try {
                setLoading(true)
                const res = await api.get('/rezago')
                setData(res.data.data)
            } catch (err) {
                setError('Error al cargar datos de rezago')
            } finally {
                setLoading(false)
            }
        }
        cargar()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center py-20">
            <div className="text-center">
                <div className="animate-spin w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500 text-sm">Analizando datos de rezago...</p>
            </div>
        </div>
    )

    if (error) return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
            <p className="font-semibold">{error}</p>
            <p className="text-sm mt-1 text-red-400">Asegúrate de que existan reportes generados</p>
        </div>
    )

    if (!data) return null

    const { alumnos, resumen, semana } = data

    // Escuelas disponibles
    const escuelas = ['todas', ...new Set(alumnos.map(a => a.escuela))]

    // Filtrar
    const alumnosFiltrados = alumnos.filter(a => {
        const matchEscuela = escuela === 'todas' || a.escuela === escuela
        const q = busqueda.toLowerCase()
        const matchBusqueda = !q ||
            a.alumno_nombre.toLowerCase().includes(q) ||
            a.grupo_nombre?.toLowerCase().includes(q) ||
            a.escuela?.toLowerCase().includes(q)
        return matchEscuela && matchBusqueda
    })

    const fechaSemana = semana
        ? new Date(semana).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
        : '—'

    return (
        <div className="space-y-6">

            {/* ── Encabezado ──────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">⚠️ Alumnos en Rezago</h1>
                    <p className="text-gray-400 text-sm mt-0.5">
                        Semana del {fechaSemana} &nbsp;·&nbsp;
                        Umbrales: asistencia &lt;{UMBRAL_ASIST}% · tareas &lt;{UMBRAL_TAREAS}% · conducta roja &gt;{UMBRAL_ROJOS}%
                    </p>
                </div>
            </div>

            {/* ── Tarjetas de resumen ─────────────────────────────────────── */}
            {alumnos.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-10 text-center">
                    <div className="text-5xl mb-3">🎉</div>
                    <p className="text-emerald-700 font-bold text-lg">¡Sin alumnos en rezago esta semana!</p>
                    <p className="text-emerald-500 text-sm mt-1">Todos los alumnos están dentro de los parámetros</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {/* Total */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Total en rezago</p>
                            <p className="text-3xl font-black text-gray-800">{resumen.total}</p>
                            <p className="text-xs text-gray-400 mt-1">alumnos detectados</p>
                        </div>
                        {/* Asistencia */}
                        <div className="bg-white rounded-xl border-l-4 border-orange-400 border border-t-gray-200 border-r-gray-200 border-b-gray-200 shadow-sm px-5 py-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">✅ Asistencia</p>
                            <p className="text-3xl font-black text-orange-500">{resumen.rezago_asistencia}</p>
                            <p className="text-xs text-gray-400 mt-1">por debajo del {UMBRAL_ASIST}%</p>
                        </div>
                        {/* Tareas */}
                        <div className="bg-white rounded-xl border-l-4 border-violet-400 border border-t-gray-200 border-r-gray-200 border-b-gray-200 shadow-sm px-5 py-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">📝 Tareas</p>
                            <p className="text-3xl font-black text-violet-500">{resumen.rezago_tareas}</p>
                            <p className="text-xs text-gray-400 mt-1">entregaron menos del {UMBRAL_TAREAS}%</p>
                        </div>
                        {/* Conducta */}
                        <div className="bg-white rounded-xl border-l-4 border-red-400 border border-t-gray-200 border-r-gray-200 border-b-gray-200 shadow-sm px-5 py-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">🚦 Conducta</p>
                            <p className="text-3xl font-black text-red-500">{resumen.rezago_conducta}</p>
                            <p className="text-xs text-gray-400 mt-1">más del {UMBRAL_ROJOS}% días rojos</p>
                        </div>
                    </div>

                    {/* Riesgo alto callout */}
                    {resumen.riesgo_alto > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 flex items-center gap-3">
                            <span className="text-2xl">🚨</span>
                            <p className="text-red-700 text-sm">
                                <strong>{resumen.riesgo_alto} alumno{resumen.riesgo_alto !== 1 ? 's' : ''}</strong> presentan
                                {resumen.riesgo_alto !== 1 ? ' ' : ' '}riesgo alto (2 o más indicadores en rezago).
                            </p>
                        </div>
                    )}

                    {/* ── Filtros ─────────────────────────────────────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4
                          flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        {/* Buscador */}
                        <div className="relative flex-1 w-full">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Buscar por alumno, grupo o escuela..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400"
                            />
                        </div>
                        {/* Filtro escuela */}
                        {escuelas.length > 2 && (
                            <div className="flex gap-1.5 flex-wrap">
                                {escuelas.map(e => (
                                    <button key={e} onClick={() => setEscuela(e)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                ${escuela === e
                                                ? 'bg-slate-800 text-white'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                        {e === 'todas' ? 'Todas las escuelas' : e}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Tabla ───────────────────────────────────────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        {alumnosFiltrados.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">
                                <p>No se encontraron alumnos con esos filtros</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-200">
                                            <th className="text-left px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Alumno</th>
                                            <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Grupo</th>
                                            <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Asistencia</th>
                                            <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Tareas</th>
                                            <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Días 🔴</th>
                                            <th className="text-center px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">Nivel</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {alumnosFiltrados.map((a, i) => (
                                            <tr key={a.reporte_id}
                                                className={`hover:bg-gray-50 transition-colors
                                      ${a.nivel_riesgo >= 2 ? 'bg-red-50/40' : ''}`}>
                                                {/* Alumno */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                            text-xs font-bold flex-shrink-0 text-white
                                            ${a.nivel_riesgo >= 2 ? 'bg-red-400' : 'bg-amber-400'}`}>
                                                            {a.alumno_nombre[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-800 leading-tight">{a.alumno_nombre}</p>
                                                            <p className="text-xs text-gray-400">{a.escuela}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Grupo */}
                                                <td className="px-4 py-3.5">
                                                    <p className="text-gray-700">{a.grado}° {a.grupo_nombre}</p>
                                                </td>
                                                {/* Asistencia */}
                                                <td className="px-4 py-3.5 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <IndicadorCell ok={a.rezago_asistencia} valor={a.pct_asistencia} />
                                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${a.rezago_asistencia ? 'bg-red-400' : 'bg-emerald-400'}`}
                                                                style={{ width: `${a.pct_asistencia}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Tareas */}
                                                <td className="px-4 py-3.5 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <IndicadorCell ok={a.rezago_tareas} valor={a.pct_tareas} />
                                                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${a.rezago_tareas ? 'bg-red-400' : 'bg-violet-400'}`}
                                                                style={{ width: `${a.pct_tareas}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Conducta */}
                                                <td className="px-4 py-3.5 text-center">
                                                    <IndicadorCell ok={a.rezago_conducta} valor={a.pct_rojos} />
                                                </td>
                                                {/* Nivel */}
                                                <td className="px-4 py-3.5 text-center">
                                                    <NivelBadge nivel={a.nivel_riesgo} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
                                    Mostrando {alumnosFiltrados.length} de {alumnos.length} alumnos en rezago
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

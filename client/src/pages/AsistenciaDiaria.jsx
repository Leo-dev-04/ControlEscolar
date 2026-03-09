import { useState, useEffect } from 'react'
import { alumnosService } from '../services/alumnos.service'
import { gruposService } from '../services/grupos.service'
import { asistenciasService } from '../services/asistencias.service'
import { useAuth } from '../context/AuthContext'

export default function AsistenciaDiaria() {
  const { usuario } = useAuth()
  const [grupos, setGrupos] = useState([])
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('')
  const [alumnos, setAlumnos] = useState([])
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [asistencias, setAsistencias] = useState({})
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => { cargarGrupos() }, [])

  useEffect(() => {
    if (grupoSeleccionado) {
      cargarAlumnos()
      cargarAsistenciasExistentes()
    }
  }, [grupoSeleccionado, fecha])

  const cargarGrupos = async () => {
    try {
      const response = await gruposService.obtenerTodos()
      const data = response.data?.data || response.data || []
      setGrupos(data)
      if (data.length > 0) setGrupoSeleccionado(data[0].id)
    } catch (error) {
      console.error('Error al cargar grupos:', error)
      alert('Error al cargar grupos.')
    } finally {
      setLoading(false)
    }
  }

  const cargarAlumnos = async () => {
    try {
      setLoading(true)
      const response = await alumnosService.getByGrupo(grupoSeleccionado)
      const lista = response.data?.data || response.data || []

      const asistenciasIniciales = {}
      lista.forEach(a => { asistenciasIniciales[a.id] = 'presente' })

      setAlumnos(lista)
      setAsistencias(asistenciasIniciales)
    } catch (error) {
      console.error('Error al cargar alumnos:', error)
      setAlumnos([])
    } finally {
      setLoading(false)
    }
  }

  const cargarAsistenciasExistentes = async () => {
    try {
      const response = await asistenciasService.obtenerPorFecha(grupoSeleccionado, fecha)
      const data = response.data?.data || response.data || []
      if (data.length > 0) {
        const existentes = {}
        data.forEach(a => { existentes[a.alumno_id] = a.estado })
        setAsistencias(prev => ({ ...prev, ...existentes }))
      }
    } catch (error) {
      console.error('Error al cargar asistencias existentes:', error)
    }
  }

  const toggleAsistencia = (alumnoId) => {
    setAsistencias(prev => {
      const actual = prev[alumnoId]
      const siguiente = actual === 'presente' ? 'retardo' : actual === 'retardo' ? 'falta' : 'presente'
      return { ...prev, [alumnoId]: siguiente }
    })
  }

  const handleGuardar = async () => {
    if (!grupoSeleccionado) return alert('Selecciona un grupo primero')
    setGuardando(true)
    try {
      await asistenciasService.registrar({
        fecha,
        grupo_id: grupoSeleccionado,
        asistencias: alumnos.map(a => ({ alumno_id: a.id, estado: asistencias[a.id] }))
      })
      alert('✅ Asistencia guardada correctamente')
    } catch (error) {
      alert('❌ Error al guardar: ' + (error.response?.data?.message || error.message))
    } finally {
      setGuardando(false)
    }
  }

  const contar = (estado) => Object.values(asistencias).filter(a => a === estado).length

  const estadoConfig = {
    presente: { bg: 'bg-green-100 border-2 border-green-500 text-green-800', emoji: '✅', label: 'PRESENTE' },
    retardo: { bg: 'bg-yellow-100 border-2 border-yellow-500 text-yellow-800', emoji: '🕐', label: 'RETARDO' },
    falta: { bg: 'bg-red-100 border-2 border-red-500 text-red-800', emoji: '❌', label: 'FALTA' },
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">📋 Asistencia Diaria</h1>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grupo</label>
            <select value={grupoSeleccionado} onChange={e => setGrupoSeleccionado(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {grupos.map(g => (
                <option key={g.id} value={g.id}>{g.grado}° {g.seccion} - {g.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600">{contar('presente')}</div>
            <div className="text-sm text-gray-600">✅ Presentes</div>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-600">{contar('retardo')}</div>
            <div className="text-sm text-gray-600">🕐 Retardos</div>
          </div>
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-600">{contar('falta')}</div>
            <div className="text-sm text-gray-600">❌ Ausentes</div>
          </div>
        </div>
      </div>

      {/* Lista de alumnos */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <p className="text-sm text-gray-600 mb-4">
          💡 Toca a un alumno para cambiar su estado: <strong>Presente → Retardo → Falta</strong>
        </p>
        <div className="space-y-2">
          {alumnos.map(alumno => {
            const config = estadoConfig[asistencias[alumno.id]] || estadoConfig.presente
            return (
              <button key={alumno.id} onClick={() => toggleAsistencia(alumno.id)}
                className={`w-full p-4 rounded-lg font-semibold text-left transition-all transform active:scale-95 ${config.bg}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{config.emoji}</div>
                    <div>
                      <div className="text-lg">{alumno.nombre} {alumno.apellidos}</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold">{config.label}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Guardar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 md:relative md:bg-transparent md:border-0">
        <button onClick={handleGuardar} disabled={guardando}
          className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transition-all ${guardando
            ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>
          {guardando ? '⏳ Guardando...' : '💾 Guardar Asistencia'}
        </button>
      </div>
    </div>
  )
}

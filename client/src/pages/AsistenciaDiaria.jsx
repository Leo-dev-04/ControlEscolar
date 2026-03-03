import { useState, useEffect } from 'react'
import { alumnosService } from '../services/alumnos.service'
import { gruposService } from '../services/grupos.service'
import { asistenciasService } from '../services/asistencias.service'

export default function AsistenciaDiaria() {
  const [grupos, setGrupos] = useState([])
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('')
  const [alumnos, setAlumnos] = useState([])
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [asistencias, setAsistencias] = useState({})
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    cargarGrupos()
  }, [])

  useEffect(() => {
    if (grupoSeleccionado) {
      cargarAlumnos()
      cargarAsistenciasExistentes()
    }
  }, [grupoSeleccionado, fecha])

  const cargarGrupos = async () => {
    try {
      const response = await gruposService.obtenerTodos()
      setGrupos(response.data)
      if (response.data.length > 0) {
        setGrupoSeleccionado(response.data[0].id)
      }
    } catch (error) {
      console.error('Error al cargar grupos:', error)
      alert('Error al cargar grupos. Verifica la conexión.')
    } finally {
      setLoading(false)
    }
  }

  const cargarAlumnos = async () => {
    try {
      setLoading(true)
      const response = await alumnosService.getAll()
      const todosLosAlumnos = response.data.data || response.data || []
      const alumnosDelGrupo = todosLosAlumnos.filter(a => a.grupo_id == grupoSeleccionado)

      // Inicializar todos como presentes
      const asistenciasIniciales = {}
      alumnosDelGrupo.forEach(alumno => {
        asistenciasIniciales[alumno.id] = 'presente'
      })

      setAlumnos(alumnosDelGrupo)
      setAsistencias(asistenciasIniciales)
    } catch (error) {
      console.error('Error al cargar alumnos:', error)
      alert('Error al cargar alumnos. Verifica la conexión.')
      setAlumnos([])
    } finally {
      setLoading(false)
    }
  }

  const cargarAsistenciasExistentes = async () => {
    try {
      const response = await asistenciasService.obtenerPorFecha(grupoSeleccionado, fecha)
      if (response.data.length > 0) {
        const asistenciasExistentes = {}
        response.data.forEach(asistencia => {
          asistenciasExistentes[asistencia.alumno_id] = asistencia.estado
        })
        setAsistencias(prev => ({ ...prev, ...asistenciasExistentes }))
      }
    } catch (error) {
      console.error('Error al cargar asistencias existentes:', error)
    }
  }

  // Ciclo de 3 estados: presente → retardo → falta → presente
  const toggleAsistencia = (alumnoId) => {
    setAsistencias(prev => {
      const estadoActual = prev[alumnoId]
      let nuevoEstado
      if (estadoActual === 'presente') nuevoEstado = 'retardo'
      else if (estadoActual === 'retardo') nuevoEstado = 'falta'
      else nuevoEstado = 'presente'
      return { ...prev, [alumnoId]: nuevoEstado }
    })
  }

  const handleGuardar = async () => {
    if (!grupoSeleccionado) {
      alert('⚠️ Selecciona un grupo primero')
      return
    }

    setGuardando(true)
    try {
      const asistenciasArray = alumnos.map(alumno => ({
        alumno_id: alumno.id,
        estado: asistencias[alumno.id]
      }))

      await asistenciasService.registrar({
        fecha,
        grupo_id: grupoSeleccionado,
        asistencias: asistenciasArray,
        registrado_por: 1
      })

      alert('✅ Asistencia guardada correctamente')
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('❌ Error al guardar la asistencia: ' + (error.response?.data?.error || error.message))
    } finally {
      setGuardando(false)
    }
  }

  const contarPresentes = () => Object.values(asistencias).filter(a => a === 'presente').length
  const contarRetardos = () => Object.values(asistencias).filter(a => a === 'retardo').length
  const contarAusentes = () => Object.values(asistencias).filter(a => a === 'falta').length

  const getEstadoConfig = (estado) => {
    switch (estado) {
      case 'presente':
        return {
          bg: 'bg-green-100 border-2 border-green-500 text-green-800',
          emoji: '✅',
          label: 'PRESENTE'
        }
      case 'retardo':
        return {
          bg: 'bg-yellow-100 border-2 border-yellow-500 text-yellow-800',
          emoji: '🕐',
          label: 'RETARDO'
        }
      case 'falta':
        return {
          bg: 'bg-red-100 border-2 border-red-500 text-red-800',
          emoji: '❌',
          label: 'FALTA'
        }
      default:
        return {
          bg: 'bg-green-100 border-2 border-green-500 text-green-800',
          emoji: '✅',
          label: 'PRESENTE'
        }
    }
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
      {/* Header con fecha y estadísticas */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">📋 Asistencia Diaria</h1>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grupo</label>
            <select
              value={grupoSeleccionado}
              onChange={(e) => setGrupoSeleccionado(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {grupos.map(grupo => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.grado}° {grupo.seccion} - {grupo.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-green-600">{contarPresentes()}</div>
            <div className="text-sm text-gray-600">✅ Presentes</div>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-yellow-600">{contarRetardos()}</div>
            <div className="text-sm text-gray-600">🕐 Retardos</div>
          </div>
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4">
            <div className="text-3xl font-bold text-red-600">{contarAusentes()}</div>
            <div className="text-sm text-gray-600">❌ Ausentes</div>
          </div>
        </div>
      </div>

      {/* Lista de alumnos con botones grandes */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <p className="text-sm text-gray-600 mb-4">
          💡 Toca a un alumno para cambiar su estado: <strong>Presente → Retardo → Falta</strong>
        </p>

        <div className="space-y-2">
          {alumnos.map((alumno) => {
            const config = getEstadoConfig(asistencias[alumno.id])
            return (
              <button
                key={alumno.id}
                onClick={() => toggleAsistencia(alumno.id)}
                className={`w-full p-4 rounded-lg font-semibold text-left transition-all transform active:scale-95 ${config.bg}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">
                      {config.emoji}
                    </div>
                    <div>
                      <div className="text-lg">{alumno.nombre} {alumno.apellidos}</div>
                      <div className="text-sm opacity-75">{alumno.grado}° "{alumno.grupo}"</div>
                    </div>
                  </div>
                  <div className="text-sm font-bold">
                    {config.label}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Botón de guardar fijo en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 md:relative md:bg-transparent md:border-0">
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transition-all ${guardando
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
        >
          {guardando ? '⏳ Guardando...' : '💾 Guardar Asistencia'}
        </button>
      </div>
    </div>
  )
}

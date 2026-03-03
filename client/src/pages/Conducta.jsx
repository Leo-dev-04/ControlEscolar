import { useState, useEffect } from 'react'
import { alumnosService } from '../services/alumnos.service'
import { gruposService } from '../services/grupos.service'
import { conductaService } from '../services/conducta.service'

export default function Conducta() {
  const [grupos, setGrupos] = useState([])
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('')
  const [alumnos, setAlumnos] = useState([])
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [conductas, setConductas] = useState({})
  const [notaActual, setNotaActual] = useState({ alumnoId: null, nota: '' })
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const semaforo = {
    verde: { color: 'green', emoji: '😊', label: 'Excelente', bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-800' },
    amarillo: { color: 'yellow', emoji: '😐', label: 'Regular', bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800' },
    rojo: { color: 'red', emoji: '😟', label: 'Necesita mejorar', bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-800' }
  }

  useEffect(() => {
    cargarGrupos()
  }, [])

  useEffect(() => {
    if (grupoSeleccionado) {
      cargarAlumnos()
      cargarConductasExistentes()
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
      alert('Error al cargar grupos.')
    } finally {
      setLoading(false)
    }
  }

  const cargarAlumnos = async () => {
    try {
      setLoading(true)
      const response = await alumnosService.getAll()
      // El backend retorna { success, data: { data: [...], pagination: {...} } }
      const todosLosAlumnos = response.data.data || response.data || []
      const alumnosDelGrupo = todosLosAlumnos.filter(a => a.grupo_id == grupoSeleccionado)

      // Inicializar todos con conducta verde por defecto
      const conductaInicial = {}
      alumnosDelGrupo.forEach(alumno => {
        conductaInicial[alumno.id] = { color: 'verde', nota: '' }
      })

      setAlumnos(alumnosDelGrupo)
      setConductas(conductaInicial)
    } catch (error) {
      console.error('Error al cargar alumnos:', error)
      alert('Error al cargar alumnos. Verifica la conexión.')
      setAlumnos([])
    } finally {
      setLoading(false)
    }
  }

  const cargarConductasExistentes = async () => {
    try {
      const response = await conductaService.obtenerPorFecha(grupoSeleccionado, fecha)
      if (response.data.length > 0) {
        const conductasExistentes = {}
        response.data.forEach(conducta => {
          conductasExistentes[conducta.alumno_id] = {
            color: conducta.color,
            nota: conducta.observaciones || ''
          }
        })
        setConductas(prev => ({ ...prev, ...conductasExistentes }))
      }
    } catch (error) {
      console.error('Error al cargar conductas existentes:', error)
    }
  }

  const cambiarConducta = (alumnoId, color) => {
    setConductas({
      ...conductas,
      [alumnoId]: {
        ...conductas[alumnoId],
        color: color
      }
    })
  }

  const abrirNota = (alumnoId) => {
    setNotaActual({
      alumnoId: alumnoId,
      nota: conductas[alumnoId]?.nota || ''
    })
  }

  const guardarNota = () => {
    if (notaActual.alumnoId) {
      setConductas({
        ...conductas,
        [notaActual.alumnoId]: {
          ...conductas[notaActual.alumnoId],
          nota: notaActual.nota
        }
      })
      setNotaActual({ alumnoId: null, nota: '' })
    }
  }

  const contarPorColor = (color) => {
    return Object.values(conductas).filter(c => c.color === color).length
  }

  const handleGuardar = async () => {
    if (!grupoSeleccionado) {
      alert('⚠️ Selecciona un grupo primero')
      return
    }

    setGuardando(true)
    try {
      const conductasArray = alumnos.map(alumno => ({
        alumno_id: alumno.id,
        color: conductas[alumno.id].color,
        observaciones: conductas[alumno.id].nota || null
      }))

      await conductaService.registrar({
        fecha,
        grupo_id: grupoSeleccionado,
        conductas: conductasArray,
        registrado_por: 1
      })

      alert('✅ Conducta guardada correctamente')
    } catch (error) {
      console.error('Error al guardar:', error)
      alert('❌ Error al guardar: ' + (error.response?.data?.error || error.message))
    } finally {
      setGuardando(false)
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
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">🚦 Semáforo de Conducta</h1>

      {/* Header con grupo y fecha */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="grid md:grid-cols-2 gap-4">
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
      </div>

      {/* Leyenda del semáforo */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h3 className="font-bold text-lg mb-3">📊 Resumen del Día</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className={`${semaforo.verde.bg} border-2 ${semaforo.verde.border} rounded-lg p-3 text-center`}>
            <div className="text-3xl mb-1">{semaforo.verde.emoji}</div>
            <div className="text-2xl font-bold text-green-600">{contarPorColor('verde')}</div>
            <div className="text-xs text-gray-600">Excelente</div>
          </div>
          <div className={`${semaforo.amarillo.bg} border-2 ${semaforo.amarillo.border} rounded-lg p-3 text-center`}>
            <div className="text-3xl mb-1">{semaforo.amarillo.emoji}</div>
            <div className="text-2xl font-bold text-yellow-600">{contarPorColor('amarillo')}</div>
            <div className="text-xs text-gray-600">Regular</div>
          </div>
          <div className={`${semaforo.rojo.bg} border-2 ${semaforo.rojo.border} rounded-lg p-3 text-center`}>
            <div className="text-3xl mb-1">{semaforo.rojo.emoji}</div>
            <div className="text-2xl font-bold text-red-600">{contarPorColor('rojo')}</div>
            <div className="text-xs text-gray-600">Mejorar</div>
          </div>
        </div>
      </div>

      {/* Lista de alumnos con semáforo */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <p className="text-sm text-gray-600 mb-4">
          💡 Selecciona el color del semáforo para cada alumno. Verde es el predeterminado.
        </p>

        <div className="space-y-3">
          {alumnos.map((alumno) => {
            const conductaActual = conductas[alumno.id] || { color: 'verde', nota: '' }
            const semaforoInfo = semaforo[conductaActual.color]

            return (
              <div key={alumno.id} className={`${semaforoInfo.bg} border-2 ${semaforoInfo.border} rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-lg">{alumno.nombre} {alumno.apellidos}</div>
                    <div className="text-sm text-gray-600">{alumno.grado}° "{alumno.grupo}"</div>
                  </div>
                  <div className="text-4xl">{semaforoInfo.emoji}</div>
                </div>

                {/* Botones de semáforo */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    onClick={() => cambiarConducta(alumno.id, 'verde')}
                    className={`py-3 rounded-lg font-bold transition-all ${conductaActual.color === 'verde'
                        ? 'bg-green-500 text-white scale-105 shadow-lg'
                        : 'bg-white text-green-600 border-2 border-green-300'
                      }`}
                  >
                    🟢 Verde
                  </button>
                  <button
                    onClick={() => cambiarConducta(alumno.id, 'amarillo')}
                    className={`py-3 rounded-lg font-bold transition-all ${conductaActual.color === 'amarillo'
                        ? 'bg-yellow-500 text-white scale-105 shadow-lg'
                        : 'bg-white text-yellow-600 border-2 border-yellow-300'
                      }`}
                  >
                    🟡 Amarillo
                  </button>
                  <button
                    onClick={() => cambiarConducta(alumno.id, 'rojo')}
                    className={`py-3 rounded-lg font-bold transition-all ${conductaActual.color === 'rojo'
                        ? 'bg-red-500 text-white scale-105 shadow-lg'
                        : 'bg-white text-red-600 border-2 border-red-300'
                      }`}
                  >
                    🔴 Rojo
                  </button>
                </div>

                {/* Botón para agregar nota */}
                <button
                  onClick={() => abrirNota(alumno.id)}
                  className="w-full py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  {conductaActual.nota ? '📝 Editar Nota' : '➕ Agregar Nota'}
                </button>

                {conductaActual.nota && (
                  <div className="mt-2 p-2 bg-white rounded text-sm italic">
                    "{conductaActual.nota}"
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal para agregar nota */}
      {notaActual.alumnoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">📝 Nota de Conducta</h3>
            <p className="text-sm text-gray-600 mb-4">
              Escribe lo que sucedió (Ej: "Peleó en el recreo", "Excelente participación", etc.)
            </p>
            <textarea
              value={notaActual.nota}
              onChange={(e) => setNotaActual({ ...notaActual, nota: e.target.value })}
              rows="4"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              placeholder="Escribe aquí..."
            />
            <div className="flex gap-3">
              <button
                onClick={() => setNotaActual({ alumnoId: null, nota: '' })}
                className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 rounded-lg font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={guardarNota}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Botón de guardar fijo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 md:relative md:bg-transparent md:border-0">
        <button
          onClick={handleGuardar}
          disabled={guardando}
          className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transition-all ${guardando
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
            }`}
        >
          {guardando ? '⏳ Guardando...' : '💾 Guardar Conducta del Día'}
        </button>
      </div>
    </div>
  )
}

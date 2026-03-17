import { useState, useEffect } from 'react'
import { alumnosService } from '../services/alumnos.service'
import { gruposService } from '../services/grupos.service'
import { conductaService } from '../services/conducta.service'
import { useAuth } from '../context/AuthContext'

export default function Conducta() {
  const { usuario } = useAuth()
  const esDirector = usuario?.rol === 'director'
  const [grupos, setGrupos] = useState([])
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('')
  const [alumnos, setAlumnos] = useState([])
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [conductas, setConductas] = useState({})
  const [notaActual, setNotaActual] = useState({ alumnoId: null, nota: '' })
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)

  const semaforo = {
    verde:    { emoji: '😊', label: 'Excelente',        bg: 'bg-green-100',  border: 'border-green-500',  text: 'text-green-800' },
    amarillo: { emoji: '😐', label: 'Regular',          bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-800' },
    rojo:     { emoji: '😟', label: 'Necesita mejorar', bg: 'bg-red-100',    border: 'border-red-500',    text: 'text-red-800' }
  }

  useEffect(() => { cargarGrupos() }, [])

  useEffect(() => {
    if (grupoSeleccionado) cargarDatos()
  }, [grupoSeleccionado, fecha])

  const cargarGrupos = async () => {
    try {
      const response = await gruposService.obtenerTodos()
      const data = response.data?.data || response.data || []
      const lista = Array.isArray(data) ? data : []
      setGrupos(lista)
      if (lista.length > 0) setGrupoSeleccionado(String(lista[0].id))
    } catch (error) {
      console.error('Error al cargar grupos:', error)
      setGrupos([])
    } finally {
      setLoading(false)
    }
  }

  const cargarDatos = async () => {
    if (!grupoSeleccionado) return
    setLoading(true)
    try {
      // Cargar alumnos primero
      const response = await alumnosService.getByGrupo(grupoSeleccionado)
      const rawData = response.data?.data || response.data || []
      const lista = Array.isArray(rawData) ? rawData : []

      // Inicializar conductas
      const conductaInicial = {}
      lista.forEach(a => { conductaInicial[a.id] = { color: 'verde', nota: '' } })

      // Cargar conductas existentes para sobreescribir
      try {
        const condResponse = await conductaService.obtenerPorFecha(grupoSeleccionado, fecha)
        const condData = condResponse.data?.data || condResponse.data || []
        if (Array.isArray(condData) && condData.length > 0) {
          condData.forEach(c => { conductaInicial[c.alumno_id] = { color: c.color, nota: c.observaciones || '' } })
        }
      } catch {
        // Si falla, seguimos con valores por defecto
      }

      setAlumnos(lista)
      setConductas(conductaInicial)
    } catch (error) {
      console.error('Error al cargar datos:', error)
      setAlumnos([])
      setConductas({})
    } finally {
      setLoading(false)
    }
  }

  const cambiarConducta = (alumnoId, color) => {
    if (esDirector) return
    setConductas(prev => ({ ...prev, [alumnoId]: { ...prev[alumnoId], color } }))
  }

  const abrirNota = (alumnoId) => {
    if (esDirector) return
    setNotaActual({ alumnoId, nota: conductas[alumnoId]?.nota || '' })
  }

  const guardarNota = () => {
    if (notaActual.alumnoId) {
      setConductas(prev => ({
        ...prev,
        [notaActual.alumnoId]: { ...prev[notaActual.alumnoId], nota: notaActual.nota }
      }))
      setNotaActual({ alumnoId: null, nota: '' })
    }
  }

  const contarPorColor = (color) => Object.values(conductas).filter(c => c.color === color).length

  const handleGuardar = async () => {
    if (esDirector) return
    if (!grupoSeleccionado || alumnos.length === 0) return alert('No hay alumnos para guardar')
    setGuardando(true)
    try {
      await conductaService.registrar({
        fecha,
        grupo_id: parseInt(grupoSeleccionado),
        conductas: alumnos.map(a => ({
          alumno_id: a.id,
          color: conductas[a.id]?.color || 'verde',
          observaciones: conductas[a.id]?.nota || null
        }))
      })
      alert('✅ Conducta guardada correctamente')
    } catch (error) {
      alert('❌ Error al guardar: ' + (error.response?.data?.message || error.message))
    } finally {
      setGuardando(false)
    }
  }

  if (loading && alumnos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">🚦 Semáforo de Conducta</h1>

      {esDirector && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700 font-medium">
          👁️ Vista de supervisión — Solo lectura
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Grupo</label>
            <select value={grupoSeleccionado} onChange={e => setGrupoSeleccionado(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {grupos.map(g => (
                <option key={g.id} value={String(g.id)}>{g.grado}° {g.seccion} - {g.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
              className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <h3 className="font-bold text-lg mb-3">📊 Resumen del Día</h3>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(semaforo).map(([key, s]) => (
            <div key={key} className={`${s.bg} border-2 ${s.border} rounded-lg p-3 text-center`}>
              <div className="text-3xl mb-1">{s.emoji}</div>
              <div className={`text-2xl font-bold ${s.text}`}>{contarPorColor(key)}</div>
              <div className="text-xs text-gray-600">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        {!esDirector && (
          <p className="text-sm text-gray-600 mb-4">
            💡 Selecciona el color del semáforo para cada alumno. Verde es el predeterminado.
          </p>
        )}

        {alumnos.length === 0 && !loading ? (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-2">📭</p>
            <p className="font-semibold">No hay alumnos en este grupo</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alumnos.map(alumno => {
              const conductaActual = conductas[alumno.id] || { color: 'verde', nota: '' }
              const info = semaforo[conductaActual.color]
              return (
                <div key={alumno.id} className={`${info.bg} border-2 ${info.border} rounded-lg p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-bold text-lg">{alumno.nombre} {alumno.apellidos}</div>
                    <div className="text-4xl">{info.emoji}</div>
                  </div>

                  {!esDirector && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {Object.entries(semaforo).map(([key, s]) => (
                        <button key={key} onClick={() => cambiarConducta(alumno.id, key)}
                          className={`py-3 rounded-lg font-bold transition-all ${conductaActual.color === key
                            ? `bg-${key === 'verde' ? 'green' : key === 'amarillo' ? 'yellow' : 'red'}-500 text-white scale-105 shadow-lg`
                            : `bg-white text-${key === 'verde' ? 'green' : key === 'amarillo' ? 'yellow' : 'red'}-600 border-2 border-${key === 'verde' ? 'green' : key === 'amarillo' ? 'yellow' : 'red'}-300`
                          }`}>
                          {key === 'verde' ? '🟢 Verde' : key === 'amarillo' ? '🟡 Amarillo' : '🔴 Rojo'}
                        </button>
                      ))}
                    </div>
                  )}

                  {!esDirector && (
                    <button onClick={() => abrirNota(alumno.id)}
                      className="w-full py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">
                      {conductaActual.nota ? '📝 Editar Nota' : '➕ Agregar Nota'}
                    </button>
                  )}

                  {conductaActual.nota && (
                    <div className="mt-2 p-2 bg-white rounded text-sm italic">
                      "{conductaActual.nota}"
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal nota */}
      {!esDirector && notaActual.alumnoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">📝 Nota de Conducta</h3>
            <textarea value={notaActual.nota} onChange={e => setNotaActual({ ...notaActual, nota: e.target.value })}
              rows="4" placeholder="Escribe aquí..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setNotaActual({ alumnoId: null, nota: '' })}
                className="flex-1 py-3 bg-gray-300 hover:bg-gray-400 rounded-lg font-bold">Cancelar</button>
              <button onClick={guardarNota}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {!esDirector && alumnos.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 p-4 md:relative md:bg-transparent md:border-0">
          <button onClick={handleGuardar} disabled={guardando}
            className={`w-full py-4 rounded-lg font-bold text-white text-lg shadow-lg transition-all ${guardando
              ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}>
            {guardando ? '⏳ Guardando...' : '💾 Guardar Conducta del Día'}
          </button>
        </div>
      )}
    </div>
  )
}

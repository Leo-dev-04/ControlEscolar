export default function ReporteParaPadres({ reporte, alumno, onClose }) {
  const handlePrint = () => {
    window.print()
  }

  const handleCopyText = () => {
    const texto = generarTextoReporte()
    navigator.clipboard.writeText(texto)
    alert('Reporte copiado al portapapeles. Puedes pegarlo en WhatsApp o Email.')
  }

  const handleWhatsApp = () => {
    const texto = generarTextoReporte()
    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`
    window.open(url, '_blank')
  }

  const generarTextoReporte = () => {
    const inicio = new Date(reporte.fecha_inicio).toLocaleDateString('es-MX', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    })
    const fin = new Date(reporte.fecha_fin).toLocaleDateString('es-MX', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    })

    return `
📚 *REPORTE SEMANAL DE DESEMPEÑO*

👤 *Alumno:* ${alumno.nombre} ${alumno.apellidos}
📅 *Período:* ${inicio} - ${fin}
🎓 *Grado:* ${alumno.grado}° "${alumno.grupo}"

━━━━━━━━━━━━━━━━━━━━━━
📊 *DESEMPEÑO DE LA SEMANA*

✅ *Asistencias:* ${reporte.asistencias}/5 días
📝 *Tareas completadas:* ${reporte.tareas_completadas}/5
😊 *Conducta:* ${getConductaEmoji(reporte.conducta)} ${getConductaLabel(reporte.conducta)}

${reporte.observaciones ? `💭 *Observaciones del maestro:*
"${reporte.observaciones}"` : ''}

━━━━━━━━━━━━━━━━━━━━━━
Cualquier duda o comentario, estamos a sus órdenes.

Sistema Control Escolar Primaria
    `.trim()
  }

  const getConductaLabel = (conducta) => {
    const labels = {
      excelente: 'Excelente',
      buena: 'Buena',
      regular: 'Regular',
      necesita_mejorar: 'Necesita Mejorar'
    }
    return labels[conducta] || conducta
  }

  const getConductaEmoji = (conducta) => {
    const emojis = {
      excelente: '🌟',
      buena: '😊',
      regular: '😐',
      necesita_mejorar: '😟'
    }
    return emojis[conducta] || '📝'
  }

  const getConductaColor = (conducta) => {
    const colores = {
      excelente: 'text-green-600',
      buena: 'text-blue-600',
      regular: 'text-yellow-600',
      necesita_mejorar: 'text-red-600'
    }
    return colores[conducta] || 'text-gray-600'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Botones de acción (no se imprimen) */}
        <div className="p-4 border-b flex justify-between items-center print:hidden">
          <h2 className="text-xl font-bold text-gray-800">Enviar Reporte a Padres</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {/* Contenido del reporte (se imprime) */}
        <div className="p-8">
          {/* Encabezado */}
          <div className="text-center mb-6 pb-4 border-b-2 border-blue-600">
            <h1 className="text-2xl font-bold text-blue-600 mb-2">
              📚 REPORTE SEMANAL DE DESEMPEÑO
            </h1>
            <p className="text-gray-600">Sistema Control Escolar Primaria</p>
          </div>

          {/* Información del alumno */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-blue-800">Información del Alumno</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold">Nombre:</span>
                <p className="text-lg">{alumno.nombre} {alumno.apellidos}</p>
              </div>
              <div>
                <span className="font-semibold">Grado y Grupo:</span>
                <p className="text-lg">{alumno.grado}° "{alumno.grupo}"</p>
              </div>
            </div>
          </div>

          {/* Período */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-2 text-gray-800">📅 Período del Reporte</h3>
            <p className="text-gray-700">
              Del <span className="font-semibold">{new Date(reporte.fecha_inicio).toLocaleDateString('es-MX', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}</span> al <span className="font-semibold">{new Date(reporte.fecha_fin).toLocaleDateString('es-MX', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}</span>
            </p>
          </div>

          {/* Desempeño */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">📊 Desempeño de la Semana</h3>
            
            <div className="space-y-4">
              {/* Asistencias */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">✅ Asistencias</span>
                  <span className="text-2xl font-bold text-green-600">{reporte.asistencias}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${(reporte.asistencias / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Tareas */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-gray-700">📝 Tareas Completadas</span>
                  <span className="text-2xl font-bold text-purple-600">{reporte.tareas_completadas}/5</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${(reporte.tareas_completadas / 5) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Conducta */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">😊 Conducta</span>
                  <span className={`text-2xl font-bold ${getConductaColor(reporte.conducta)}`}>
                    {getConductaEmoji(reporte.conducta)} {getConductaLabel(reporte.conducta)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {reporte.observaciones && (
            <div className="mb-6 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <h3 className="font-bold text-lg mb-2 text-gray-800">💭 Observaciones del Maestro</h3>
              <p className="text-gray-700 italic">"{reporte.observaciones}"</p>
            </div>
          )}

          {/* Pie de página */}
          <div className="mt-8 pt-4 border-t text-center text-sm text-gray-600">
            <p>Cualquier duda o comentario, estamos a sus órdenes.</p>
            <p className="font-semibold mt-2">Sistema Control Escolar Primaria</p>
            <p className="text-xs text-gray-500 mt-1">
              Generado el {new Date().toLocaleDateString('es-MX', { 
                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {/* Botones de acción (no se imprimen) */}
        <div className="p-4 border-t bg-gray-50 flex flex-wrap gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            🖨️ Imprimir PDF
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            📱 WhatsApp
          </button>
          <button
            onClick={handleCopyText}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            📋 Copiar Texto
          </button>
        </div>
      </div>

      <style jsx>{`
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}

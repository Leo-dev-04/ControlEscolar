import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export default function ReportePublico() {
    const { qrToken } = useParams()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        cargarReporte()
    }, [qrToken])

    const cargarReporte = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await fetch(`${API_URL}/reporte/${qrToken}`)
            const json = await response.json()

            if (!response.ok || !json.success) {
                setError(json.message || 'No se encontró el reporte')
                return
            }

            setData(json.data)
        } catch (err) {
            setError('Error al cargar el reporte. Verifica tu conexión.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="rp-page rp-center">
                <div className="rp-spinner" />
                <p className="rp-loading-text">Cargando reporte...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="rp-page rp-center">
                <div className="rp-error-card">
                    <div className="rp-error-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M15 9l-6 6M9 9l6 6" />
                        </svg>
                    </div>
                    <h2 className="rp-error-title">Reporte no disponible</h2>
                    <p className="rp-error-text">{error}</p>
                    <p className="rp-error-hint">Verifica que el enlace o código QR sea correcto.</p>
                </div>
            </div>
        )
    }

    const { alumno, reporte } = data
    const totalDias = (reporte.total_asistencias || 0) + (reporte.total_faltas || 0)
    const pctAsistencia = totalDias > 0 ? Math.round((reporte.total_asistencias / totalDias) * 100) : 0
    const pctTareas = reporte.total_tareas > 0 ? Math.round((reporte.tareas_entregadas / reporte.total_tareas) * 100) : 0

    const conductaTotal = (reporte.conducta_verde || 0) + (reporte.conducta_amarillo || 0) + (reporte.conducta_rojo || 0)
    const conductaColor = reporte.conducta_rojo > 0 ? 'rojo' : reporte.conducta_amarillo > 0 ? 'amarillo' : 'verde'

    const conductaConfig = {
        verde: { label: 'Excelente', color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' },
        amarillo: { label: 'Regular', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
        rojo: { label: 'Necesita mejorar', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
    }
    const conducta = conductaConfig[conductaColor]

    const fechaInicio = new Date(reporte.fecha_inicio + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    const fechaFin = new Date(reporte.fecha_fin + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })

    return (
        <div className="rp-page">
            <div className="rp-container">

                {/* Header */}
                <header className="rp-header">
                    <div className="rp-header-top">
                        <span className="rp-badge">Reporte Semanal</span>
                        <span className="rp-date">{fechaInicio} — {fechaFin}</span>
                    </div>
                    <h1 className="rp-student-name">{alumno.nombre} {alumno.apellidos}</h1>
                    <div className="rp-student-info">
                        <span>{alumno.grado}° Grado · Sección {alumno.grupo}</span>
                        {alumno.escuela && <span> · {alumno.escuela}</span>}
                    </div>
                </header>

                {/* Cards Grid */}
                <div className="rp-grid">

                    {/* Asistencia */}
                    <div className="rp-card">
                        <div className="rp-card-top">
                            <span className="rp-card-label">Asistencia</span>
                            <span className="rp-card-pct" style={{ color: pctAsistencia >= 90 ? '#059669' : pctAsistencia >= 70 ? '#d97706' : '#dc2626' }}>
                                {pctAsistencia}%
                            </span>
                        </div>
                        <div className="rp-bar-bg">
                            <div className="rp-bar-fill" style={{
                                width: `${pctAsistencia}%`,
                                backgroundColor: pctAsistencia >= 90 ? '#059669' : pctAsistencia >= 70 ? '#d97706' : '#dc2626'
                            }} />
                        </div>
                        <div className="rp-card-meta">
                            <div className="rp-stat">
                                <span className="rp-stat-num">{reporte.total_asistencias}</span>
                                <span className="rp-stat-label">Asistencias</span>
                            </div>
                            <div className="rp-stat">
                                <span className="rp-stat-num">{reporte.total_faltas}</span>
                                <span className="rp-stat-label">Faltas</span>
                            </div>
                            <div className="rp-stat">
                                <span className="rp-stat-num">{reporte.total_retardos || 0}</span>
                                <span className="rp-stat-label">Retardos</span>
                            </div>
                        </div>
                    </div>

                    {/* Tareas */}
                    <div className="rp-card">
                        <div className="rp-card-top">
                            <span className="rp-card-label">Tareas</span>
                            <span className="rp-card-pct" style={{ color: pctTareas >= 80 ? '#059669' : pctTareas >= 50 ? '#d97706' : '#dc2626' }}>
                                {reporte.tareas_entregadas}/{reporte.total_tareas}
                            </span>
                        </div>
                        <div className="rp-bar-bg">
                            <div className="rp-bar-fill" style={{
                                width: `${pctTareas}%`,
                                backgroundColor: pctTareas >= 80 ? '#059669' : pctTareas >= 50 ? '#d97706' : '#dc2626'
                            }} />
                        </div>
                        <div className="rp-card-meta">
                            <div className="rp-stat">
                                <span className="rp-stat-num">{reporte.tareas_entregadas}</span>
                                <span className="rp-stat-label">Entregadas</span>
                            </div>
                            <div className="rp-stat">
                                <span className="rp-stat-num">{(reporte.total_tareas || 0) - (reporte.tareas_entregadas || 0)}</span>
                                <span className="rp-stat-label">Pendientes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conducta */}
                <div className="rp-card rp-conducta-card" style={{ borderColor: conducta.border, backgroundColor: conducta.bg }}>
                    <div className="rp-card-top">
                        <span className="rp-card-label">Conducta</span>
                        <span className="rp-conducta-badge" style={{ backgroundColor: conducta.color }}>
                            {conducta.label}
                        </span>
                    </div>
                    <div className="rp-semaforo">
                        <div className="rp-semaforo-item">
                            <div className="rp-semaforo-dot" style={{ backgroundColor: '#059669' }}>{reporte.conducta_verde || 0}</div>
                            <span className="rp-semaforo-label">Verde</span>
                        </div>
                        <div className="rp-semaforo-item">
                            <div className="rp-semaforo-dot" style={{ backgroundColor: '#d97706' }}>{reporte.conducta_amarillo || 0}</div>
                            <span className="rp-semaforo-label">Amarillo</span>
                        </div>
                        <div className="rp-semaforo-item">
                            <div className="rp-semaforo-dot" style={{ backgroundColor: '#dc2626' }}>{reporte.conducta_rojo || 0}</div>
                            <span className="rp-semaforo-label">Rojo</span>
                        </div>
                    </div>
                </div>

                {/* Observaciones */}
                {reporte.observaciones_conducta && (
                    <div className="rp-observaciones">
                        <span className="rp-obs-label">Observaciones del maestro</span>
                        <p className="rp-obs-text">{reporte.observaciones_conducta}</p>
                    </div>
                )}

                {/* Footer */}
                <footer className="rp-footer">
                    <p className="rp-footer-school">{alumno.escuela || 'Sistema Control Escolar'}</p>
                    <p className="rp-footer-date">
                        Consultado el {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </footer>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .rp-page {
          min-height: 100vh;
          background-color: #f8fafc;
          font-family: 'Inter', -apple-system, system-ui, sans-serif;
          color: #1e293b;
          -webkit-font-smoothing: antialiased;
        }
        .rp-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        /* Spinner */
        .rp-spinner {
          width: 32px; height: 32px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: rp-spin 0.7s linear infinite;
        }
        @keyframes rp-spin { to { transform: rotate(360deg); } }
        .rp-loading-text { margin-top: 12px; color: #94a3b8; font-size: 14px; }

        /* Error */
        .rp-error-card {
          text-align: center;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px 32px;
          max-width: 380px;
        }
        .rp-error-icon { margin-bottom: 16px; }
        .rp-error-title { font-size: 18px; font-weight: 600; margin: 0 0 8px; color: #334155; }
        .rp-error-text { font-size: 14px; color: #ef4444; margin: 0 0 6px; }
        .rp-error-hint { font-size: 13px; color: #94a3b8; margin: 0; }

        /* Container */
        .rp-container {
          max-width: 460px;
          margin: 0 auto;
          padding: 0 16px 40px;
        }

        /* Header */
        .rp-header {
          padding: 28px 0 20px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 20px;
        }
        .rp-header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .rp-badge {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #3b82f6;
          background: #eff6ff;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .rp-date {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
        }
        .rp-student-name {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 4px;
          color: #0f172a;
          line-height: 1.2;
        }
        .rp-student-info {
          font-size: 13px;
          color: #64748b;
        }

        /* Grid */
        .rp-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        @media (max-width: 400px) {
          .rp-grid { grid-template-columns: 1fr; }
        }

        /* Card */
        .rp-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
        }
        .rp-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .rp-card-label {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
        }
        .rp-card-pct {
          font-size: 20px;
          font-weight: 700;
        }

        /* Progress Bar */
        .rp-bar-bg {
          height: 6px;
          background: #f1f5f9;
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 12px;
        }
        .rp-bar-fill {
          height: 6px;
          border-radius: 99px;
          transition: width 0.5s ease;
        }

        /* Stats */
        .rp-card-meta {
          display: flex;
          gap: 12px;
        }
        .rp-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }
        .rp-stat-num {
          font-size: 18px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1;
        }
        .rp-stat-label {
          font-size: 10px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-top: 2px;
          font-weight: 500;
        }

        /* Conducta */
        .rp-conducta-card {
          margin-bottom: 12px;
          border-width: 1.5px;
        }
        .rp-conducta-badge {
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          padding: 3px 10px;
          border-radius: 99px;
        }
        .rp-semaforo {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-top: 4px;
        }
        .rp-semaforo-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .rp-semaforo-dot {
          width: 36px; height: 36px;
          border-radius: 50%;
          color: #fff;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rp-semaforo-label {
          font-size: 10px;
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Observaciones */
        .rp-observaciones {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-left: 3px solid #3b82f6;
          border-radius: 0 12px 12px 0;
          padding: 14px 16px;
          margin-bottom: 12px;
        }
        .rp-obs-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          display: block;
          margin-bottom: 6px;
        }
        .rp-obs-text {
          font-size: 14px;
          color: #334155;
          line-height: 1.5;
          margin: 0;
          font-style: italic;
        }

        /* Footer */
        .rp-footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          margin-top: 8px;
        }
        .rp-footer-school {
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin: 0 0 2px;
        }
        .rp-footer-date {
          font-size: 11px;
          color: #94a3b8;
          margin: 0;
        }
      `}</style>
        </div>
    )
}

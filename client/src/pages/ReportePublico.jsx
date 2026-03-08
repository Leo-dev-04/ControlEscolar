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
            <div style={styles.loadingContainer}>
                <div style={styles.spinner} />
                <p style={styles.loadingText}>Cargando reporte...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div style={styles.errorContainer}>
                <div style={styles.errorIcon}>😕</div>
                <h2 style={styles.errorTitle}>Reporte no encontrado</h2>
                <p style={styles.errorText}>{error}</p>
                <p style={styles.errorHint}>Verifica que el enlace o código QR sea correcto.</p>
            </div>
        )
    }

    const { alumno, reporte } = data
    const totalDias = (reporte.total_asistencias || 0) + (reporte.total_faltas || 0)
    const pctAsistencia = totalDias > 0 ? Math.round((reporte.total_asistencias / totalDias) * 100) : 0
    const pctTareas = reporte.total_tareas > 0 ? Math.round((reporte.tareas_entregadas / reporte.total_tareas) * 100) : 0

    const conductaColor = reporte.conducta_rojo > 0 ? 'rojo'
        : reporte.conducta_amarillo > 0 ? 'amarillo' : 'verde'

    const conductaConfig = {
        verde: { emoji: '😊', label: 'Excelente', bg: '#d1fae5', border: '#10b981', text: '#065f46', glow: 'rgba(16,185,129,0.15)' },
        amarillo: { emoji: '😐', label: 'Regular', bg: '#fef3c7', border: '#f59e0b', text: '#92400e', glow: 'rgba(245,158,11,0.15)' },
        rojo: { emoji: '😟', label: 'Necesita mejorar', bg: '#fee2e2', border: '#ef4444', text: '#991b1b', glow: 'rgba(239,68,68,0.15)' },
    }
    const conducta = conductaConfig[conductaColor]

    const asistenciaColor = pctAsistencia >= 90 ? '#10b981' : pctAsistencia >= 70 ? '#f59e0b' : '#ef4444'
    const tareasColor = pctTareas >= 80 ? '#6366f1' : pctTareas >= 50 ? '#f59e0b' : '#ef4444'

    const fechaInicio = new Date(reporte.fecha_inicio + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
    const fechaFin = new Date(reporte.fecha_fin + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <div style={styles.page}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.headerBadge}>📚 Reporte Semanal</div>
                <h1 style={styles.headerName}>{alumno.nombre} {alumno.apellidos}</h1>
                <p style={styles.headerGrado}>{alumno.grado}° Grado · Sección {alumno.grupo}</p>
                {alumno.escuela && <p style={styles.headerEscuela}>🏫 {alumno.escuela}</p>}
                <div style={styles.headerFecha}>📅 {fechaInicio} — {fechaFin}</div>
            </div>

            {/* Contenido */}
            <div style={styles.content}>

                {/* Asistencia */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardIcon}>✅</div>
                        <span style={styles.cardLabel}>Asistencia</span>
                        <span style={{ ...styles.cardValue, color: asistenciaColor }}>{pctAsistencia}%</span>
                    </div>
                    <div style={styles.progressBg}>
                        <div style={{ ...styles.progressFill, width: `${pctAsistencia}%`, backgroundColor: asistenciaColor }} />
                    </div>
                    <p style={styles.cardDetail}>
                        {reporte.total_asistencias} asistencia{reporte.total_asistencias !== 1 ? 's' : ''} ·{' '}
                        {reporte.total_faltas} falta{reporte.total_faltas !== 1 ? 's' : ''} ·{' '}
                        {reporte.total_retardos || 0} retardo{(reporte.total_retardos || 0) !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Tareas */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardIcon}>📝</div>
                        <span style={styles.cardLabel}>Tareas</span>
                        <span style={{ ...styles.cardValue, color: tareasColor }}>
                            {reporte.tareas_entregadas}/{reporte.total_tareas}
                        </span>
                    </div>
                    <div style={styles.progressBg}>
                        <div style={{ ...styles.progressFill, width: `${pctTareas}%`, backgroundColor: tareasColor }} />
                    </div>
                    <p style={styles.cardDetail}>
                        {reporte.tareas_entregadas} entregada{reporte.tareas_entregadas !== 1 ? 's' : ''} de{' '}
                        {reporte.total_tareas} asignada{reporte.total_tareas !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Conducta */}
                <div style={{ ...styles.card, backgroundColor: conducta.bg, border: `2px solid ${conducta.border}`, boxShadow: `0 4px 16px ${conducta.glow}` }}>
                    <div style={styles.cardHeader}>
                        <div style={styles.cardIcon}>🚦</div>
                        <span style={styles.cardLabel}>Conducta</span>
                        <span style={{ fontSize: '28px' }}>{conducta.emoji}</span>
                    </div>
                    <div style={{ ...styles.conductaBadge, backgroundColor: conducta.border }}>
                        {conducta.label}
                    </div>
                    <div style={styles.semaforoRow}>
                        <div style={styles.semaforoItem}>
                            <div style={{ ...styles.semaforoCircle, backgroundColor: '#10b981' }}>{reporte.conducta_verde}</div>
                            <span style={styles.semaforoLabel}>🟢 Verde</span>
                        </div>
                        <div style={styles.semaforoItem}>
                            <div style={{ ...styles.semaforoCircle, backgroundColor: '#f59e0b' }}>{reporte.conducta_amarillo}</div>
                            <span style={styles.semaforoLabel}>🟡 Amarillo</span>
                        </div>
                        <div style={styles.semaforoItem}>
                            <div style={{ ...styles.semaforoCircle, backgroundColor: '#ef4444' }}>{reporte.conducta_rojo}</div>
                            <span style={styles.semaforoLabel}>🔴 Rojo</span>
                        </div>
                    </div>
                </div>

                {/* Observaciones */}
                {reporte.observaciones_conducta && (
                    <div style={styles.observaciones}>
                        <p style={styles.obsLabel}>💭 Observaciones del Maestro</p>
                        <p style={styles.obsText}>"{reporte.observaciones_conducta}"</p>
                    </div>
                )}

                {/* Motivacional */}
                <div style={styles.motivacional}>
                    <p style={styles.motivacionalText}>
                        ¡Gracias por su apoyo y participación en la educación de su hijo/a! 🎓
                    </p>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <p style={styles.footerSchool}>🏫 {alumno.escuela || 'Sistema Control Escolar'}</p>
                    <p style={styles.footerDate}>
                        Consultado el {new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    },
    // Loading
    loadingContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '4px solid #e2e8f0',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    loadingText: {
        marginTop: '16px',
        color: '#64748b',
        fontSize: '15px',
    },
    // Error
    errorContainer: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f1f5f9',
        padding: '24px',
        textAlign: 'center',
    },
    errorIcon: { fontSize: '56px', marginBottom: '16px' },
    errorTitle: { fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px' },
    errorText: { fontSize: '15px', color: '#ef4444', margin: '0 0 8px' },
    errorHint: { fontSize: '14px', color: '#94a3b8', margin: 0 },
    // Header
    header: {
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 60%, #2563eb 100%)',
        padding: '32px 24px 24px',
        textAlign: 'center',
        borderRadius: '0 0 24px 24px',
    },
    headerBadge: {
        display: 'inline-block',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: '10px',
        padding: '6px 16px',
        color: '#93c5fd',
        fontSize: '12px',
        fontWeight: '600',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginBottom: '12px',
    },
    headerName: {
        margin: '0 0 4px',
        color: '#fff',
        fontSize: '24px',
        fontWeight: '700',
    },
    headerGrado: {
        margin: '0',
        color: '#bfdbfe',
        fontSize: '14px',
    },
    headerEscuela: {
        margin: '6px 0 0',
        color: '#93c5fd',
        fontSize: '13px',
    },
    headerFecha: {
        marginTop: '14px',
        display: 'inline-block',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: '8px',
        padding: '8px 16px',
        color: '#e0f2fe',
        fontSize: '13px',
    },
    // Content
    content: {
        maxWidth: '480px',
        margin: '0 auto',
        padding: '20px 16px 32px',
    },
    // Card
    card: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
    },
    cardIcon: { fontSize: '22px' },
    cardLabel: { flex: 1, fontSize: '15px', fontWeight: '700', color: '#1e293b' },
    cardValue: { fontSize: '26px', fontWeight: '800' },
    progressBg: {
        height: '10px',
        backgroundColor: '#e2e8f0',
        borderRadius: '999px',
        overflow: 'hidden',
        marginBottom: '8px',
    },
    progressFill: {
        height: '10px',
        borderRadius: '999px',
        transition: 'width 0.6s ease',
    },
    cardDetail: {
        margin: 0,
        fontSize: '13px',
        color: '#64748b',
    },
    // Conducta
    conductaBadge: {
        display: 'inline-block',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '700',
        padding: '4px 14px',
        borderRadius: '999px',
        marginBottom: '14px',
    },
    semaforoRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
    },
    semaforoItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
    },
    semaforoCircle: {
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        color: '#fff',
        fontSize: '20px',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    semaforoLabel: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#475569',
    },
    // Observaciones
    observaciones: {
        backgroundColor: '#eff6ff',
        borderLeft: '4px solid #3b82f6',
        borderRadius: '0 14px 14px 0',
        padding: '16px 20px',
        marginBottom: '16px',
    },
    obsLabel: {
        margin: '0 0 6px',
        fontSize: '13px',
        fontWeight: '700',
        color: '#1d4ed8',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
    },
    obsText: {
        margin: 0,
        fontSize: '14px',
        color: '#374151',
        fontStyle: 'italic',
        lineHeight: '1.6',
    },
    // Motivacional
    motivacional: {
        background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)',
        borderRadius: '14px',
        padding: '18px 20px',
        textAlign: 'center',
        marginBottom: '20px',
    },
    motivacionalText: {
        margin: 0,
        color: '#4f46e5',
        fontSize: '14px',
        fontWeight: '600',
    },
    // Footer
    footer: {
        textAlign: 'center',
        paddingTop: '16px',
        borderTop: '1px solid #e2e8f0',
    },
    footerSchool: {
        margin: '0 0 4px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#475569',
    },
    footerDate: {
        margin: 0,
        fontSize: '12px',
        color: '#94a3b8',
    },
}

// CSS animation for spinner
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
`
document.head.appendChild(styleSheet)

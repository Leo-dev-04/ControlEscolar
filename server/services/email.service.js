const { Resend } = require('resend');
require('dotenv').config();
const logger = require('../utils/logger');

// Configurar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Flag de disponibilidad del servicio de email
let emailDisponible = false;

// Verificar configuración
(async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      logger.warn('⚠️ RESEND_API_KEY no configurada. Los reportes no se enviarán por correo.');
      return;
    }
    emailDisponible = true;
    logger.info('✅ Servicio de email (Resend) configurado correctamente');
  } catch (error) {
    logger.warn('⚠️ Error configurando Resend:', { message: error.message });
  }
})();

/**
 * Verificar si el servicio de email está disponible
 */
function isEmailDisponible() {
  return emailDisponible;
}

// Función para enviar reporte individual
async function enviarReporteIndividual(alumno, reporte, parentEmail) {
  try {
    if (!emailDisponible) {
      logger.warn(`Email no disponible, no se puede enviar a ${parentEmail}`);
      return { success: false, error: 'Servicio de email no disponible' };
    }

    const htmlContent = generarHTMLReporte(alumno, reporte);
    const fromEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: `${process.env.SCHOOL_NAME || 'Control Escolar'} <${fromEmail}>`,
      to: [parentEmail],
      subject: `📚 Reporte Semanal - ${alumno.nombre} ${alumno.apellidos}`,
      html: htmlContent
    });

    if (error) {
      logger.error(`❌ Error enviando email a ${parentEmail}:`, error);
      return { success: false, error: error.message };
    }

    logger.info(`✅ Email enviado a ${parentEmail}: ${data.id}`);
    return { success: true, messageId: data.id };

  } catch (error) {
    logger.error(`❌ Error enviando email a ${parentEmail}:`, { message: error.message });
    return { success: false, error: error.message };
  }
}

// Función para enviar reportes masivos
async function enviarReportesMasivos(reportes) {
  const resultados = [];

  for (const reporte of reportes) {
    const resultado = await enviarReporteIndividual(
      reporte.alumno,
      reporte.datos,
      reporte.parent_email
    );

    resultados.push({
      alumno_id: reporte.alumno.id,
      email: reporte.parent_email,
      reporte_id: reporte.reporte_id,
      ...resultado
    });

    // Pequeña pausa entre envíos (Resend tiene rate limit de 2/segundo en free)
    await new Promise(resolve => setTimeout(resolve, 600));
  }

  return resultados;
}

// Generar HTML del reporte
function generarHTMLReporte(alumno, reporte) {
  const totalDias = (reporte.total_asistencias || 0) + (reporte.total_faltas || 0);
  const pctAsistencia = totalDias > 0
    ? Math.round((reporte.total_asistencias / totalDias) * 100)
    : 0;
  const pctTareas = reporte.total_tareas > 0
    ? Math.round((reporte.tareas_entregadas / reporte.total_tareas) * 100)
    : 0;

  const conductaColor = reporte.conducta_rojo > 0 ? 'rojo'
    : reporte.conducta_amarillo > 0 ? 'amarillo' : 'verde';

  const conductaConfig = {
    verde: { emoji: '😊', label: 'Excelente Conducta', bg: '#d1fae5', border: '#10b981', text: '#065f46' },
    amarillo: { emoji: '😐', label: 'Conducta Regular', bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    rojo: { emoji: '😟', label: 'Conducta a Mejorar', bg: '#fee2e2', border: '#ef4444', text: '#991b1b' },
  };
  const conducta = conductaConfig[conductaColor];

  const asistenciaColor = pctAsistencia >= 90 ? '#10b981' : pctAsistencia >= 70 ? '#f59e0b' : '#ef4444';
  const tareasColor = pctTareas >= 80 ? '#6366f1' : pctTareas >= 50 ? '#f59e0b' : '#ef4444';

  const schoolName = process.env.SCHOOL_NAME || 'Control Escolar Primaria';
  const fechaInicio = new Date(reporte.fecha_inicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'long' });
  const fechaFin = new Date(reporte.fecha_fin).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Semanal – ${alumno.nombre} ${alumno.apellidos}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- ── HEADER ─────────────────────────────────────────── -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 60%,#2563eb 100%);
                     border-radius:16px 16px 0 0;padding:36px 40px 28px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);
                        border-radius:12px;padding:10px 20px;margin-bottom:16px;">
              <span style="color:#93c5fd;font-size:13px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">
                📚 Reporte Semanal de Desempeño
              </span>
            </div>
            <h1 style="margin:0 0 6px;color:#ffffff;font-size:26px;font-weight:700;">
              ${alumno.nombre} ${alumno.apellidos}
            </h1>
            <p style="margin:0;color:#bfdbfe;font-size:15px;">
              ${alumno.grado}° Grado &nbsp;·&nbsp; Sección ${alumno.grupo || alumno.seccion || ''}
            </p>
            <div style="margin-top:18px;background:rgba(255,255,255,0.12);
                        border-radius:8px;padding:10px 20px;display:inline-block;">
              <span style="color:#e0f2fe;font-size:13px;">📅 Semana del ${fechaInicio} al ${fechaFin}</span>
            </div>
          </td>
        </tr>

        <!-- ── CARD PRINCIPAL ─────────────────────────────────── -->
        <tr>
          <td style="background:#ffffff;padding:32px 40px;">

            <!-- Saludo -->
            <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.6;">
              Estimado/a <strong>${alumno.parent_nombre || 'padre/tutor'}</strong>,<br>
              a continuación el resumen del desempeño de su hijo/a durante esta semana:
            </p>

            <!-- ── ASISTENCIA ── -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="font-size:22px;">✅</span>
                        <span style="font-size:15px;font-weight:700;color:#1e293b;margin-left:8px;">Asistencia</span>
                      </td>
                      <td align="right">
                        <span style="font-size:28px;font-weight:800;color:${asistenciaColor};">${pctAsistencia}%</span>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top:4px;">
                        <p style="margin:0 0 10px;color:#64748b;font-size:13px;">
                          ${reporte.total_asistencias} asistencia${reporte.total_asistencias !== 1 ? 's' : ''}
                          · ${reporte.total_faltas} falta${reporte.total_faltas !== 1 ? 's' : ''}
                          · ${reporte.total_retardos || 0} retardo${(reporte.total_retardos || 0) !== 1 ? 's' : ''}
                          de ${totalDias} días
                        </p>
                        <!-- Barra de progreso -->
                        <div style="background:#e2e8f0;border-radius:999px;height:10px;overflow:hidden;">
                          <div style="background:${asistenciaColor};height:10px;width:${pctAsistencia}%;border-radius:999px;"></div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- ── TAREAS ── -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="font-size:22px;">📝</span>
                        <span style="font-size:15px;font-weight:700;color:#1e293b;margin-left:8px;">Tareas</span>
                      </td>
                      <td align="right">
                        <span style="font-size:28px;font-weight:800;color:${tareasColor};">${pctTareas}%</span>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top:4px;">
                        <p style="margin:0 0 10px;color:#64748b;font-size:13px;">
                          ${reporte.tareas_entregadas} entregada${reporte.tareas_entregadas !== 1 ? 's' : ''}
                          de ${reporte.total_tareas} tarea${reporte.total_tareas !== 1 ? 's' : ''} asignada${reporte.total_tareas !== 1 ? 's' : ''}
                        </p>
                        <div style="background:#e2e8f0;border-radius:999px;height:10px;overflow:hidden;">
                          <div style="background:${tareasColor};height:10px;width:${pctTareas}%;border-radius:999px;"></div>
                        </div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- ── CONDUCTA ── -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:${conducta.bg};border:2px solid ${conducta.border};
                           border-radius:12px;padding:20px 24px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <span style="font-size:22px;">🚦</span>
                        <span style="font-size:15px;font-weight:700;color:#1e293b;margin-left:8px;">Conducta</span>
                      </td>
                      <td align="right">
                        <span style="font-size:32px;">${conducta.emoji}</span>
                      </td>
                    </tr>
                    <tr>
                      <td colspan="2" style="padding-top:10px;">
                        <span style="display:inline-block;background:${conducta.border};color:#fff;
                                     font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;
                                     margin-bottom:12px;">
                          ${conducta.label}
                        </span>
                        <!-- Semáforo de días -->
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-right:16px;text-align:center;">
                              <div style="background:#10b981;color:#fff;font-size:22px;font-weight:800;
                                         width:46px;height:46px;border-radius:50%;display:inline-flex;
                                         align-items:center;justify-content:center;line-height:46px;">
                                ${reporte.conducta_verde}
                              </div>
                              <br><span style="font-size:11px;color:#065f46;font-weight:600;">🟢 Verde</span>
                            </td>
                            <td style="padding-right:16px;text-align:center;">
                              <div style="background:#f59e0b;color:#fff;font-size:22px;font-weight:800;
                                         width:46px;height:46px;border-radius:50%;display:inline-flex;
                                         align-items:center;justify-content:center;line-height:46px;">
                                ${reporte.conducta_amarillo}
                              </div>
                              <br><span style="font-size:11px;color:#92400e;font-weight:600;">🟡 Amarillo</span>
                            </td>
                            <td style="text-align:center;">
                              <div style="background:#ef4444;color:#fff;font-size:22px;font-weight:800;
                                         width:46px;height:46px;border-radius:50%;display:inline-flex;
                                         align-items:center;justify-content:center;line-height:46px;">
                                ${reporte.conducta_rojo}
                              </div>
                              <br><span style="font-size:11px;color:#991b1b;font-weight:600;">🔴 Rojo</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${reporte.observaciones_conducta ? `
            <!-- ── OBSERVACIONES ── -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 12px 12px 0;
                           padding:16px 20px;">
                  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1d4ed8;
                            text-transform:uppercase;letter-spacing:0.5px;">💭 Observaciones del Maestro</p>
                  <p style="margin:0;font-size:14px;color:#374151;font-style:italic;line-height:1.6;">
                    "${reporte.observaciones_conducta}"
                  </p>
                </td>
              </tr>
            </table>` : ''}

            <!-- Mensaje motivacional -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:linear-gradient(135deg,#eff6ff,#f5f3ff);border-radius:12px;
                           padding:18px 24px;text-align:center;">
                  <p style="margin:0;color:#4f46e5;font-size:14px;font-weight:600;">
                    ¡Gracias por su apoyo y participación en la educación de su hijo/a! 🎓
                  </p>
                </td>
              </tr>
            </table>

          </td><!-- /card -->
        </tr>

        <!-- ── FOOTER ─────────────────────────────────────────── -->
        <tr>
          <td style="background:#1e293b;border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 6px;color:#94a3b8;font-size:13px;">
              Este mensaje fue generado automáticamente. Por favor no responda a este correo.
            </p>
            <p style="margin:0 0 12px;color:#64748b;font-size:12px;">
              Si tiene preguntas, comuníquese directamente con la escuela.
            </p>
            <p style="margin:0;color:#475569;font-size:14px;font-weight:600;">
              🏫 ${schoolName}
            </p>
          </td>
        </tr>

      </table><!-- /email -->
    </td></tr>
  </table><!-- /wrapper -->
</body>
</html>`;
}


module.exports = {
  enviarReporteIndividual,
  enviarReportesMasivos,
  isEmailDisponible
};

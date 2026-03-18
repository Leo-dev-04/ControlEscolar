import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  /* ━━━━━━━━━━━  ROOT  ━━━━━━━━━━━ */
  .lr {
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    display: flex;
    position: relative;
    overflow: hidden;
    background: #0a0f2e;
  }

  /* ━━━━━━━━━━━  PANEL IZQUIERDO (decorativo)  ━━━━━━━━━━━ */
  .lr-left {
    display: none;
    position: relative;
    flex: 1;
    background: linear-gradient(160deg, #0d1440 0%, #0a1628 50%, #05101f 100%);
    overflow: hidden;
  }
  @media (min-width: 900px) { .lr-left { display: flex; flex-direction: column; justify-content: center; padding: 3rem; } }

  /* líneas diagonales de fondo */
  .lr-left::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      repeating-linear-gradient(
        -45deg,
        transparent,
        transparent 40px,
        rgba(255,255,255,0.022) 40px,
        rgba(255,255,255,0.022) 41px
      );
  }

  /* aros decorativos */
  .lr-ring {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(99,179,237,0.12);
  }
  .lr-ring-1 { width:480px; height:480px; top:-100px; left:-100px; }
  .lr-ring-2 { width:340px; height:340px; top:60px; left:-60px; border-color:rgba(99,179,237,0.07); }
  .lr-ring-3 { width:260px; height:260px; bottom:-60px; right:-80px; border-color:rgba(147,197,253,0.1); }

  /* blobs de luz */
  .lr-blob {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
  }
  .lr-blob-1 { width:320px; height:320px; top:-80px; right:0; background:rgba(37,99,235,0.25); }
  .lr-blob-2 { width:220px; height:220px; bottom:60px; left:20px; background:rgba(99,179,237,0.12); }

  .lr-brand { position: relative; z-index: 1; color: #fff; }

  .lr-brand-badge {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    background: rgba(99,179,237,0.15);
    border: 1px solid rgba(99,179,237,0.3);
    border-radius: 20px;
    padding: .35rem .9rem;
    font-size: .75rem;
    font-weight: 600;
    color: #93c5fd;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 1.75rem;
  }

  .lr-brand-title {
    font-size: 2.4rem;
    font-weight: 800;
    line-height: 1.15;
    margin: 0 0 1rem;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #fff 40%, #93c5fd 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .lr-brand-desc {
    font-size: .95rem;
    color: rgba(255,255,255,0.5);
    line-height: 1.7;
    max-width: 300px;
    margin: 0 0 2.5rem;
  }

  .lr-stats { display: flex; gap: 1.5rem; }
  .lr-stat  { display: flex; flex-direction: column; }
  .lr-stat-num { font-size: 1.5rem; font-weight: 700; color: #fff; }
  .lr-stat-lbl {
    font-size: .7rem;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: .06em;
  }

  /* ━━━━━━━━━━━  PANEL DERECHO (formulario)  ━━━━━━━━━━━ */
  .lr-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    background: #f0f4f8;
    width: 100%;
    position: relative;
  }
  @media (min-width: 900px) { .lr-right { width: 480px; flex-shrink: 0; } }

  /* textura punteada suave */
  .lr-right::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(30,64,175,0.06) 1px, transparent 1px);
    background-size: 22px 22px;
    pointer-events: none;
  }

  /* ━━━━━━━━━━━  CARD  ━━━━━━━━━━━ */
  .lr-card {
    position: relative;
    z-index: 1;
    background: #ffffff;
    border-radius: 20px;
    box-shadow:
      0 2px 4px rgba(0,0,0,0.04),
      0 12px 40px rgba(30,64,175,0.12),
      0 0 0 1px rgba(30,64,175,0.07);
    padding: 2.25rem 2rem;
    width: 100%;
    max-width: 380px;
    animation: lrSlideIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes lrSlideIn {
    from { opacity:0; transform: translateY(20px); }
    to   { opacity:1; transform: translateY(0); }
  }

  .lr-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px; height: 56px;
    background: linear-gradient(135deg, #1e40af, #2563eb);
    border-radius: 14px;
    margin: 0 auto 1.1rem;
    box-shadow: 0 6px 18px rgba(37,99,235,0.38);
  }

  .lr-card-title {
    font-size: 1.45rem;
    font-weight: 700;
    color: #0f172a;
    text-align: center;
    margin: 0 0 .25rem;
    letter-spacing: -.2px;
  }

  .lr-card-sub {
    font-size: .8125rem;
    color: #64748b;
    text-align: center;
    margin: 0 0 1.5rem;
  }

  .lr-divider {
    height: 1px;
    background: linear-gradient(90deg,transparent,#e2e8f0,transparent);
    margin-bottom: 1.5rem;
  }

  /* ── inputs ── */
  .lr-group { margin-bottom: 1.1rem; }
  .lr-label {
    display: block;
    font-size: .78rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: .4rem;
    letter-spacing:.01em;
  }
  .lr-field { position: relative; }
  .lr-input {
    width: 100%;
    padding: .72rem .875rem .72rem 2.6rem;
    border: 1.5px solid #cbd5e1;
    border-radius: 10px;
    font-size: .9rem;
    font-family: 'Inter', sans-serif;
    color: #0f172a;
    background: #f8fafc;
    outline: none;
    transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .lr-input::placeholder { color: #94a3b8; font-weight:300; }
  .lr-input:focus {
    border-color: #2563eb;
    background: #fff;
    box-shadow: 0 0 0 3px rgba(37,99,235,.13);
  }
  .lr-input:disabled { opacity:.6; cursor:not-allowed; }

  .lr-ico {
    position:absolute; left:12px; top:50%;
    transform:translateY(-50%);
    color:#94a3b8;
    transition:color .2s;
    pointer-events:none;
    display:flex;
  }
  .lr-field:focus-within .lr-ico { color:#2563eb; }

  .lr-toggle {
    position:absolute; right:12px; top:50%;
    transform:translateY(-50%);
    color:#94a3b8;
    background:none; border:none; padding:0;
    cursor:pointer; display:flex;
    transition:color .2s;
  }
  .lr-toggle:hover { color:#64748b; }
  .lr-toggle:focus { outline:none; color:#2563eb; }


  /* ── error ── */
  .lr-error {
    display:flex; align-items:flex-start; gap:.6rem;
    background:#fff1f2;
    border:1px solid #fecdd3;
    border-left:3px solid #ef4444;
    border-radius:9px;
    padding:.65rem .9rem;
    margin-bottom:1rem;
    animation:lrShake .35s ease;
  }
  @keyframes lrShake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-4px)}
    40%{transform:translateX(4px)}
    60%{transform:translateX(-3px)}
    80%{transform:translateX(3px)}
  }
  .lr-error p { font-size:.78rem; color:#9f1239; margin:0; line-height:1.5; }

  /* ── botón ── */
  .lr-btn {
    width:100%;
    padding:.8rem;
    background:linear-gradient(135deg,#1e40af 0%,#2563eb 100%);
    color:#fff;
    font-size:.9rem;
    font-weight:600;
    font-family:'Inter',sans-serif;
    border:none;
    border-radius:10px;
    cursor:pointer;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:.45rem;
    transition:transform .17s ease, box-shadow .17s ease, opacity .2s;
    box-shadow:0 4px 14px rgba(37,99,235,.38);
    margin-top:.2rem;
    position:relative;
    overflow:hidden;
    letter-spacing:.01em;
  }
  .lr-btn::after {
    content:'';
    position:absolute; inset:0;
    background:linear-gradient(135deg,rgba(255,255,255,.14) 0%,transparent 55%);
    pointer-events:none;
  }
  .lr-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 22px rgba(37,99,235,.42); }
  .lr-btn:active:not(:disabled){ transform:translateY(0); box-shadow:0 2px 8px rgba(37,99,235,.28); }
  .lr-btn:disabled { opacity:.68; cursor:not-allowed; }

  .lr-spin {
    width:16px; height:16px;
    border:2px solid rgba(255,255,255,.3);
    border-top-color:#fff;
    border-radius:50%;
    animation:spin .7s linear infinite;
    flex-shrink:0;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  /* ── seguridad ── */
  .lr-sec {
    display:flex; align-items:center; justify-content:center; gap:.35rem;
    margin-top:1.4rem; padding-top:1.1rem;
    border-top:1px solid #f1f5f9;
  }
  .lr-sec span { font-size:.7rem; color:#94a3b8; }

  /* ── versión ── */
  .lr-ver { margin-top:1.25rem; text-align:center; font-size:.7rem; color:#94a3b8; }
`

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const resultado = await login(email, password)
      if (resultado.success) {
        navigate('/')
      } else {
        setError(resultado.message || 'Credenciales inválidas')
      }
    } catch {
      setError('Error de conexión. Verifica que el servidor esté corriendo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="lr">

        {/* ══════════  PANEL IZQUIERDO  ══════════ */}
        <div className="lr-left">
          <div className="lr-ring lr-ring-1" />
          <div className="lr-ring lr-ring-2" />
          <div className="lr-ring lr-ring-3" />
          <div className="lr-blob lr-blob-1" />
          <div className="lr-blob lr-blob-2" />

          {/* Ilustración SVG de fondo */}
          <svg
            style={{ position: 'absolute', bottom: 0, right: 0, width: '60%', opacity: .06 }}
            viewBox="0 0 400 400" fill="none" aria-hidden="true"
          >
            <rect x="20" y="20" width="360" height="360" rx="40" stroke="white" strokeWidth="2" />
            <rect x="60" y="60" width="280" height="280" rx="20" stroke="white" strokeWidth="1" />
            <line x1="60" y1="120" x2="340" y2="120" stroke="white" strokeWidth="1" />
            <line x1="60" y1="180" x2="340" y2="180" stroke="white" strokeWidth="1" />
            <line x1="60" y1="240" x2="340" y2="240" stroke="white" strokeWidth="1" />
            <line x1="140" y1="60" x2="140" y2="340" stroke="white" strokeWidth="1" />
            <line x1="220" y1="60" x2="220" y2="340" stroke="white" strokeWidth="1" />
            <circle cx="200" cy="200" r="60" stroke="white" strokeWidth="2" />
          </svg>

          <div className="lr-brand">
            <div className="lr-brand-badge">
              <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
              </svg>
              Sector Educativo
            </div>

            <h1 className="lr-brand-title">Sistema de<br />Control Escolar</h1>
            <p className="lr-brand-desc">
              Plataforma institucional para la gestión académica,
              asistencia y seguimiento de alumnos de nivel primaria.
            </p>

            <div className="lr-stats">
              <div className="lr-stat">
                <span className="lr-stat-num">360°</span>
                <span className="lr-stat-lbl">Gestión integral</span>
              </div>
              <div className="lr-stat">
                <span className="lr-stat-num">100%</span>
                <span className="lr-stat-lbl">Seguro</span>
              </div>
              <div className="lr-stat">
                <span className="lr-stat-num">24/7</span>
                <span className="lr-stat-lbl">Disponible</span>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════  PANEL DERECHO  ══════════ */}
        <div className="lr-right">
          <div className="lr-card">

            {/* Logo */}
            <div className="lr-logo">
              <svg width="26" height="26" fill="none" stroke="#fff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>

            <h2 className="lr-card-title">Bienvenido</h2>
            <p className="lr-card-sub">Inicia sesión con tus credenciales institucionales</p>
            <div className="lr-divider" />

            {/* Error */}
            {error && (
              <div className="lr-error">
                <svg width="14" height="14" fill="none" stroke="#ef4444" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '1px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>{error}</p>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
              <div className="lr-group">
                <label htmlFor="email" className="lr-label">Correo Electrónico</label>
                <div className="lr-field">
                  <input
                    id="email" type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    required className="lr-input"
                    placeholder="usuario@escuela.edu.mx"
                    disabled={loading} autoComplete="email"
                  />
                  <span className="lr-ico">
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                </div>
              </div>

              <div className="lr-group">
                <label htmlFor="password" className="lr-label">Contraseña</label>
                <div className="lr-field">
                  <input
                    id="password" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    required className="lr-input"
                    placeholder="••••••••"
                    disabled={loading} autoComplete="current-password"
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <span className="lr-ico">
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <button 
                    type="button" 
                    className="lr-toggle" 
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="lr-btn">
                {loading ? (
                  <><span className="lr-spin" />&nbsp;Verificando...</>
                ) : (
                  <>
                    <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Iniciar Sesión
                  </>
                )}
              </button>
            </form>

            {/* Seguridad */}
            <div className="lr-sec">
              <svg width="12" height="12" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Conexión cifrada · Solo personal autorizado</span>
            </div>
          </div>

          <p className="lr-ver">Control Escolar &nbsp;·&nbsp; v2.0 &nbsp;·&nbsp; {new Date().getFullYear()}</p>
        </div>

      </div>
    </>
  )
}

export default Login

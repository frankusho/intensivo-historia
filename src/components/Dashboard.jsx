import React, { useMemo } from 'react';
import avatarImg from '../assets/avatar.png';

const DIAS = ['L','M','M','J','V','S','D'];

const MENSAJES = [
  "Pequeños pasos todos los días te llevan a grandes resultados. Confía en el proceso. 💜",
  "Cada flashcard que estudias es un paso más hacia tu sueño. ¡Sigue así! ✨",
  "Tú puedes con esto y más. La PAES no sabe lo preparada que estás. 🌟",
  "El esfuerzo de hoy es el orgullo de mañana. ¡Vamos! 💪",
];

// Gráfico de línea simple SVG
function LineChart({ progress }) {
  const historial = progress.simuladores?.historial || [];
  const data = historial.length > 0
    ? historial.slice(-7).map(h => h.puntaje)
    : [10, 20, 35, 40, 55, 65, Math.round((progress.dominioTotal || 0) * 100)];

  const w = 320, h = 100;
  const max = 100, min = 0;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 20) + 10;
    const y = h - ((v - min) / (max - min)) * (h - 20) - 10;
    return { x, y, v };
  });

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const lastPt = pts[pts.length - 1];

  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 110 }}>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(v => {
          const y = h - ((v - min) / (max - min)) * (h - 20) - 10;
          return (
            <g key={v}>
              <line x1="10" y1={y} x2={w - 10} y2={y} stroke="#E2E8F0" strokeWidth="1" />
              <text x="2" y={y + 3} fontSize="8" fill="#9CA3AF">{v}%</text>
            </g>
          );
        })}
        {/* Line */}
        <path d={pathD} fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Area */}
        <path
          d={`${pathD} L ${pts[pts.length-1].x} ${h-10} L ${pts[0].x} ${h-10} Z`}
          fill="url(#grad)" opacity=".15"
        />
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#6366F1" />
        ))}
        {/* Last value bubble */}
        {lastPt && (
          <g>
            <rect x={lastPt.x - 18} y={lastPt.y - 20} width="36" height="18" rx="9" fill="#6366F1" />
            <text x={lastPt.x} y={lastPt.y - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="white">
              {lastPt.v}%
            </text>
          </g>
        )}
      </svg>
      {/* X axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginTop: -4 }}>
        {data.map((_, i) => {
          const d = new Date(Date.now() - (data.length - 1 - i) * 86400000);
          return (
            <span key={i} style={{ fontSize: 10, color: 'var(--muted)' }}>
              {i === data.length - 1 ? 'Hoy' : `${d.getDate()} Jun`}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default function Dashboard({
  temas, progress, dominioTotal, dominioPorTema,
  onGoTema, onGoFlashcards, onGoRuta, onGoLogros,
  onGoSimulador, onGoMiniEnsayo,
}) {
  const totalMC = useMemo(() => temas.reduce((s, t) => s + t.conceptos.flatMap(c => c.microconceptos).length, 0), [temas]);
  const mcVistos = Object.keys(progress.flashcards).length;
  const quizzesTotal = Object.values(progress.quizzes).reduce((s, q) => s + q.intentos, 0);
  const diasParaPaes = useMemo(() => {
    const paes = new Date('2026-06-17T08:00:00');
    return Math.max(0, Math.ceil((paes - new Date()) / 86400000));
  }, []);

  const mensaje = MENSAJES[new Date().getDay() % MENSAJES.length];

  // Racha semanal
  const hoy = new Date().getDay(); // 0=dom
  const diaIdx = hoy === 0 ? 6 : hoy - 1; // lunes=0

  // Misiones
  const misionFlashcards = Math.min(mcVistos, 20);
  const misionQuiz = quizzesTotal > 0 ? 1 : 0;
  const misionEnsayo = (progress.miniEnsayos?.realizados || 0) > 0 ? 1 : 0;
  const misionPct = Math.round(((misionFlashcards / 20) + misionQuiz + misionEnsayo) / 3 * 100);

  // Top 5 temas
  const topTemas = temas.slice(0, 5);

  // Primer logro desbloqueado
  const primerLogro = progress.logros.length > 0 ? progress.logros[0] : null;

  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', minHeight: '100vh' }}>
      {/* ── Columna central ─────────────────────────────────── */}
      <div style={{ padding: '28px 24px', overflowY: 'auto' }}>

        {/* Header con avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 28 }}>
          <div style={{
            width: 130, height: 130, borderRadius: '50%',
            overflow: 'hidden', flexShrink: 0,
            border: '4px solid var(--accent)',
            boxShadow: '0 6px 28px rgba(99,102,241,.25)',
          }}>
            <img src={avatarImg} alt="Memita" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, marginBottom: 6, letterSpacing: '-.5px' }}>
              ¡Hola Memita! 💜
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text)', marginBottom: 5, fontWeight: 500 }}>
              Faltan <strong style={{ color: 'var(--accent)', fontWeight: 800 }}>{diasParaPaes} {diasParaPaes === 1 ? 'día' : 'días'}</strong> para la PAES 2026
            </p>
            <p style={{ fontSize: 14, color: 'var(--accent2)', fontStyle: 'italic', fontWeight: 500 }}>
              Tú puedes y lo vas a lograr ✨
            </p>
          </div>
        </div>

        {/* Stats 4 cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { icon: '🃏', label: 'Flashcards', value: mcVistos, total: totalMC, sub: `de ${totalMC}` },
            { icon: '🎯', label: 'Quizzes', value: quizzesTotal, total: null, sub: 'completados' },
            { icon: '🔥', label: 'Racha actual', value: progress.racha, total: null, sub: progress.racha === 1 ? 'día' : 'días' },
            { icon: '📖', label: 'Temas vistos', value: progress.temas_vistos.length, total: temas.length, sub: `de ${temas.length}` },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.04em', marginBottom: 4 }}>{s.label.toUpperCase()}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1, marginBottom: 3 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500, marginBottom: 8 }}>{s.sub}</div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{
                  width: s.total ? `${(s.value / s.total) * 100}%` : '100%'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Grid 2 columnas: misión + progreso */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Misión del día */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Misión del día</span>
            </div>
            <div className="mision-item">
              <div className={`mision-check${misionFlashcards >= 20 ? ' done' : ''}`}>
                {misionFlashcards >= 20 && '✓'}
              </div>
              <span className="mision-label">20 Flashcards</span>
              <span className="mision-count">{misionFlashcards} / 20</span>
            </div>
            <div className="mision-item">
              <div className={`mision-check${misionQuiz ? ' done' : ''}`}>
                {misionQuiz ? '✓' : ''}
              </div>
              <span className="mision-label">1 Quiz por tema</span>
              <span className="mision-count">{misionQuiz} / 1</span>
            </div>
            <div className="mision-item">
              <div className={`mision-check${misionEnsayo ? ' done' : ''}`}>
                {misionEnsayo ? '✓' : ''}
              </div>
              <span className="mision-label">1 Mini Ensayo</span>
              <span className="mision-count">{misionEnsayo} / 1</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 10 }}>
              <div style={{ position: 'relative', width: 72, height: 72 }}>
                <svg viewBox="0 0 72 72" style={{ width: 72, height: 72, transform: 'rotate(-90deg)' }}>
                  <circle cx="36" cy="36" r="28" fill="none" stroke="#E2E8F0" strokeWidth="8" />
                  <circle cx="36" cy="36" r="28" fill="none" stroke="var(--accent)" strokeWidth="8"
                    strokeDasharray={`${(misionPct / 100) * 175.9} 175.9`} strokeLinecap="round" />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: 'var(--accent)' }}>{misionPct}%</div>
                  <div style={{ fontSize: 8, color: 'var(--muted)', fontWeight: 600 }}>completado</div>
                </div>
              </div>
            </div>
            <div style={{
              background: 'var(--yellow-dim)', borderRadius: 10, padding: '8px 12px',
              fontSize: 13, color: '#92400E', fontWeight: 600, marginTop: 10,
            }}>
              ⭐ ¡Vas increíble! Sigue así 💜
            </div>
          </div>

          {/* Gráfico de progreso */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>📈</span>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Tu progreso</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Tu camino hasta la PAES</p>
            <LineChart progress={progress} />
          </div>
        </div>

        {/* Grid 2 columnas: racha + logros */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Racha */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
              Racha actual 🔥
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                {progress.racha}
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
                {progress.racha === 1 ? 'día' : 'días'}
              </span>
              <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 4 }}>
                ¡Sigue así!<br />Cada día cuenta.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {DIAS.map((d, i) => {
                const done = i < diaIdx;
                const today = i === diaIdx;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 600 }}>{d}</span>
                    <div className={`dia-circle${done ? ' done' : today ? ' today' : ' pending'}`}>
                      {(done || today) && '✓'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Logros */}
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>🏆 Logros</div>
              <button onClick={onGoLogros} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Ver todos →
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
              {progress.logros.length} / 8 desbloqueados
            </div>
            <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ height: '100%', width: `${(progress.logros.length / 8) * 100}%`, background: 'var(--accent)', borderRadius: 99 }} />
            </div>
            {/* Primer logro */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', background: 'var(--accent-dim)', borderRadius: 10 }}>
              <span style={{ fontSize: 28 }}>🌱</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Primeros pasos</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>Completaste tu primera flashcard</div>
              </div>
              <div style={{
                marginLeft: 'auto', width: 22, height: 22, borderRadius: '50%',
                background: progress.logros.length > 0 ? 'var(--accent)' : 'var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 12,
              }}>
                {progress.logros.length > 0 ? '✓' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Panel derecho ────────────────────────────────────── */}
      <div style={{
        background: 'var(--card)', borderLeft: '1px solid var(--border)',
        padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 20,
        overflowY: 'auto',
      }}>
        {/* Días para la PAES */}
        <div style={{
          background: 'var(--accent-dim)', border: '1px solid var(--border)',
          borderRadius: 16, padding: '16px 18px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.06em', marginBottom: 4 }}>
            FALTAN PARA LA PAES
          </div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 52, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
            {diasParaPaes}
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>días</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Confía en ti. Tú puedes. 💜</div>
        </div>

        {/* Dominio global */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative', width: 36, height: 36 }}>
                <svg viewBox="0 0 36 36" style={{ width: 36, height: 36, transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--accent)" strokeWidth="4"
                    strokeDasharray={`${dominioTotal * 87.96} 87.96`} strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Dominio global</span>
            </div>
            <button onClick={onGoRuta} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Ver todos ({temas.length}) →
            </button>
          </div>

          {/* Top 5 temas */}
          <div>
            {topTemas.map((tema, idx) => {
              const dom = dominioPorTema[tema.id] ?? 0;
              const mcs = tema.conceptos.flatMap(c => c.microconceptos);
              const faciles = mcs.filter(m => progress.flashcards[m.id] === 'facil').length;
              return (
                <div key={tema.id} className="ruta-item" onClick={() => onGoTema(tema)}>
                  <div className="ruta-num">{idx + 1}</div>
                  <div className="ruta-icon">{tema.icono}</div>
                  <div className="ruta-info">
                    <div className="ruta-name">{tema.titulo}</div>
                    <div className="ruta-sub">{faciles} / {mcs.length}</div>
                    <div className="progress-bar" style={{ marginTop: 3, height: 4 }}>
                      <div className="progress-bar-fill" style={{ width: `${dom * 100}%`, height: 4 }} />
                    </div>
                  </div>
                  <div className="ruta-pct">{Math.round(dom * 100)}%</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={onGoRuta}
            style={{
              width: '100%', marginTop: 12, padding: '10px',
              background: 'none', border: '1.5px solid var(--border)',
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              color: 'var(--accent)', cursor: 'pointer',
              transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Ver los {temas.length} temas →
          </button>
        </div>

        {/* Mensaje del día */}
        <div style={{
          background: 'var(--accent-dim)', borderRadius: 14,
          padding: '14px 16px', border: '1px solid var(--border)',
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', marginBottom: 6 }}>
            Mensaje del día ✨
          </div>
          <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5, margin: 0 }}>
            {mensaje}
          </p>
        </div>
      </div>

      {/* Bottom nav móvil */}
      <nav className="bottom-nav">
        {[
          { icon: '🏠', label: 'Inicio', action: null },
          { icon: '🗺️', label: 'Ruta', action: onGoRuta },
          { icon: '🃏', label: 'Flashcards', action: () => onGoFlashcards(temas[0]) },
          { icon: '🏆', label: 'Logros', action: onGoLogros },
        ].map(item => (
          <button key={item.label} className={`bottom-nav-item${!item.action ? ' active' : ''}`} onClick={item.action}>
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

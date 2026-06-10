// ─────────────────────────────────────────────────────────────
// components/SimuladorPAES.jsx
// ─────────────────────────────────────────────────────────────
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BackButton } from './shared';
import { buildSimulador, calcResultado, EJE_LABELS } from '../engine/evaluacion';

const TIEMPO_OPCIONES = [
  { label: 'Sin límite', value: 0 },
  { label: '45 min',     value: 45 * 60 },
  { label: '90 min',     value: 90 * 60 },
  { label: '120 min',    value: 120 * 60 },
];

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function SimuladorPAES({ temas, onResult, onBack }) {
  const [step, setStep] = useState('config');
  const [tiempoOpc, setTiempoOpc] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [selected, setSelected] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(0);
  const timerRef = useRef(null);

  // Timer
  useEffect(() => {
    if (step !== 'quiz' || tiempoOpc === 0) return;
    setTiempoRestante(tiempoOpc);
    timerRef.current = setInterval(() => {
      setTiempoRestante(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // Tiempo agotado — forzar fin
          finalizarSimulador({});
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [step]);

  const handleStart = () => {
    const qs = buildSimulador(temas);
    setQuestions(qs);
    setIdx(0);
    setRespuestas({});
    setSelected(null);
    setStep('quiz');
  };

  const finalizarSimulador = (resp) => {
    clearInterval(timerRef.current);
    const r = calcResultado(questions, resp);
    setResultado(r);
    onResult(r, questions, resp);
    setStep('resultado');
  };

  const handleSelect = (option) => {
    if (selected !== null) return;
    setSelected(option);
    const newResp = { ...respuestas, [idx]: option };
    setRespuestas(newResp);

    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        finalizarSimulador(newResp);
      } else {
        setIdx(i => i + 1);
        setSelected(null);
      }
    }, 700);
  };

  const pctTimer = tiempoOpc > 0 ? (tiempoRestante / tiempoOpc) * 100 : 100;
  const timerColor = tiempoRestante < 300 ? 'var(--red)' : tiempoRestante < 600 ? 'var(--yellow)' : 'var(--green)';

  if (step === 'config') {
    return (
      <div className="fade-in" style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 80px' }}>
        <BackButton onClick={onBack} label="Volver" />
        <div style={{ margin: '20px 0 28px' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            🎯 Simulador PAES
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            65 preguntas · Todos los temas · Distribución oficial
          </p>
        </div>

        {/* Info distribución */}
        <div className="card" style={{ padding: '16px 18px', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', marginBottom: 12, letterSpacing: '.06em' }}>
            DISTRIBUCIÓN DE PREGUNTAS
          </div>
          {[
            { label: 'Historia',           n: 40, color: 'var(--green)' },
            { label: 'Formación Ciudadana', n: 15, color: 'var(--yellow)' },
            { label: 'Sistema Económico',   n: 10, color: '#6B9FE8' },
          ].map(e => (
            <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: e.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13 }}>{e.label}</span>
              <span style={{ fontWeight: 700, color: e.color }}>{e.n} preguntas</span>
            </div>
          ))}
          <div style={{
            marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700,
          }}>
            <span>Total</span>
            <span style={{ color: 'var(--green)' }}>65 preguntas</span>
          </div>
        </div>

        {/* Temporizador */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 10, letterSpacing: '.06em' }}>
            ⏱️ TEMPORIZADOR (OPCIONAL)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TIEMPO_OPCIONES.map(op => (
              <button
                key={op.value}
                onClick={() => setTiempoOpc(op.value)}
                style={{
                  background: tiempoOpc === op.value ? 'rgba(29,185,84,.12)' : 'var(--card)',
                  border: `1.5px solid ${tiempoOpc === op.value ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '12px',
                  cursor: 'pointer', textAlign: 'center',
                  color: tiempoOpc === op.value ? 'var(--green)' : 'var(--text)',
                  fontWeight: 700, fontSize: 14,
                }}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary" onClick={handleStart}>
          Comenzar Simulador →
        </button>
      </div>
    );
  }

  if (step === 'quiz') {
    const current = questions[idx];
    const progPct = Math.round((idx / questions.length) * 100);

    return (
      <div className="quiz-screen fade-in">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <BackButton onClick={() => { clearInterval(timerRef.current); setStep('config'); }} label="Salir" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {tiempoOpc > 0 && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 700,
                color: timerColor, background: 'var(--card)', padding: '4px 10px',
                borderRadius: 8, border: `1px solid ${timerColor}`,
              }}>
                ⏱ {formatTime(tiempoRestante)}
              </span>
            )}
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
              {idx + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
          <div style={{ height: '100%', width: `${progPct}%`, background: 'var(--green)', borderRadius: 99, transition: 'width .3s' }} />
        </div>

        {/* Timer bar */}
        {tiempoOpc > 0 && (
          <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: '100%', width: `${pctTimer}%`, background: timerColor, borderRadius: 99, transition: 'width 1s linear' }} />
          </div>
        )}

        {/* Eje badge */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
            background: 'var(--card2)', color: 'var(--muted)', letterSpacing: '.04em',
          }}>
            {EJE_LABELS[current.eje]?.toUpperCase()}
          </span>
          <span className={`nivel-badge nivel-${current.mc.nivel}`}>N{current.mc.nivel}</span>
        </div>

        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, lineHeight: 1.4, marginBottom: 20, whiteSpace: 'pre-line' }}>
          {current.enunciado}
        </h2>

        <div>
          {current.options.map((option, i) => {
            const isSelected = selected === option;
            const isCorrect  = option === current.correcta;
            let cls = 'quiz-option';
            if (selected !== null) {
              if (isCorrect)       cls += ' correct';
              else if (isSelected) cls += ' wrong';
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(option)}>
                <span className="letter">{['A','B','C','D'][i]}</span>
                <span style={{ flex: 1 }}>{option}</span>
                {selected !== null && isCorrect  && <span>✓</span>}
                {selected !== null && isSelected && !isCorrect && <span>✗</span>}
              </button>
            );
          })}
        </div>

        {/* Respuestas dadas */}
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
          Respondidas: {Object.keys(respuestas).length} · 
          Correctas: {Object.entries(respuestas).filter(([i, r]) => questions[i]?.correcta === r).length}
        </div>
      </div>
    );
  }

  if (step === 'resultado' && resultado) {
    return <ResultadoSimulador resultado={resultado} onBack={onBack} onRepetir={handleStart} />;
  }

  return null;
}

function ResultadoSimulador({ resultado, onBack, onRepetir }) {
  const { correctas, total, pct, porEje, fuertes, debiles } = resultado;
  const color = pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';

  return (
    <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>
          {pct >= 80 ? '🏆' : pct >= 65 ? '💪' : pct >= 50 ? '📖' : '🔄'}
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, marginBottom: 6 }}>
          {correctas} / {total}
        </h2>
        <div style={{
          display: 'inline-block', padding: '8px 28px', borderRadius: 99,
          background: `${color}22`, color,
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, marginBottom: 8,
        }}>
          {pct}%
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Simulador PAES Completo</div>
      </div>

      {/* Por eje */}
      <div className="card" style={{ padding: '16px 18px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 12, letterSpacing: '.06em' }}>
          RESULTADO POR EJE
        </div>
        {Object.entries(porEje).map(([ejeId, data]) => {
          if (data.t === 0) return null;
          const ejeColor = data.pct >= 70 ? 'var(--green)' : data.pct >= 50 ? 'var(--yellow)' : 'var(--red)';
          return (
            <div key={ejeId} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{EJE_LABELS[ejeId]}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: ejeColor }}>
                  {data.c}/{data.t} · {data.pct}%
                </span>
              </div>
              <div style={{ height: 5, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${data.pct}%`, background: ejeColor, borderRadius: 99 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Fortalezas */}
      {fuertes.length > 0 && (
        <div className="card" style={{ padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', marginBottom: 8, letterSpacing: '.06em' }}>
            ✅ TEMAS MÁS FUERTES
          </div>
          {fuertes.map(t => (
            <div key={t.nombre} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>{t.nombre}</span>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>{t.pct}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Debilidades */}
      {debiles.length > 0 && (
        <div className="card" style={{ padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)', marginBottom: 8, letterSpacing: '.06em' }}>
            ⚠️ TEMAS A REFORZAR
          </div>
          {debiles.map(t => (
            <div key={t.nombre} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>{t.nombre}</span>
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>{t.pct}%</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-ghost" onClick={onRepetir} style={{ flex: 1 }}>🔄 Nuevo simulador</button>
        <button className="btn-primary" onClick={onBack} style={{ flex: 1 }}>Volver</button>
      </div>
    </div>
  );
}

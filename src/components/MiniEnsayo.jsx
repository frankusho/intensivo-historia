// ─────────────────────────────────────────────────────────────
// components/MiniEnsayo.jsx
// ─────────────────────────────────────────────────────────────
import React, { useState, useMemo } from 'react';
import { BackButton } from './shared';
import { buildMiniEnsayo, calcResultado, EJES, EJE_LABELS, DIFICULTAD } from '../engine/evaluacion';

const EJES_LIST = [
  { id: 'historia',   label: 'Historia',            emoji: '📜', desc: '14 temas · 40 preguntas posibles' },
  { id: 'ciudadania', label: 'Formación Ciudadana',  emoji: '🏛️', desc: '5 temas · 15 preguntas posibles' },
  { id: 'economia',   label: 'Sistema Económico',    emoji: '📊', desc: '2 temas · 10 preguntas posibles' },
];

export default function MiniEnsayo({ temas, onResult, onBack }) {
  const [step, setStep] = useState('config'); // config | quiz | resultado
  const [ejeId, setEjeId] = useState(null);
  const [dificultad, setDificultad] = useState('paes');
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [selected, setSelected] = useState(null);
  const [resultado, setResultado] = useState(null);

  const handleStart = () => {
    const qs = buildMiniEnsayo(temas, ejeId, dificultad);
    setQuestions(qs);
    setIdx(0);
    setRespuestas({});
    setSelected(null);
    setStep('quiz');
  };

  const handleSelect = (option) => {
    if (selected !== null) return;
    setSelected(option);
    const newResp = { ...respuestas, [idx]: option };
    setRespuestas(newResp);

    setTimeout(() => {
      if (idx + 1 >= questions.length) {
        const r = calcResultado(questions, newResp);
        r.eje = ejeId;
        setResultado(r);
        onResult(r, questions, newResp);
        setStep('resultado');
      } else {
        setIdx(i => i + 1);
        setSelected(null);
      }
    }, 900);
  };

  if (step === 'config') {
    return (
      <div className="fade-in" style={{ maxWidth: 600, margin: '0 auto', padding: '24px 20px 80px' }}>
        <BackButton onClick={onBack} label="Volver" />
        <div style={{ margin: '20px 0 28px' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            📝 Mini Ensayo
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            20 preguntas · Elige el eje y la dificultad
          </p>
        </div>

        {/* Selección de eje */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 10, letterSpacing: '.06em' }}>
            ELIGE EL EJE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {EJES_LIST.map(eje => (
              <button
                key={eje.id}
                onClick={() => setEjeId(eje.id)}
                style={{
                  background: ejeId === eje.id ? 'rgba(29,185,84,.12)' : 'var(--card)',
                  border: `1.5px solid ${ejeId === eje.id ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: 12, padding: '14px 16px',
                  textAlign: 'left', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <span style={{ fontSize: 24 }}>{eje.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{eje.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{eje.desc}</div>
                </div>
                {ejeId === eje.id && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: 18 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Selección de dificultad */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 10, letterSpacing: '.06em' }}>
            DIFICULTAD
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {Object.entries(DIFICULTAD).map(([id, d]) => (
              <button
                key={id}
                onClick={() => setDificultad(id)}
                style={{
                  background: dificultad === id ? 'rgba(29,185,84,.12)' : 'var(--card)',
                  border: `1.5px solid ${dificultad === id ? 'var(--green)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '12px 8px',
                  cursor: 'pointer', textAlign: 'center',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: dificultad === id ? 'var(--green)' : 'var(--text)' }}>
                  {d.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-primary"
          onClick={handleStart}
          disabled={!ejeId}
          style={{ opacity: ejeId ? 1 : 0.4 }}
        >
          Comenzar Mini Ensayo →
        </button>
      </div>
    );
  }

  if (step === 'quiz') {
    const current = questions[idx];
    const pct = Math.round((idx / questions.length) * 100);

    return (
      <div className="quiz-screen fade-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <BackButton onClick={() => setStep('config')} label="Salir" />
          <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
            {idx + 1} / {questions.length}
          </span>
        </div>

        <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 99, transition: 'width .3s' }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
              background: 'var(--card2)', color: 'var(--muted)', letterSpacing: '.04em',
            }}>
              {current.mc.tema_padre?.toUpperCase()}
            </span>
            <span className={`nivel-badge nivel-${current.mc.nivel}`}>N{current.mc.nivel}</span>
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, lineHeight: 1.4, whiteSpace: 'pre-line' }}>
            {current.enunciado}
          </h2>
        </div>

        <div>
          {current.options.map((option, i) => {
            const isSelected = selected === option;
            const isCorrect  = option === current.correcta;
            let cls = 'quiz-option';
            if (selected !== null) {
              if (isCorrect)            cls += ' correct';
              else if (isSelected)      cls += ' wrong';
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
      </div>
    );
  }

  if (step === 'resultado' && resultado) {
    return <ResultadoEnsayo resultado={resultado} ejeId={ejeId} onBack={onBack} onRepetir={handleStart} />;
  }

  return null;
}

function ResultadoEnsayo({ resultado, ejeId, onBack, onRepetir }) {
  const { correctas, total, pct, fuertes, debiles, falladas } = resultado;
  const color = pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';

  return (
    <div className="fade-in" style={{ maxWidth: 560, margin: '0 auto', padding: '40px 20px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>
          {pct >= 70 ? '🏆' : pct >= 50 ? '💪' : '📖'}
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          {correctas} de {total} correctas
        </h2>
        <div style={{
          display: 'inline-block', padding: '6px 24px', borderRadius: 99,
          background: `${color}22`, color, fontFamily: 'Syne, sans-serif',
          fontWeight: 800, fontSize: 28,
        }}>
          {pct}%
        </div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8 }}>
          {EJE_LABELS[ejeId]}
        </div>
      </div>

      {/* Fortalezas */}
      {fuertes.length > 0 && (
        <div className="card" style={{ padding: '14px 16px', marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', marginBottom: 8 }}>✅ FORTALEZAS</div>
          {fuertes.map(t => (
            <div key={t.nombre} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: 'var(--text)' }}>{t.nombre}</span>
              <span style={{ color: 'var(--green)', fontWeight: 700 }}>{t.pct}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Debilidades */}
      {debiles.length > 0 && (
        <div className="card" style={{ padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--red)', marginBottom: 8 }}>⚠️ A REFORZAR</div>
          {debiles.map(t => (
            <div key={t.nombre} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: 'var(--text)' }}>{t.nombre}</span>
              <span style={{ color: 'var(--red)', fontWeight: 700 }}>{t.pct}%</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-ghost" onClick={onRepetir} style={{ flex: 1 }}>
          🔄 Repetir
        </button>
        <button className="btn-primary" onClick={onBack} style={{ flex: 1 }}>
          Volver
        </button>
      </div>
    </div>
  );
}

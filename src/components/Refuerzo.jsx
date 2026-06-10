// ─────────────────────────────────────────────────────────────
// components/Refuerzo.jsx
// ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { BackButton } from './shared';
import { buildRefuerzo, calcResultado } from '../engine/evaluacion';

export default function Refuerzo({ temas, preguntasFalladas, onResult, onBack }) {
  const [step, setStep] = useState('config');
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [respuestas, setRespuestas] = useState({});
  const [selected, setSelected] = useState(null);
  const [resultado, setResultado] = useState(null);

  const totalFalladas = Object.keys(preguntasFalladas).length;
  const topFalladas = Object.values(preguntasFalladas)
    .sort((a, b) => b.veces - a.veces)
    .slice(0, 5);

  const handleStart = () => {
    const qs = buildRefuerzo(preguntasFalladas, temas, 20);
    if (qs.length === 0) return;
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
        setResultado(r);
        onResult(r, questions, newResp);
        setStep('resultado');
      } else {
        setIdx(i => i + 1);
        setSelected(null);
      }
    }, 800);
  };

  if (step === 'config') {
    const allMC = temas.flatMap(t => t.conceptos.flatMap(c => c.microconceptos));

    return (
      <div className="fade-in" style={{ maxWidth: 540, margin: '0 auto', padding: '24px 20px 80px' }}>
        <BackButton onClick={onBack} label="Volver" />
        <div style={{ margin: '20px 0 24px' }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            🔁 Reforzar errores
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14 }}>
            {totalFalladas} preguntas falladas acumuladas
          </p>
        </div>

        {totalFalladas < 3 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🎯</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Sin suficientes errores aún</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              Completa algunos quizzes o mini ensayos primero. Aquí aparecerán las preguntas que falles con mayor frecuencia.
            </div>
          </div>
        ) : (
          <>
            {/* Top errores */}
            <div className="card" style={{ padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 10, letterSpacing: '.06em' }}>
                TUS ERRORES MÁS FRECUENTES
              </div>
              {topFalladas.map(e => {
                const mc = allMC.find(m => m.id === e.mc_id);
                if (!mc) return null;
                return (
                  <div key={e.mc_id} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    marginBottom: 8, padding: '8px 10px',
                    background: 'var(--bg2)', borderRadius: 8,
                    borderLeft: '3px solid var(--red)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{mc.termino}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{mc.tema_padre}</div>
                    </div>
                    <div style={{
                      background: 'rgba(233,79,79,.15)', color: 'var(--red)',
                      borderRadius: 6, padding: '2px 8px',
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {e.veces}✗
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="btn-primary" onClick={handleStart}>
              🔁 Iniciar refuerzo ({Math.min(20, totalFalladas)} preguntas) →
            </button>
          </>
        )}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              background: 'rgba(233,79,79,.15)', color: 'var(--red)',
              padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
            }}>🔁 Refuerzo</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>
              {idx + 1} / {questions.length}
            </span>
          </div>
        </div>

        <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--red)', borderRadius: 99, transition: 'width .3s' }} />
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
      </div>
    );
  }

  if (step === 'resultado' && resultado) {
    const { correctas, total, pct } = resultado;
    const color = pct >= 70 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';
    return (
      <div className="fade-in" style={{ maxWidth: 480, margin: '0 auto', padding: '48px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>{pct >= 70 ? '🎉' : '💪'}</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
            {correctas} / {total} correctas
          </h2>
          <div style={{
            display: 'inline-block', padding: '6px 24px', borderRadius: 99,
            background: `${color}22`, color,
            fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28,
          }}>
            {pct}%
          </div>
          {pct >= 70 && (
            <p style={{ color: 'var(--green)', fontSize: 14, marginTop: 10, fontWeight: 600 }}>
              ¡Estás superando tus errores! 🌟
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-ghost" onClick={handleStart} style={{ flex: 1 }}>🔄 Repetir</button>
          <button className="btn-primary" onClick={onBack} style={{ flex: 1 }}>Volver</button>
        </div>
      </div>
    );
  }

  return null;
}

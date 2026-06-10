import React, { useState, useMemo } from 'react';
import { BackButton, NivelBadge } from './shared';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuestions(tema, allTemas) {
  const mcs = tema.conceptos.flatMap(c => c.microconceptos);
  const pool = allTemas.filter(t => t.id !== tema.id).flatMap(t => t.conceptos.flatMap(c => c.microconceptos));
  return shuffle(mcs).slice(0, Math.min(10, mcs.length)).map(mc => {
    const distractores = shuffle(pool).filter(d => d.id !== mc.id).slice(0, 3).map(d => d.definicion);
    const options = shuffle([mc.definicion, ...distractores]);
    return { mc, pregunta: `¿Cuál es la definición de "${mc.termino}"?`, options, correcta: mc.definicion };
  });
}

// Componente separado para resultado — hooks válidos
function QuizResult({ score, total, wrong, onBack }) {
  const [showWrong, setShowWrong] = useState(false);
  const pct = Math.round((score / total) * 100);

  return (
    <div className="quiz-screen fade-in" style={{ paddingTop: 48 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>
          {pct >= 80 ? '🏆' : pct >= 60 ? '💪' : '📖'}
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
          {score} de {total} correctas
        </h2>
        <div style={{
          display: 'inline-block', padding: '4px 16px', borderRadius: 99,
          background: pct >= 80 ? 'rgba(29,185,84,.15)' : pct >= 60 ? 'rgba(245,197,66,.15)' : 'rgba(233,79,79,.15)',
          color: pct >= 80 ? 'var(--green)' : pct >= 60 ? 'var(--yellow)' : 'var(--red)',
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22,
        }}>
          {pct}%
        </div>
      </div>

      {wrong.length > 0 && (
        <div className="card" style={{ marginBottom: 16, overflow: 'hidden' }}>
          <button
            onClick={() => setShowWrong(s => !s)}
            style={{
              width: '100%', padding: '14px 16px', background: 'none', border: 'none',
              textAlign: 'left', cursor: 'pointer', fontWeight: 600, fontSize: 14,
              display: 'flex', justifyContent: 'space-between', color: 'var(--red)',
            }}
          >
            <span>❌ {wrong.length} incorrectas — revisar</span>
            <span>{showWrong ? '▲' : '▼'}</span>
          </button>
          {showWrong && wrong.map(w => (
            <div key={w.mc.id} style={{
              margin: '0 14px 12px', padding: '10px 12px',
              background: 'var(--bg2)', borderRadius: 8, borderLeft: '3px solid var(--red)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{w.mc.termino}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{w.correcta}</div>
            </div>
          ))}
        </div>
      )}

      <button className="btn-primary" onClick={onBack}>Volver</button>
    </div>
  );
}

export default function Quiz({ tema, temas, progress, onResult, onBack }) {
  const questions = useMemo(() => buildQuestions(tema, temas), [tema, temas]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [wrong, setWrong] = useState([]);

  const current = questions[idx];

  const handleSelect = (option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === current.correcta;
    onResult(current.mc.id, correct);
    if (correct) {
      setScore(s => s + 1);
      setShowCorrect(true);
      setTimeout(() => {
        setShowCorrect(false);
        advance();
      }, 1500);
    } else {
      setWrong(w => [...w, current]);
      setTimeout(() => advance(), 1200);
    }
  };

  const advance = () => {
    if (idx + 1 >= questions.length) {
      setDone(true);
    } else {
      setIdx(i => i + 1);
      setSelected(null);
    }
  };

  if (showCorrect) {
    return (
      <div className="quiz-screen fade-in">
        <div className="quiz-correct-screen">
          <div className="quiz-correct-circle">✓</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
            ¡Correcto! 🎉
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>{current.correcta}</p>
          <div className="dominio-gain">+8 dominio</div>
        </div>
      </div>
    );
  }

  if (done) {
    return <QuizResult score={score} total={questions.length} wrong={wrong} onBack={onBack} />;
  }

  return (
    <div className="quiz-screen fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <BackButton onClick={onBack} label="Salir" />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
          {idx + 1} / {questions.length}
        </span>
      </div>

      <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{
          height: '100%', width: `${(idx / questions.length) * 100}%`,
          background: 'var(--green)', borderRadius: 99, transition: 'width .4s',
        }} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 10 }}>
          <NivelBadge nivel={current.mc.nivel} />
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 19, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>
          {current.pregunta}
        </h2>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Tema: {current.mc.tema_padre}</p>
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

      <div style={{ textAlign: 'center', marginTop: 20, color: 'var(--green)', fontWeight: 700, fontSize: 14 }}>
        ✅ {score} correctas
      </div>
    </div>
  );
}

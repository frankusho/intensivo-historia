import React, { useState, useMemo, useCallback } from 'react';
import { BackButton, NivelBadge } from './shared';
import { sortByPriority } from '../engine/spacedRepetition';

export default function Flashcards({ tema, progress, onResult, onBack }) {
  const allMCs = useMemo(() => tema.conceptos.flatMap(c => c.microconceptos), [tema]);
  const ordered = useMemo(() => {
    const ids = sortByPriority(allMCs.map(m => m.id), progress.flashcards);
    return ids.map(id => allMCs.find(m => m.id === id)).filter(Boolean);
  }, [allMCs, progress.flashcards]);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [stats, setStats] = useState({ facil: 0, medio: 0, dificil: 0 });

  const current = ordered[idx];
  const total = ordered.length;

  const handleResult = useCallback((result) => {
    onResult(current.id, result);
    setStats(s => ({ ...s, [result]: s[result] + 1 }));
    setFlipped(false);
    if (idx + 1 >= total) {
      setDone(true);
    } else {
      setTimeout(() => setIdx(i => i + 1), 120);
    }
  }, [current, idx, total, onResult]);

  if (done) {
    const dominio = Math.round((stats.facil / total) * 100);
    return (
      <div className="fc-screen fade-in" style={{ textAlign: 'center', paddingTop: 64 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>
          {dominio >= 70 ? '🎉' : dominio >= 40 ? '💪' : '📚'}
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
          Sesión completada
        </h2>
        <p style={{ color: 'var(--muted)', marginBottom: 28 }}>{tema.titulo}</p>
        <div className="card" style={{ padding: 24, marginBottom: 20, maxWidth: 360, margin: '0 auto 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[
              { l: 'Fácil', v: stats.facil, c: 'var(--green)' },
              { l: 'Medio', v: stats.medio, c: 'var(--yellow)' },
              { l: 'Difícil', v: stats.dificil, c: 'var(--red)' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: s.c }}>{s.v}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 4 }}>Dominio estimado</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color: 'var(--green)' }}>
              {dominio}%
            </div>
          </div>
        </div>
        <button className="btn-primary" style={{ maxWidth: 360 }} onClick={onBack}>Volver al tema</button>
      </div>
    );
  }

  if (!current) return null;

  const pct = Math.round((idx / total) * 100);

  return (
    <div className="fc-screen fade-in">
      {/* Header */}
      <div className="fc-header">
        <BackButton onClick={onBack} label="Salir" />
        <span className="fc-topic">{tema.titulo}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>{idx + 1} / {total}</span>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 99, transition: 'width .4s' }} />
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { l: '😓', v: stats.dificil, c: 'var(--red)' },
          { l: '🤔', v: stats.medio, c: 'var(--yellow)' },
          { l: '✅', v: stats.facil, c: 'var(--green)' },
        ].map(s => (
          <div key={s.l} style={{
            flex: 1, textAlign: 'center', background: 'var(--card)',
            border: '1px solid var(--border)', borderRadius: 10, padding: '8px 0',
          }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Flip card */}
      <div
        className={`flip-card${flipped ? ' flipped' : ''}`}
        onClick={() => setFlipped(f => !f)}
        style={{ height: 260, cursor: 'pointer' }}
      >
        <div className="flip-card-inner">
          {/* Frente */}
          <div className="flip-card-front fc-card">
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              <NivelBadge nivel={current.nivel} />
            </div>
            <div className="question">{current.termino}</div>
            <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 16px' }}>
              {current.flashcard_pregunta}
            </p>
            <div className="hint">
              <span>👆</span> Toca para ver la respuesta
            </div>
          </div>

          {/* Reverso */}
          <div className="flip-card-back" style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: 28, textAlign: 'center',
          }}>
            <NivelBadge nivel={current.nivel} />
            <p className="fc-answer" style={{ marginTop: 14 }}>{current.flashcard_respuesta}</p>
            {current.error_comun && (
              <p className="fc-error">⚠️ {current.error_comun}</p>
            )}
          </div>
        </div>
      </div>

      {/* Botones calificación */}
      {flipped && (
        <div className="fc-btns fade-in">
          <button className="fc-btn dificil" onClick={() => handleResult('dificil')}>
            <span className="emoji">😓</span>
            Difícil
          </button>
          <button className="fc-btn medio" onClick={() => handleResult('medio')}>
            <span className="emoji">🤔</span>
            Medio
          </button>
          <button className="fc-btn facil" onClick={() => handleResult('facil')}>
            <span className="emoji">😊</span>
            Fácil
          </button>
        </div>
      )}

      {!flipped && (
        <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>
          Toca la tarjeta para revelar la respuesta
        </p>
      )}
    </div>
  );
}

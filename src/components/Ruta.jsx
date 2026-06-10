import React from 'react';
import { BackButton } from './shared';

export default function Ruta({ temas, dominioPorTema, onGoTema, onBack }) {
  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px 80px' }}>
      <BackButton onClick={onBack} label="Dashboard" />

      <div style={{ margin: '20px 0 24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          🗺️ Ruta de estudio
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          {temas.length} temas · Ordenados por peso PAES
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...temas].sort((a, b) => (b.peso_paes ?? 0) - (a.peso_paes ?? 0)).map((tema, idx) => {
          const dom = dominioPorTema[tema.id] ?? 0;
          const pct = Math.round(dom * 100);
          const mcs = tema.conceptos.flatMap(c => c.microconceptos).length;
          const paesPct = Math.round((tema.peso_paes ?? 0) * 100);

          return (
            <button
              key={tema.id}
              onClick={() => onGoTema(tema)}
              className="card"
              style={{
                padding: '16px 18px', textAlign: 'left', cursor: 'pointer',
                display: 'grid', gridTemplateColumns: '36px 1fr auto',
                gap: 12, alignItems: 'center', border: 'none',
                transition: 'border-color .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--green-dim)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700,
                color: idx < 3 ? 'var(--green)' : 'var(--border)', textAlign: 'center',
              }}>
                {String(idx + 1).padStart(2, '0')}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{tema.icono}</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{tema.titulo}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green)', minWidth: 34 }}>{pct}%</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {tema.conceptos.length} conceptos · {mcs} flashcards
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800,
                  color: paesPct >= 10 ? 'var(--red)' : 'var(--muted)',
                }}>
                  {paesPct}%
                </div>
                <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 600 }}>PAES</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

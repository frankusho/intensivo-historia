import React, { useState } from 'react';
import { BackButton, NivelBadge } from './shared';

export default function Tema({ tema, dominio, progress, onGoFlashcards, onGoQuiz, onMarkConcepto, onBack }) {
  const [openConcepto, setOpenConcepto] = useState(null);
  const pct = Math.round(dominio * 100);

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px 80px' }}>
      <BackButton onClick={onBack} label="Volver" />

      {/* Header */}
      <div style={{ margin: '16px 0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 30 }}>{tema.icono}</span>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800 }}>{tema.titulo}</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--green)', borderRadius: 99, transition: 'width .5s' }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>{pct}%</span>
        </div>

        {tema.importancia_paes && (
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 12 }}>
            {tema.importancia_paes}
          </p>
        )}

        {/* Keywords */}
        {tema.palabras_clave?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {tema.palabras_clave.slice(0, 8).map(p => (
              <span key={p} style={{
                fontSize: 11, padding: '3px 9px', borderRadius: 99,
                background: 'var(--card2)', border: '1px solid var(--border)',
                color: 'var(--muted)', fontWeight: 500,
              }}>{p}</span>
            ))}
          </div>
        )}

        {/* Botones */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-primary" onClick={() => onGoFlashcards(tema)} style={{ flex: 1 }}>
            🃏 Flashcards
          </button>
          <button className="btn-ghost" onClick={() => onGoQuiz(tema)} style={{ flex: 1 }}>
            ❓ Quiz rápido
          </button>
        </div>
      </div>

      {/* Conceptos */}
      <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: '.06em' }}>
        {tema.conceptos.length} CONCEPTOS
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {tema.conceptos.map(concepto => {
          const isOpen = openConcepto === concepto.id;
          const visitado = progress.conceptos_vistos.includes(concepto.id);
          const mcIds = concepto.microconceptos.map(m => m.id);
          const faciles = mcIds.filter(id => progress.flashcards[id] === 'facil').length;

          return (
            <div key={concepto.id} className="card" style={{ overflow: 'hidden' }}>
              <button
                onClick={() => {
                  if (!isOpen) onMarkConcepto(concepto.id);
                  setOpenConcepto(isOpen ? null : concepto.id);
                }}
                style={{
                  width: '100%', textAlign: 'left', background: 'none',
                  border: 'none', cursor: 'pointer', padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: visitado ? 'var(--green)' : 'var(--border)',
                  }} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', lineHeight: 1.3 }}>
                    {concepto.titulo}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>{faciles}/{mcIds.length}</span>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="var(--muted)" strokeWidth={2.5}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)' }}>
                  {concepto.cuerpo && (
                    <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                      {concepto.cuerpo}
                    </div>
                  )}
                  {concepto.paes_tip && (
                    <div style={{
                      margin: '0 16px 12px', padding: '10px 12px',
                      background: 'rgba(29,185,84,.08)', borderRadius: 8,
                      fontSize: 13, color: 'var(--green)', fontWeight: 500, lineHeight: 1.5,
                      border: '1px solid var(--green-dim)',
                    }}>
                      💡 <strong>PAES:</strong> {concepto.paes_tip}
                    </div>
                  )}

                  <div style={{ padding: '4px 16px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginBottom: 8, letterSpacing: '.06em' }}>
                      MICROCONCEPTOS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {concepto.microconceptos.map(mc => {
                        const estado = progress.flashcards[mc.id];
                        const borderColor = { facil: 'var(--green)', medio: 'var(--yellow)', dificil: 'var(--red)' }[estado] || 'var(--border)';
                        return (
                          <div key={mc.id} style={{
                            background: 'var(--bg2)', borderRadius: 8, padding: '10px 12px',
                            borderLeft: `3px solid ${borderColor}`,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: 13 }}>{mc.termino}</span>
                              <NivelBadge nivel={mc.nivel} />
                            </div>
                            <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                              {mc.definicion}
                            </p>
                            {mc.error_comun && (
                              <p style={{ margin: '5px 0 0', fontSize: 11, color: 'var(--red)', lineHeight: 1.4 }}>
                                ⚠️ {mc.error_comun}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

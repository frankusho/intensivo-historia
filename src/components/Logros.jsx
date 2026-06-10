import React from 'react';
import { BackButton } from './shared';
import { LOGROS } from '../engine/logros';

export default function Logros({ progress, onBack }) {
  const desbloqueados = progress.logros;

  return (
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto', padding: '24px 20px 80px' }}>
      <BackButton onClick={onBack} label="Dashboard" />

      <div style={{ margin: '20px 0 24px' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
          🏆 Logros
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>
          {desbloqueados.length} de {LOGROS.length} desbloqueados
        </p>
        <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden', marginTop: 10 }}>
          <div style={{
            height: '100%', width: `${(desbloqueados.length / LOGROS.length) * 100}%`,
            background: 'var(--green)', borderRadius: 99, transition: 'width .5s',
          }} />
        </div>
      </div>

      {/* Frase motivacional */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 24,
        borderLeft: '4px solid var(--green)',
      }}>
        <p style={{ fontSize: 14, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
          "No necesitas ser perfecta, solo constante.<br />
          <span style={{ color: '#E88FA0', fontWeight: 600 }}>Tú puedes con esto y más 🤍</span>
        </p>
      </div>

      <div className="logro-grid">
        {LOGROS.map(logro => {
          const done = desbloqueados.includes(logro.id);
          return (
            <div key={logro.id} className={`logro-item${done ? ' unlocked' : ''}`}>
              <div className="logro-icon">{logro.emoji}</div>
              <div className="logro-name">{logro.titulo}</div>
              <div className="logro-desc">{logro.desc}</div>
              {done && (
                <div style={{
                  marginTop: 8, fontSize: 11, color: 'var(--green)',
                  fontWeight: 700, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 4,
                }}>
                  ✓ Desbloqueado
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 32, textAlign: 'center',
        fontSize: 13, color: 'var(--muted)',
        padding: '16px', background: 'var(--card)',
        borderRadius: 12, border: '1px solid var(--border)',
      }}>
        ✨ Un día más cerca de tu sueño.<br />
        <span style={{ color: '#E88FA0', fontWeight: 600 }}>¡Vamos por esa puntaje nacional! 🤙</span>
      </div>
    </div>
  );
}

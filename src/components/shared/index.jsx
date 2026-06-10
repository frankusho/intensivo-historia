import React from 'react';

export function NivelBadge({ nivel }) {
  return (
    <span className={`nivel-badge nivel-${nivel}`}>N{nivel}</span>
  );
}

export function ProgressBar({ value, height = 5 }) {
  return (
    <div className="progress-bar" style={{ height }}>
      <div className="progress-bar-fill" style={{ width: `${Math.round(Math.min(1, value) * 100)}%` }} />
    </div>
  );
}

export function BackButton({ onClick, label = 'Volver' }) {
  return (
    <button className="back-btn" onClick={onClick}>
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </button>
  );
}

export function DominioChip({ ratio }) {
  const pct = Math.round(ratio * 100);
  const color = pct >= 75 ? 'var(--green)' : pct >= 40 ? 'var(--yellow)' : 'var(--red)';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 99,
      background: 'var(--card2)', border: `1px solid ${color}`,
      color, fontSize: 12, fontWeight: 700,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {pct}%
    </span>
  );
}

export function LogroToast({ logros, onDismiss }) {
  if (!logros || logros.length === 0) return null;
  const logro = logros[0];
  return (
    <div className="toast" onClick={onDismiss}>
      <span style={{ fontSize: 28 }}>{logro.emoji}</span>
      <div>
        <div style={{ fontSize: 11, opacity: .7, marginBottom: 2, fontWeight: 600 }}>¡Logro desbloqueado!</div>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{logro.titulo}</div>
        <div style={{ fontSize: 12, opacity: .8 }}>{logro.desc}</div>
      </div>
    </div>
  );
}

export function EmptyState({ emoji, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{emoji}</div>
      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 14 }}>{subtitle}</div>}
    </div>
  );
}

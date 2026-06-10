import React from 'react';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Inicio',          screen: 'dashboard' },
  { icon: '🗺️', label: 'Ruta de estudio', screen: 'ruta' },
  { icon: '🃏', label: 'Flashcards',      screen: 'flashcards' },
  { icon: '❓', label: 'Quizzes',         screen: 'quiz' },
  { icon: '📝', label: 'Mini Ensayos',    screen: 'miniensayo' },
  { icon: '🎯', label: 'Simulador PAES',  screen: 'simulador' },
  { icon: '🔁', label: 'Reforzar errores',screen: 'refuerzo' },
  { icon: '🏆', label: 'Logros',          screen: 'logros' },
];

export default function Sidebar({ screen, onNavigate, temas, onGoFlashcards, onGoQuiz, preguntasFalladas = {} }) {
  const totalFalladas = Object.keys(preguntasFalladas).length;

  const handleClick = (item) => {
    if (item.screen === 'flashcards') { onGoFlashcards(temas[0]); return; }
    if (item.screen === 'quiz')       { onGoQuiz(temas[0]);       return; }
    onNavigate(item.screen);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span style={{ fontSize: 26 }}>🎓</span>
        <div className="sidebar-logo-text">
          Intensivo<br /><span>Historia</span> +
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const isActive = screen === item.screen;
          const showBadge = item.screen === 'refuerzo' && totalFalladas >= 3;
          return (
            <button
              key={item.screen}
              className={`sidebar-item${isActive ? ' active' : ''}`}
              onClick={() => handleClick(item)}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {showBadge && (
                <span style={{
                  background: '#EF4444', color: 'white',
                  borderRadius: 99, fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', minWidth: 18, textAlign: 'center',
                }}>
                  {totalFalladas}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-quote">
        "El esfuerzo de hoy es el orgullo de mañana."
        <br /><span className="heart">💜</span>
      </div>

      <div className="sidebar-focus-row">
        <span>🧘 Modo enfoque</span>
        <div className="toggle" />
      </div>
    </aside>
  );
}

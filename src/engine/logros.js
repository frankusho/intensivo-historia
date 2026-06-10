// ─────────────────────────────────────────────────────────────
// engine/logros.js
// ─────────────────────────────────────────────────────────────
import { calcDominioTema } from './dominio';

export const LOGROS = [
  {
    id: 'racha_3',
    titulo: '3 días seguidos',
    desc: 'Estudiaste 3 días consecutivos.',
    emoji: '🔥',
    check: (s) => s.racha >= 3,
  },
  {
    id: 'primer_flashcard',
    titulo: 'Primera flashcard',
    desc: 'Respondiste tu primera flashcard.',
    emoji: '🃏',
    check: (s) => Object.keys(s.flashcards).length >= 1,
  },
  {
    id: 'cien_flashcards',
    titulo: '100 flashcards',
    desc: 'Respondiste 100 flashcards.',
    emoji: '💯',
    check: (s) => Object.keys(s.flashcards).length >= 100,
  },
  {
    id: 'primer_dominio',
    titulo: 'Primer tema dominado',
    desc: 'Un tema llegó al 75% de dominio.',
    emoji: '🏆',
    check: (s, temas) => {
      if (!temas) return false;
      return temas.some(t => calcDominioTema(t, s) >= 0.75);
    },
  },
  {
    id: 'primer_quiz',
    titulo: 'Primer quiz',
    desc: 'Completaste tu primer quiz.',
    emoji: '✅',
    check: (s) => Object.keys(s.quizzes).length >= 1,
  },
  {
    id: 'racha_7',
    titulo: 'Semana completa',
    desc: 'Estudiaste 7 días seguidos.',
    emoji: '⚡',
    check: (s) => s.racha >= 7,
  },
  {
    id: 'cincuenta_mc',
    titulo: '50 microconceptos',
    desc: 'Completaste 50 flashcards como "fácil".',
    emoji: '🎯',
    check: (s) => Object.values(s.flashcards).filter(v => v === 'facil').length >= 50,
  },
  {
    id: 'todos_temas',
    titulo: 'Todos los temas',
    desc: 'Visitaste los 18 temas.',
    emoji: '🌟',
    check: (s) => s.temas_vistos.length >= 18,
  },
];

export function checkLogros(state, temas) {
  const nuevos = [];
  for (const logro of LOGROS) {
    if (state.logros.includes(logro.id)) continue;
    try {
      if (logro.check(state, temas)) nuevos.push(logro);
    } catch {}
  }
  return nuevos;
}

// ─────────────────────────────────────────────────────────────
// engine/spacedRepetition.js
// Fácil → +24h  |  Medio → +10min  |  Difícil → +2min
// ─────────────────────────────────────────────────────────────

const INTERVALS = {
  facil:   24 * 60 * 60 * 1000,   // 24h
  medio:       10 * 60 * 1000,   // 10min
  dificil:      2 * 60 * 1000,   //  2min
};

export function nextReviewTime(result) {
  return Date.now() + (INTERVALS[result] ?? INTERVALS.medio);
}

// Ordenar microconceptos por prioridad de repaso
// Primero: nunca vistos | luego: difíciles | luego: medios | último: fáciles recientes
export function sortByPriority(mc_ids, flashcards) {
  return [...mc_ids].sort((a, b) => {
    const ra = flashcards[a];
    const rb = flashcards[b];
    const order = { undefined: 0, dificil: 1, medio: 2, facil: 3 };
    return (order[ra] ?? 0) - (order[rb] ?? 0);
  });
}

// ¿Este mc está pendiente de repaso?
export function isDue(mc_id, flashcards) {
  return !flashcards[mc_id] || flashcards[mc_id] !== 'facil';
}

// Cuántos mc tiene un tema pendientes
export function pendientesTema(tema, flashcards) {
  return tema.conceptos
    .flatMap(c => c.microconceptos)
    .filter(mc => isDue(mc.id, flashcards)).length;
}

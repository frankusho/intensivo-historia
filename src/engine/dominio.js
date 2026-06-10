// ─────────────────────────────────────────────────────────────
// engine/dominio.js
// Fórmula: aciertos×0.60 + flashcards_facil×0.25 + conceptos_vistos×0.15
// ─────────────────────────────────────────────────────────────

export function calcDominioTema(tema, progress) {
  const mc_ids = tema.conceptos.flatMap(c => c.microconceptos.map(m => m.id));
  const concepto_ids = tema.conceptos.map(c => c.id);

  if (mc_ids.length === 0) return 0;

  // Aciertos en quiz: correctas/intentos por mc
  const aciertos = mc_ids.reduce((sum, id) => {
    const q = progress.quizzes[id];
    if (!q || q.intentos === 0) return sum;
    return sum + (q.correctas / q.intentos);
  }, 0) / mc_ids.length;

  // Flashcards fácil
  const faciles = mc_ids.filter(id =>
    progress.flashcards[id] === 'facil'
  ).length / mc_ids.length;

  // Conceptos vistos
  const vistos = concepto_ids.filter(id =>
    progress.conceptos_vistos.includes(id)
  ).length / concepto_ids.length;

  const raw = aciertos * 0.60 + faciles * 0.25 + vistos * 0.15;
  return Math.min(1, raw);
}

export function calcDominioTotal(temas, progress) {
  if (temas.length === 0) return 0;
  const suma = temas.reduce((s, t) => s + calcDominioTema(t, progress), 0);
  return suma / temas.length;
}

// Nivel de dominio para colores y etiquetas
export function nivelDominio(ratio) {
  if (ratio >= 0.75) return { label: 'Dominado',   color: '#2D9E6B', bg: '#E8F7F1' };
  if (ratio >= 0.40) return { label: 'En progreso', color: '#D4A72C', bg: '#FDF6E3' };
  return                    { label: 'Por empezar', color: '#E9504F', bg: '#FDECEA' };
}

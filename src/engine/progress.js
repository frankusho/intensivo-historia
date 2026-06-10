const KEY = 'intensivo_historia_progress';

export const EMPTY_STATE = {
  version: 2,
  creado: null,
  flashcards: {},
  quizzes: {},
  temas_vistos: [],
  conceptos_vistos: [],
  racha: 0,
  ultima_sesion: null,
  logros: [],
  misiones_hoy: [],
  ultima_mision_fecha: null,
  // Evaluaciones
  simuladores: {
    realizados: 0,
    mejorPuntaje: 0,
    historial: [],
  },
  miniEnsayos: {
    realizados: 0,
    historial: [],
  },
  // Banco de errores ponderado
  preguntasFalladas: {},
  // Estadísticas por tema
  statsPorTema: {},
};

export function loadProgress() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY_STATE, creado: new Date().toISOString() };
    const saved = JSON.parse(raw);
    // Merge para agregar campos nuevos sin romper progreso existente
    return {
      ...EMPTY_STATE,
      ...saved,
      simuladores:       { ...EMPTY_STATE.simuladores,  ...(saved.simuladores || {}) },
      miniEnsayos:       { ...EMPTY_STATE.miniEnsayos,   ...(saved.miniEnsayos || {}) },
      preguntasFalladas: saved.preguntasFalladas || {},
      statsPorTema:      saved.statsPorTema || {},
    };
  } catch {
    return { ...EMPTY_STATE, creado: new Date().toISOString() };
  }
}

export function saveProgress(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export function resetProgress() {
  localStorage.removeItem(KEY);
  return { ...EMPTY_STATE, creado: new Date().toISOString() };
}

// ── Flashcard ─────────────────────────────────────────────────
export function updateFlashcard(state, mc_id, result) {
  return { ...state, flashcards: { ...state.flashcards, [mc_id]: result } };
}

// ── Quiz ──────────────────────────────────────────────────────
export function updateQuiz(state, mc_id, correct) {
  const prev = state.quizzes[mc_id] || { correctas: 0, intentos: 0 };
  return {
    ...state,
    quizzes: {
      ...state.quizzes,
      [mc_id]: { correctas: prev.correctas + (correct ? 1 : 0), intentos: prev.intentos + 1 },
    },
  };
}

// ── Temas / conceptos vistos ──────────────────────────────────
export function markTemaVisto(state, tema_id) {
  if (state.temas_vistos.includes(tema_id)) return state;
  return { ...state, temas_vistos: [...state.temas_vistos, tema_id] };
}

export function markConceptoVisto(state, concepto_id) {
  if (state.conceptos_vistos.includes(concepto_id)) return state;
  return { ...state, conceptos_vistos: [...state.conceptos_vistos, concepto_id] };
}

// ── Racha ─────────────────────────────────────────────────────
export function updateRacha(state) {
  const today = new Date().toDateString();
  const last  = state.ultima_sesion ? new Date(state.ultima_sesion).toDateString() : null;
  if (last === today) return state;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const racha = last === yesterday ? state.racha + 1 : 1;
  return { ...state, racha, ultima_sesion: new Date().toISOString() };
}

// ── Guardar simulador ─────────────────────────────────────────
export function saveSimulador(state, resultado) {
  const entry = {
    fecha: new Date().toISOString(),
    puntaje: resultado.pct,
    correctas: resultado.correctas,
    total: resultado.total,
    porEje: resultado.porEje,
  };
  const historial = [...(state.simuladores.historial || []), entry].slice(-20);
  return {
    ...state,
    simuladores: {
      realizados:    (state.simuladores.realizados || 0) + 1,
      mejorPuntaje:  Math.max(state.simuladores.mejorPuntaje || 0, resultado.pct),
      historial,
    },
  };
}

// ── Guardar mini ensayo ───────────────────────────────────────
export function saveMiniEnsayo(state, resultado) {
  const entry = {
    fecha: new Date().toISOString(),
    puntaje: resultado.pct,
    eje: resultado.eje,
  };
  const historial = [...(state.miniEnsayos.historial || []), entry].slice(-50);
  return {
    ...state,
    miniEnsayos: {
      realizados: (state.miniEnsayos.realizados || 0) + 1,
      historial,
    },
  };
}

// ── Banco de errores ponderado ────────────────────────────────
export function addPreguntaFallada(state, mc) {
  const prev = state.preguntasFalladas[mc.id] || { mc_id: mc.id, veces: 0, ultimaFecha: null };
  return {
    ...state,
    preguntasFalladas: {
      ...state.preguntasFalladas,
      [mc.id]: {
        mc_id: mc.id,
        veces: prev.veces + 1,
        ultimaFecha: Date.now(),
      },
    },
  };
}

// ── Stats por tema ────────────────────────────────────────────
export function updateStatsTema(state, tema_id, correctas, total) {
  const prev = state.statsPorTema[tema_id] || { correctas: 0, total: 0, sesiones: 0 };
  return {
    ...state,
    statsPorTema: {
      ...state.statsPorTema,
      [tema_id]: {
        correctas: prev.correctas + correctas,
        total:     prev.total + total,
        sesiones:  prev.sesiones + 1,
      },
    },
  };
}

// ── Promedio simuladores (calculado) ─────────────────────────
export function promedioSimuladores(state) {
  const h = state.simuladores.historial || [];
  if (h.length === 0) return 0;
  return Math.round(h.reduce((s, e) => s + e.puntaje, 0) / h.length);
}

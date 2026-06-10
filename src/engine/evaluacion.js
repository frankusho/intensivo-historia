// ─────────────────────────────────────────────────────────────
// engine/evaluacion.js
// ─────────────────────────────────────────────────────────────

export const EJES = {
  historia: [
    'estado-nacion','liberalismo','formacion-republica',
    'economia-chile-xix','sociedad-chilena-xx','totalitarismos',
    'onu-ddhh','golpe-1973','dictadura-militar','neoliberalismo',
    'recuperacion-democracia','nuevo-orden-mundial',
  ],
  ciudadania: [
    'democracia','ciudadania','institucionalidad-democratica',
    'sociedad-informacion',
  ],
  economia: [
    'sistema-economico','derechos-laborales',
  ],
};

export const EJE_LABELS = {
  historia:   'Historia',
  ciudadania: 'Formación Ciudadana',
  economia:   'Sistema Económico',
};

export const DIFICULTAD = {
  basico:      { niveles: [1],    label: 'Básico',      desc: 'Solo conceptos N1' },
  intermedio:  { niveles: [1,2],  label: 'Intermedio',  desc: 'N1 y N2' },
  paes:        { niveles: [1,2,3],label: 'PAES',        desc: 'Todos los niveles' },
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Formatos de pregunta ──────────────────────────────────────
function buildQuestion(mc, pool) {
  // pool: array de mc distintos al actual para distractores
  const distPool = shuffle(pool.filter(p => p.id !== mc.id));

  // Elegir formato con distribución: 40% B, 30% A, 20% D, 10% C
  const r = Math.random();
  let formato = r < 0.40 ? 'B' : r < 0.70 ? 'A' : r < 0.90 ? 'D' : 'C';

  // Fallback si faltan distractores del mismo tipo
  let enunciado, correcta, distractores;

  if (formato === 'B') {
    // Flashcard directa
    enunciado = mc.flashcard_pregunta;
    correcta  = mc.flashcard_respuesta;
    const pool3 = distPool.filter(p => p.flashcard_respuesta && p.flashcard_respuesta !== correcta);
    if (pool3.length < 3) formato = 'A';
    else distractores = pool3.slice(0, 3).map(p => p.flashcard_respuesta);
  }

  if (formato === 'A') {
    // Identificar término
    enunciado = `¿Cuál de los siguientes términos corresponde a esta definición?\n\n"${mc.definicion}"`;
    correcta  = mc.termino;
    const pool3 = distPool.filter(p => p.termino && p.termino !== correcta);
    distractores = pool3.slice(0, 3).map(p => p.termino);
  }

  if (formato === 'D') {
    // Definición inversa
    enunciado = `¿A qué concepto corresponde la siguiente descripción?\n\n"${mc.definicion}"`;
    correcta  = mc.termino;
    const pool3 = distPool.filter(p => p.termino && p.termino !== correcta);
    distractores = pool3.slice(0, 3).map(p => p.termino);
  }

  if (formato === 'C') {
    // Error común — pregunta por afirmación INCORRECTA
    enunciado = `¿Cuál de las siguientes afirmaciones sobre "${mc.termino}" es INCORRECTA?`;
    correcta  = mc.error_comun;
    const pool3 = distPool.filter(p => p.error_comun && p.error_comun !== correcta);
    if (pool3.length < 3) {
      // Fallback a formato A
      enunciado = `¿Cuál de los siguientes términos corresponde a esta definición?\n\n"${mc.definicion}"`;
      correcta  = mc.termino;
      distractores = distPool.slice(0, 3).map(p => p.termino);
    } else {
      distractores = pool3.slice(0, 3).map(p => p.error_comun);
    }
  }

  if (!distractores || distractores.length < 3) {
    // Fallback final
    enunciado = mc.flashcard_pregunta;
    correcta  = mc.flashcard_respuesta;
    distractores = distPool.slice(0, 3).map(p => p.flashcard_respuesta || p.definicion);
  }

  return {
    mc,
    enunciado,
    options: shuffle([correcta, ...distractores.slice(0, 3)]),
    correcta,
    formato,
  };
}

// ── Extraer mc de temas filtrados por nivel ───────────────────
function getMCFromTemas(temas, temaIds, niveles) {
  return temas
    .filter(t => temaIds.includes(t.id))
    .flatMap(t => t.conceptos.flatMap(c => c.microconceptos))
    .filter(mc => niveles.includes(mc.nivel));
}

// ── Build Mini Ensayo (20 preguntas, 1 eje) ───────────────────
export function buildMiniEnsayo(temas, ejeId, dificultad = 'paes') {
  const { niveles } = DIFICULTAD[dificultad];
  const temaIds = EJES[ejeId];
  const pool = getMCFromTemas(temas, temaIds, niveles);
  if (pool.length < 4) return [];

  const selected = shuffle(pool).slice(0, Math.min(20, pool.length));
  return selected.map(mc => buildQuestion(mc, pool));
}

// ── Build Simulador PAES (65 preguntas) ──────────────────────
export function buildSimulador(temas) {
  const dist = { historia: 40, ciudadania: 15, economia: 10 };
  const questions = [];

  for (const [ejeId, n] of Object.entries(dist)) {
    const temaIds = EJES[ejeId];
    const pool = getMCFromTemas(temas, temaIds, [1, 2, 3]);
    if (pool.length < 4) continue;
    const selected = shuffle(pool).slice(0, Math.min(n, pool.length));
    selected.forEach(mc => questions.push({ ...buildQuestion(mc, pool), eje: ejeId }));
  }

  return shuffle(questions);
}

// ── Build Refuerzo ponderado por frecuencia y recencia ────────
export function buildRefuerzo(preguntasFalladas, temas, n = 20) {
  const now = Date.now();
  const entries = Object.values(preguntasFalladas);
  if (entries.length === 0) return [];

  // Score = veces * (1 + recencia_bonus)
  // recencia: más reciente = mayor peso
  const scored = entries.map(e => {
    const daysSince = (now - (e.ultimaFecha || now)) / 86400000;
    const recencia = Math.max(0, 1 - daysSince / 7); // decae en 7 días
    return { ...e, score: e.veces * (1 + recencia) };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);
  const top = sorted.slice(0, Math.min(n, sorted.length));

  // Reconstruir preguntas
  const allMC = temas.flatMap(t => t.conceptos.flatMap(c => c.microconceptos));
  const pool = allMC;

  return top.map(e => {
    const mc = allMC.find(m => m.id === e.mc_id);
    if (!mc) return null;
    return buildQuestion(mc, pool);
  }).filter(Boolean);
}

// ── Calcular resultado ────────────────────────────────────────
export function calcResultado(questions, respuestas) {
  // respuestas: { [idx]: opcion_seleccionada }
  let correctas = 0;
  const porTema = {};
  const porEje  = { historia: { c: 0, t: 0 }, ciudadania: { c: 0, t: 0 }, economia: { c: 0, t: 0 } };
  const falladas = [];

  questions.forEach((q, i) => {
    const resp = respuestas[i];
    const ok   = resp === q.correcta;
    if (ok) correctas++;

    const temaId = q.mc.tema_padre;
    if (!porTema[temaId]) porTema[temaId] = { c: 0, t: 0, nombre: temaId };
    porTema[temaId].t++;
    if (ok) porTema[temaId].c++;

    if (q.eje) {
      porEje[q.eje].t++;
      if (ok) porEje[q.eje].c++;
    }

    if (!ok) falladas.push(q.mc);
  });

  const total = questions.length;
  const pct   = Math.round((correctas / total) * 100);

  const temasArr = Object.values(porTema).map(t => ({
    ...t,
    pct: Math.round((t.c / t.t) * 100),
  })).sort((a, b) => b.pct - a.pct);

  return {
    correctas, total, pct,
    porEje: Object.fromEntries(
      Object.entries(porEje).map(([k, v]) => [k, { ...v, pct: v.t ? Math.round((v.c / v.t) * 100) : 0 }])
    ),
    fuertes: temasArr.filter(t => t.pct >= 70).slice(0, 3),
    debiles: temasArr.filter(t => t.pct < 70).slice(-3).reverse(),
    falladas,
  };
}

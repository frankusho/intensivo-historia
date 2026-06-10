import { useState, useCallback, useMemo } from 'react';
import curriculum from '../data/curriculum.json';
import {
  loadProgress, saveProgress, resetProgress,
  updateFlashcard, updateQuiz,
  markTemaVisto, markConceptoVisto, updateRacha,
  saveSimulador, saveMiniEnsayo, addPreguntaFallada, updateStatsTema,
} from '../engine/progress';
import { calcDominioTema, calcDominioTotal } from '../engine/dominio';
import { checkLogros } from '../engine/logros';

export function useApp() {
  const temas = curriculum.temas;

  const [progress, setProgressRaw] = useState(() => {
    const p = loadProgress();
    return updateRacha(p);
  });

  const setProgress = useCallback((updater) => {
    setProgressRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveProgress(next);
      return next;
    });
  }, []);

  const [screen, setScreen] = useState('dashboard');
  const [selectedTema, setSelectedTema] = useState(null);
  const [logrosNuevos, setLogrosNuevos] = useState([]);

  const dominioTotal = useMemo(() => calcDominioTotal(temas, progress), [temas, progress]);
  const dominioPorTema = useMemo(() =>
    Object.fromEntries(temas.map(t => [t.id, calcDominioTema(t, progress)])),
    [temas, progress]
  );

  // ── Flashcard ─────────────────────────────────────────────
  const onFlashcardResult = useCallback((mc_id, result) => {
    setProgress(prev => {
      const next = updateFlashcard(prev, mc_id, result);
      const nuevos = checkLogros(next, temas);
      if (nuevos.length > 0) {
        setLogrosNuevos(nuevos);
        return { ...next, logros: [...next.logros, ...nuevos.map(l => l.id)] };
      }
      return next;
    });
  }, [setProgress, temas]);

  // ── Quiz ──────────────────────────────────────────────────
  const onQuizResult = useCallback((mc_id, correct) => {
    setProgress(prev => updateQuiz(prev, mc_id, correct));
  }, [setProgress]);

  // ── Evaluación (mini ensayo / simulador / refuerzo) ───────
  const onEvaluacionResult = useCallback((resultado, questions, respuestas, tipo) => {
    setProgress(prev => {
      let next = prev;

      // Guardar preguntas falladas
      resultado.falladas?.forEach(mc => {
        next = addPreguntaFallada(next, mc);
      });

      // Stats por tema
      Object.entries(resultado.porEje || {}).forEach(([, _]) => {});
      // Stats por tema individual
      if (resultado.porTema) {
        Object.entries(resultado.porTema).forEach(([tema_id, data]) => {
          next = updateStatsTema(next, tema_id, data.c, data.t);
        });
      }

      // Guardar en historial
      if (tipo === 'simulador') next = saveSimulador(next, resultado);
      if (tipo === 'miniensayo') next = saveMiniEnsayo(next, resultado);

      // Logros
      const nuevos = checkLogros(next, temas);
      if (nuevos.length > 0) {
        setLogrosNuevos(nuevos);
        next = { ...next, logros: [...next.logros, ...nuevos.map(l => l.id)] };
      }

      return next;
    });
  }, [setProgress, temas]);

  // ── Navegación ────────────────────────────────────────────
  const goTema = useCallback((tema) => {
    setSelectedTema(tema);
    setProgress(p => markTemaVisto(p, tema.id));
    setScreen('tema');
  }, [setProgress]);

  const goFlashcards = useCallback((tema) => { setSelectedTema(tema); setScreen('flashcards'); }, []);
  const goQuiz       = useCallback((tema) => { setSelectedTema(tema); setScreen('quiz'); }, []);
  const goDashboard  = useCallback(() => { setScreen('dashboard'); setSelectedTema(null); }, []);
  const goRuta       = useCallback(() => setScreen('ruta'), []);
  const goLogros     = useCallback(() => setScreen('logros'), []);
  const goMiniEnsayo = useCallback(() => setScreen('miniensayo'), []);
  const goSimulador  = useCallback(() => setScreen('simulador'), []);
  const goRefuerzo   = useCallback(() => setScreen('refuerzo'), []);

  const dismissLogros = useCallback(() => setLogrosNuevos([]), []);

  const onReset = useCallback(() => {
    const fresh = resetProgress();
    setProgressRaw(fresh);
    setScreen('dashboard');
    setSelectedTema(null);
  }, []);

  return {
    temas, curriculum, progress, setProgress,
    dominioTotal, dominioPorTema,
    screen, selectedTema,
    logrosNuevos, dismissLogros,
    onFlashcardResult, onQuizResult, onEvaluacionResult,
    goTema, goFlashcards, goQuiz,
    goDashboard, goRuta, goLogros,
    goMiniEnsayo, goSimulador, goRefuerzo,
    onReset,
  };
}

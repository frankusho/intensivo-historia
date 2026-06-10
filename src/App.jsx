import React from 'react';
import { useApp } from './hooks/useApp';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Ruta from './components/Ruta';
import Tema from './components/Tema';
import Flashcards from './components/Flashcards';
import Quiz from './components/Quiz';
import Logros from './components/Logros';
import MiniEnsayo from './components/MiniEnsayo';
import SimuladorPAES from './components/SimuladorPAES';
import Refuerzo from './components/Refuerzo';
import { LogroToast } from './components/shared';
import { markConceptoVisto } from './engine/progress';

const FULL_LAYOUT = ['dashboard','ruta','logros','miniensayo','simulador','refuerzo'];

export default function App() {
  const app = useApp();

  const handleMarkConcepto = (id) => app.setProgress(p => markConceptoVisto(p, id));

  const handleNavigate = (screen) => {
    if (screen === 'dashboard')  app.goDashboard();
    else if (screen === 'ruta')  app.goRuta();
    else if (screen === 'logros') app.goLogros();
    else if (screen === 'miniensayo') app.goMiniEnsayo();
    else if (screen === 'simulador')  app.goSimulador();
    else if (screen === 'refuerzo')   app.goRefuerzo();
  };

  const useFullLayout = FULL_LAYOUT.includes(app.screen);

  return (
    <div className="app-shell">
      {useFullLayout && (
        <Sidebar
          screen={app.screen}
          onNavigate={handleNavigate}
          temas={app.temas}
          onGoFlashcards={app.goFlashcards}
          onGoQuiz={app.goQuiz}
          preguntasFalladas={app.progress.preguntasFalladas}
        />
      )}

      <div className={useFullLayout ? 'main-content' : ''} style={{ flex: 1 }}>
        {app.screen === 'dashboard' && (
          <Dashboard
            temas={app.temas} progress={app.progress}
            dominioTotal={app.dominioTotal} dominioPorTema={app.dominioPorTema}
            onGoTema={app.goTema} onGoFlashcards={app.goFlashcards}
            onGoRuta={app.goRuta} onGoLogros={app.goLogros}
            onGoSimulador={app.goSimulador} onGoMiniEnsayo={app.goMiniEnsayo}
          />
        )}
        {app.screen === 'ruta' && (
          <Ruta temas={app.temas} dominioPorTema={app.dominioPorTema}
            onGoTema={app.goTema} onBack={app.goDashboard} />
        )}
        {app.screen === 'tema' && app.selectedTema && (
          <Tema tema={app.selectedTema}
            dominio={app.dominioPorTema[app.selectedTema.id] ?? 0}
            progress={app.progress}
            onGoFlashcards={app.goFlashcards} onGoQuiz={app.goQuiz}
            onMarkConcepto={handleMarkConcepto} onBack={app.goDashboard} />
        )}
        {app.screen === 'flashcards' && app.selectedTema && (
          <Flashcards tema={app.selectedTema} progress={app.progress}
            onResult={app.onFlashcardResult}
            onBack={() => app.goTema(app.selectedTema)} />
        )}
        {app.screen === 'quiz' && app.selectedTema && (
          <Quiz tema={app.selectedTema} temas={app.temas} progress={app.progress}
            onResult={app.onQuizResult}
            onBack={() => app.goTema(app.selectedTema)} />
        )}
        {app.screen === 'miniensayo' && (
          <MiniEnsayo temas={app.temas}
            onResult={(r, qs, resp) => app.onEvaluacionResult(r, qs, resp, 'miniensayo')}
            onBack={app.goDashboard} />
        )}
        {app.screen === 'simulador' && (
          <SimuladorPAES temas={app.temas}
            onResult={(r, qs, resp) => app.onEvaluacionResult(r, qs, resp, 'simulador')}
            onBack={app.goDashboard} />
        )}
        {app.screen === 'refuerzo' && (
          <Refuerzo temas={app.temas}
            preguntasFalladas={app.progress.preguntasFalladas}
            onResult={(r, qs, resp) => app.onEvaluacionResult(r, qs, resp, 'refuerzo')}
            onBack={app.goDashboard} />
        )}
        {app.screen === 'logros' && (
          <Logros progress={app.progress} onBack={app.goDashboard} />
        )}
      </div>

      <LogroToast logros={app.logrosNuevos} onDismiss={app.dismissLogros} />
    </div>
  );
}

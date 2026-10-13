/**
 * AstroEspacio - Gestor de Estado y Registro Neuropsicológico
 */

class AppState {
  constructor() {
    this.reset();
  }

  reset() {
    this.child = {
      name: 'Explorador',
      age: 6,
      hand: 'diestro',
      avatar: '🧑‍🚀',
      stars: 0
    };

    this.mode = 'free'; // 'evaluation' o 'free'
    this.currentGameIndex = 0;
    this.evaluationSequence = ['game-direct', 'game-maze', 'game-reaction', 'game-perspective'];

    this.sessionStartTime = null;
    this.sessionEndTime = null;

    // Métricas detalladas por dimensión
    this.metrics = {
      direct: {
        totalTrials: 0,
        correctTrials: 0,
        byDirection: {
          arriba: { trials: 0, correct: 0, totalMs: 0 },
          abajo: { trials: 0, correct: 0, totalMs: 0 },
          izquierda: { trials: 0, correct: 0, totalMs: 0 },
          derecha: { trials: 0, correct: 0, totalMs: 0 }
        }
      },
      maze: {
        levelsCompleted: 0,
        totalLevels: 4,
        gemsCollected: 0,
        totalGemsAvailable: 0,
        totalMoves: 0,
        optimalMovesTotal: 0,
        durationMs: 0
      },
      reaction: {
        totalStimuli: 0,
        correctCount: 0,
        reactionTimesMs: [],
        falseAlarms: 0
      },
      perspective: {
        totalTrials: 0,
        correctCount: 0,
        leftTrials: { total: 0, correct: 0 },
        rightTrials: { total: 0, correct: 0 }
      }
    };
  }

  startSession(childData, mode = 'evaluation') {
    this.reset();
    this.child = { ...this.child, ...childData };
    this.mode = mode;
    this.sessionStartTime = Date.now();
    this.currentGameIndex = 0;
  }

  addStars(count = 1) {
    this.child.stars += count;
    const starEl = document.getElementById('navStarsCount');
    if (starEl) starEl.textContent = this.child.stars;
  }

  // Guardar resultado de prueba directa
  recordDirectAttempt(direction, isCorrect, responseTimeMs) {
    const d = this.metrics.direct;
    d.totalTrials++;
    if (isCorrect) d.correctTrials++;

    if (d.byDirection[direction]) {
      d.byDirection[direction].trials++;
      if (isCorrect) {
        d.byDirection[direction].correct++;
      }
      d.byDirection[direction].totalMs += responseTimeMs;
    }
  }

  // Guardar progreso de laberinto
  recordMazeLevel(levelNum, movesUsed, optimalMoves, gemsCollected, totalGems, durationMs) {
    const m = this.metrics.maze;
    m.levelsCompleted++;
    m.totalMoves += movesUsed;
    m.optimalMovesTotal += optimalMoves;
    m.gemsCollected += gemsCollected;
    m.totalGemsAvailable += totalGems;
    m.durationMs += durationMs;
  }

  // Guardar estímulo de reacción
  recordReactionStimulus(isCorrect, reactionTimeMs, wasTimeout = false) {
    const r = this.metrics.reaction;
    r.totalStimuli++;
    if (isCorrect) {
      r.correctCount++;
      if (reactionTimeMs > 0) {
        r.reactionTimesMs.push(reactionTimeMs);
      }
    } else if (wasTimeout) {
      r.falseAlarms++;
    } else {
      r.falseAlarms++;
    }
  }

  // Guardar intento de perspectiva
  recordPerspectiveAttempt(handTarget, isCorrect) {
    const p = this.metrics.perspective;
    p.totalTrials++;
    if (isCorrect) p.correctCount++;

    if (handTarget === 'izquierda') {
      p.leftTrials.total++;
      if (isCorrect) p.leftTrials.correct++;
    } else {
      p.rightTrials.total++;
      if (isCorrect) p.rightTrials.correct++;
    }
  }

  finishSession() {
    this.sessionEndTime = Date.now();
  }

  // Guardar reporte en el almacenamiento local
  saveReportToStorage(reportData) {
    try {
      const history = this.getHistoryFromStorage();
      history.unshift(reportData); // Añadir al inicio
      // Guardar máximo los últimos 20
      const trimmed = history.slice(0, 20);
      localStorage.setItem('astro_spatial_history', JSON.stringify(trimmed));
    } catch (err) {
      console.error("Error guardando reporte en localStorage", err);
    }
  }

  getHistoryFromStorage() {
    try {
      const data = localStorage.getItem('astro_spatial_history');
      return data ? JSON.parse(data) : [];
    } catch (err) {
      return [];
    }
  }
}

window.appState = new AppState();

/**
 * AstroEspacio - Generador de Reporte Psicopedagógico Integral
 * Genera métricas neurocognitivas, gráfico de radar en Canvas, análisis de lateralidad,
 * recomendaciones lúdicas personalizadas y diploma de graduación.
 */

class ReportGenerator {
  constructor() {
    this.canvas = document.getElementById('radarChartCanvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.currentReportData = null;

    this.bindEvents();
  }

  bindEvents() {
    const printBtn = document.getElementById('reportPrintBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    const playAgainBtn = document.getElementById('reportPlayAgainBtn');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        window.appCoordinator.restartFullEvaluation();
      });
    }

    const backMenuBtn = document.getElementById('reportBackMenuBtn');
    if (backMenuBtn) {
      backMenuBtn.addEventListener('click', () => {
        window.appCoordinator.showScreen('screenMenu');
      });
    }
  }

  /**
   * Procesa los datos acumulados en AppState y genera el informe completo
   */
  generateAndDisplay() {
    const state = window.appState;
    state.finishSession();

    const child = state.child;
    const metrics = state.metrics;
    const durationSec = Math.max(1, Math.round((state.sessionEndTime - state.sessionStartTime) / 1000));
    const durationMinStr = `${Math.floor(durationSec / 60)} min ${durationSec % 60} s`;

    // 1. CÁLCULO DE DIMENSIONES COGNITIVAS (0 a 100)
    // Dimensión A: Orientación Vertical (Arriba / Abajo)
    const vertTrials = metrics.direct.byDirection.arriba.trials + metrics.direct.byDirection.abajo.trials;
    const vertCorrect = metrics.direct.byDirection.arriba.correct + metrics.direct.byDirection.abajo.correct;
    const scoreVertical = vertTrials > 0 ? Math.round((vertCorrect / vertTrials) * 100) : 85;

    // Dimensión B: Orientación Lateral (Izquierda / Derecha)
    const latTrials = metrics.direct.byDirection.izquierda.trials + metrics.direct.byDirection.derecha.trials;
    const latCorrect = metrics.direct.byDirection.izquierda.correct + metrics.direct.byDirection.derecha.correct;
    const scoreLateral = latTrials > 0 ? Math.round((latCorrect / latTrials) * 100) : 75;

    // Dimensión C: Planificación Espacial y Memoria (Laberinto)
    let scorePlanning = 80;
    if (metrics.maze.levelsCompleted > 0) {
      const gemRatio = metrics.maze.totalGemsAvailable > 0 
        ? (metrics.maze.gemsCollected / metrics.maze.totalGemsAvailable) 
        : 1;
      const efficiencyRatio = metrics.maze.totalMoves > 0 
        ? Math.min(1.2, metrics.maze.optimalMovesTotal / metrics.maze.totalMoves) 
        : 1;
      scorePlanning = Math.min(100, Math.round((gemRatio * 0.5 + efficiencyRatio * 0.5) * 100));
    }

    // Dimensión D: Atención Sostenida y Velocidad de Procesamiento (Reflejos)
    let scoreSpeed = 75;
    let avgReactionMs = 0;
    if (metrics.reaction.totalStimuli > 0) {
      const reactAccuracy = metrics.reaction.correctCount / metrics.reaction.totalStimuli;
      avgReactionMs = metrics.reaction.reactionTimesMs.length > 0
        ? Math.round(metrics.reaction.reactionTimesMs.reduce((a, b) => a + b, 0) / metrics.reaction.reactionTimesMs.length)
        : 1100;
      
      // Baremo normativo infantil aproximado: 600ms = 100%, 1500ms = 50%
      const speedFactor = Math.max(0.4, Math.min(1.1, (1600 - avgReactionMs) / 1000));
      scoreSpeed = Math.min(100, Math.round((reactAccuracy * 0.6 + speedFactor * 0.4) * 100));
    }

    // Dimensión E: Descentración / Perspectiva Externa (Robot)
    let scorePerspective = 70;
    if (metrics.perspective.totalTrials > 0) {
      scorePerspective = Math.round((metrics.perspective.correctCount / metrics.perspective.totalTrials) * 100);
    }

    // Puntaje Global Ponderado
    const globalScore = Math.round(
      scoreVertical * 0.20 +
      scoreLateral * 0.25 +
      scorePlanning * 0.25 +
      scoreSpeed * 0.15 +
      scorePerspective * 0.15
    );

    // Folio único
    const folioId = `ASTRO-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    const reportData = {
      folio: folioId,
      date: dateStr,
      time: timeStr,
      child: { ...child },
      duration: durationMinStr,
      globalScore,
      dimensions: {
        vertical: scoreVertical,
        lateral: scoreLateral,
        planning: scorePlanning,
        speed: scoreSpeed,
        perspective: scorePerspective
      },
      avgReactionMs
    };

    this.currentReportData = reportData;
    state.saveReportToStorage(reportData);

    // Pintar en DOM
    this.renderDOM(reportData);
    this.drawRadarChart(reportData.dimensions);
  }

  renderDOM(data) {
    const { child, dimensions, globalScore } = data;

    // Metadatos
    document.getElementById('repDate').textContent = data.date;
    document.getElementById('repTime').textContent = data.time;
    document.getElementById('repFolio').textContent = data.folio;
    document.getElementById('repChildName').textContent = `${child.avatar} ${child.name}`;
    document.getElementById('repChildAge').textContent = `${child.age} años`;
    document.getElementById('repChildHand').textContent = child.hand.toUpperCase();
    document.getElementById('repDuration').textContent = data.duration;

    // Score circular y badge
    document.getElementById('repGlobalScore').textContent = globalScore;
    const circle = document.getElementById('repCircleScore');
    if (circle) {
      const circumference = 2 * Math.PI * 42; // ~264
      const offset = circumference - (globalScore / 100) * circumference;
      circle.style.strokeDasharray = `${circumference}`;
      circle.style.strokeDashoffset = `${offset}`;
    }

    const badge = document.getElementById('repGlobalLevelBadge');
    const title = document.getElementById('repGlobalLevelTitle');
    const summary = document.getElementById('repGlobalSummary');

    if (globalScore >= 85) {
      badge.textContent = "Madurez Avanzada";
      badge.style.background = "#10B981";
      title.textContent = "Excelente Dominio Espacial y Funciones Ejecutivas";
      summary.textContent = `${child.name} muestra una rápida integración del esquema corporal y espacial. Es capaz de anticipar trayectorias, reaccionar con agilidad y diferenciar planos con alto grado de precisión.`;
    } else if (globalScore >= 70) {
      badge.textContent = "Madurez Favorable";
      badge.style.background = "#4F46E5";
      title.textContent = "Ubicación Espacial en Desarrollo Esperado para su Edad";
      summary.textContent = `${child.name} comprende con claridad las nociones de orientación y resuelve problemas espaciales con buena eficacia. Continúa afianzando la discriminación lateral bajo presión.`;
    } else {
      badge.textContent = "En Proceso de Afianzamiento";
      badge.style.background = "#F59E0B";
      title.textContent = "Oportunidad de Fortalecimiento Espacial y Atencional";
      summary.textContent = `${child.name} se beneficiará significativamente de juegos corporales y manipulativos para reforzar la lateralidad y el control inhibitorio antes de responder.`;
    }

    // Tabla de Dimensiones
    const tbody = document.getElementById('repTableBody');
    const dimList = [
      { name: "Orientación Vertical (Arriba / Abajo)", score: dimensions.vertical, time: "Rápido", diag: this.getDiagnosis(dimensions.vertical, child.age) },
      { name: "Orientación Lateral (Izquierda / Derecha)", score: dimensions.lateral, time: "Medio", diag: this.getDiagnosis(dimensions.lateral, child.age) },
      { name: "Planificación Espacial & Memoria de Trabajo", score: dimensions.planning, time: "Bueno", diag: this.getDiagnosis(dimensions.planning, child.age) },
      { name: "Atención Focalizada & Velocidad de Reflejos", score: dimensions.speed, time: `${data.avgReactionMs > 0 ? data.avgReactionMs + ' ms' : 'Normal'}`, diag: this.getDiagnosis(dimensions.speed, child.age) },
      { name: "Descentración / Perspectiva Especular", score: dimensions.perspective, time: "Variable", diag: this.getDiagnosis(dimensions.perspective, child.age) }
    ];

    tbody.innerHTML = dimList.map(item => `
      <tr>
        <td><strong>${item.name}</strong></td>
        <td><span class="score-pill ${item.score >= 80 ? 'score-high' : item.score >= 60 ? 'score-mid' : 'score-low'}">${item.score}%</span></td>
        <td>${item.time}</td>
        <td>${item.diag}</td>
      </tr>
    `).join('');

    // Barras comparativas de ejes
    document.getElementById('repBarVertical').style.width = `${dimensions.vertical}%`;
    document.getElementById('repBarLateral').style.width = `${dimensions.lateral}%`;
    document.getElementById('repBarPerspective').style.width = `${dimensions.perspective}%`;

    document.getElementById('repTextVertical').textContent = dimensions.vertical >= 80 
      ? "Dominio consolidado. Distingue sin dificultad el plano superior e inferior."
      : "Requiere apoyo para fijar los puntos de referencia arriba y abajo en actividades gráficas.";

    document.getElementById('repTextLateral').textContent = dimensions.lateral >= 80
      ? "Excelente integración de la lateralidad propia (diferencia izquierda y derecha con fluidez)."
      : "En fase de afianzamiento natural. Es normal que aún recurra a pistas visuales corporales.";

    document.getElementById('repTextPerspective').textContent = dimensions.perspective >= 75
      ? "Alta capacidad de descentración: logra colocarse mentalmente en el lugar de otra persona."
      : "Pensamiento predominantemente egocéntrico acorde a su etapa piagetiana. En evolución.";

    // Recomendaciones Pedagógicas
    this.renderRecommendations(dimensions, child);

    // Diploma
    document.getElementById('diplomaName').textContent = child.name.toUpperCase();
    document.getElementById('diplomaDate').textContent = `${data.date}`;
  }

  getDiagnosis(score, age) {
    if (score >= 85) return "Consolidado Superior";
    if (score >= 70) return "Adecuado para su edad";
    if (score >= 55) return "En Proceso";
    return "Requiere Refuerzo";
  }

  renderRecommendations(dimensions, child) {
    const listEl = document.getElementById('repRecommendationsList');
    const recs = [];

    // Recomendación para Lateralidad (Izquierda / Derecha)
    if (dimensions.lateral < 85) {
      recs.push({
        icon: "🔴🟢",
        title: "Estrategia de la Pulsera o Cinta de Color",
        desc: `Colocar una pulserita roja en la muñeca izquierda y una verde en la derecha durante actividades diarias (paseos, ordenar juguetes). Esto refuerza el mapa corporal antes de la abstracción gráfica.`
      });
      recs.push({
        icon: "💃🕺",
        title: "Juegos Motores de 'Simón Dice' Cruzado",
        desc: `Pedirle órdenes motoras como: 'Toca tu rodilla izquierda con tu mano derecha' o 'Da dos saltos a la izquierda'. Estimula la integración hemisférica cerebral.`
      });
    } else {
      recs.push({
        icon: "⭐🧭",
        title: "Fortalecer Orientación en Espacios Abiertos",
        desc: `${child.name} tiene una excelente base. Pueden crear 'búsquedas del tesoro' con mapas sencillos dibujados en papel con instrucciones cardinales.`
      });
    }

    // Recomendación para Planificación y Memoria
    if (dimensions.planning < 85) {
      recs.push({
        icon: "🧩🗺️",
        title: "Laberintos en Papel y Bloques de Construcción",
        desc: `Practicar laberintos físicos trazando primero con el dedo índice antes de usar el lápiz. Esto promueve la inhibición del impulso y la anticipación de rutas.`
      });
    }

    // Recomendación para Atención y Reflejos
    if (dimensions.speed < 85) {
      recs.push({
        icon: "🚦⚡",
        title: "Juego del Semáforo y Control Inhibitorio",
        desc: `Juegos donde una señal indique actuar y otra detenerse en seco (ej. 'Estatua espacial'). Ayuda a mejorar los tiempos de respuesta y la autorregulación.`
      });
    }

    // Recomendación para Perspectiva
    if (dimensions.perspective < 75) {
      recs.push({
        icon: "🪞🤝",
        title: "Juego del Espejo Frente a Frente",
        desc: `Ponerse de pie frente al niño e imitarse mutuamente. Reflexionar juntos: '¿Cuál es mi mano derecha cuando te miro de frente?'. Favorece la salida del egocentrismo espacial.`
      });
    }

    listEl.innerHTML = recs.map(r => `
      <div class="rec-item">
        <span class="rec-icon">${r.icon}</span>
        <div class="rec-body">
          <h5>${r.title}</h5>
          <p>${r.desc}</p>
        </div>
      </div>
    `).join('');
  }

  /**
   * Dibuja un polígono de radar de 5 variables en Canvas
   */
  drawRadarChart(dimensions) {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 45;

    ctx.clearRect(0, 0, width, height);

    const labels = ["Vertical", "Lateral", "Planificación", "Reflejos", "Perspectiva"];
    const values = [
      dimensions.vertical / 100,
      dimensions.lateral / 100,
      dimensions.planning / 100,
      dimensions.speed / 100,
      dimensions.perspective / 100
    ];

    const totalAxes = labels.length;
    const angleStep = (Math.PI * 2) / totalAxes;
    const startAngle = -Math.PI / 2;

    // 1. Dibujar anillos concéntricos
    const levels = [0.25, 0.5, 0.75, 1.0];
    levels.forEach(lvl => {
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = startAngle + i * angleStep;
        const x = centerX + Math.cos(angle) * radius * lvl;
        const y = centerY + Math.sin(angle) * radius * lvl;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = lvl === 1.0 ? "#CBD5E1" : "#E2E8F0";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 2. Dibujar ejes radiales y textos
    ctx.font = "bold 11px Fredoka, sans-serif";
    ctx.fillStyle = "#475569";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (let i = 0; i < totalAxes; i++) {
      const angle = startAngle + i * angleStep;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Posición del label exterior
      const labelX = centerX + Math.cos(angle) * (radius + 24);
      const labelY = centerY + Math.sin(angle) * (radius + 24);
      ctx.fillText(labels[i], labelX, labelY);
    }

    // 3. Dibujar polígono de datos
    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
      const angle = startAngle + i * angleStep;
      const val = Math.max(0.1, values[i]);
      const x = centerX + Math.cos(angle) * radius * val;
      const y = centerY + Math.sin(angle) * radius * val;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // Relleno degradado semitransparente
    ctx.fillStyle = "rgba(79, 70, 229, 0.35)";
    ctx.fill();
    ctx.strokeStyle = "#4F46E5";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 4. Dibujar puntos destacados en cada vértice
    for (let i = 0; i < totalAxes; i++) {
      const angle = startAngle + i * angleStep;
      const val = Math.max(0.1, values[i]);
      const x = centerX + Math.cos(angle) * radius * val;
      const y = centerY + Math.sin(angle) * radius * val;

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#F59E0B";
      ctx.fill();
      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  /**
   * Carga un reporte histórico guardado previamente
   */
  loadFromHistory(reportData) {
    this.currentReportData = reportData;
    this.renderDOM(reportData);
    this.drawRadarChart(reportData.dimensions);
    window.appCoordinator.showScreen('screenReport');
  }
}

window.reportGenerator = new ReportGenerator();

/**
 * AstroEspacio - Coordinador General de la Aplicación
 * Gestiona el flujo de pantallas, la navegación y la orquestación de la evaluación.
 */

class AppCoordinator {
  constructor() {
    this.screens = {
      welcome: document.getElementById('screenWelcome'),
      menu: document.getElementById('screenMenu'),
      tutorial: document.getElementById('screenTutorial'),
      'game-direct': document.getElementById('screenGameDirect'),
      'game-maze': document.getElementById('screenGameMaze'),
      'game-reaction': document.getElementById('screenGameReaction'),
      'game-perspective': document.getElementById('screenGamePerspective'),
      report: document.getElementById('screenReport')
    };

    this.navPill = document.getElementById('navPlayerPill');
    this.navAvatar = document.getElementById('navPlayerAvatar');
    this.navName = document.getElementById('navPlayerName');
    this.exitGameBtn = document.getElementById('exitGameBtn');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.voiceToggleBtn = document.getElementById('voiceToggleBtn');
    this.soundIcon = document.getElementById('soundIcon');
    this.voiceIcon = document.getElementById('voiceIcon');

    this.selectedAvatar = '🧑‍🚀';
    this.bindEvents();
  }

  init() {
    this.showScreen('screenWelcome');
  }

  bindEvents() {
    // 1. Selector de avatares
    const avatarBtns = document.querySelectorAll('.avatar-opt');
    avatarBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        avatarBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        this.selectedAvatar = btn.getAttribute('data-avatar');
        window.soundSystem.playClick();
      });
    });

    // 2. Iniciar Evaluación Completa
    const startFullBtn = document.getElementById('startFullEvalBtn');
    if (startFullBtn) {
      startFullBtn.addEventListener('click', () => {
        this.handleStartEvaluation();
      });
    }

    // Iniciar desde banner inferior del menú
    const launchFullFromMenu = document.getElementById('btnLaunchFullEvalFromMenu');
    if (launchFullFromMenu) {
      launchFullFromMenu.addEventListener('click', () => {
        this.startEvaluationSequence();
      });
    }

    // 3. Modo Libre
    const startFreeBtn = document.getElementById('startFreeModeBtn');
    if (startFreeBtn) {
      startFreeBtn.addEventListener('click', () => {
        this.handleStartFreeMode();
      });
    }

    // 4. Tarjetas del menú libre
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
      card.addEventListener('click', () => {
        const action = card.getAttribute('data-action');
        this.launchIndividualGame(action);
      });
    });

    // 5. Botón Salir al Menú
    if (this.exitGameBtn) {
      this.exitGameBtn.addEventListener('click', () => {
        window.speechGuide.stop();
        window.soundSystem.playClick();
        this.showScreen('screenMenu');
      });
    }

    // 6. Controles de Sonido y Voz en la cabecera
    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        const enabled = window.soundSystem.toggle();
        this.soundIcon.textContent = enabled ? '🔊' : '🔇';
        this.soundToggleBtn.classList.toggle('muted', !enabled);
      });
    }

    if (this.voiceToggleBtn) {
      this.voiceToggleBtn.addEventListener('click', () => {
        const enabled = window.speechGuide.toggle();
        this.voiceIcon.textContent = enabled ? '🗣️' : '🤐';
        this.voiceToggleBtn.classList.toggle('muted', !enabled);
      });
    }

    // 7. Modal de Historial
    const viewSavedBtn = document.getElementById('viewSavedReportsBtn');
    const historyModal = document.getElementById('historyModal');
    const closeHistoryBtn = document.getElementById('closeHistoryModalBtn');

    if (viewSavedBtn && historyModal) {
      viewSavedBtn.addEventListener('click', () => {
        this.renderHistoryModal();
        historyModal.classList.remove('hidden');
      });
    }

    if (closeHistoryBtn && historyModal) {
      closeHistoryBtn.addEventListener('click', () => {
        historyModal.classList.add('hidden');
      });
    }

    // Click fuera del modal para cerrar
    if (historyModal) {
      historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
          historyModal.classList.add('hidden');
        }
      });
    }

    // 8. Logo para volver al inicio
    const navHomeBtn = document.getElementById('navHomeBtn');
    if (navHomeBtn) {
      navHomeBtn.addEventListener('click', () => {
        window.speechGuide.stop();
        this.showScreen('screenWelcome');
      });
    }
  }

  getFormData() {
    const nameInput = document.getElementById('childName');
    const ageSelect = document.getElementById('childAge');
    const handRadio = document.querySelector('input[name="childHand"]:checked');

    const name = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Explorador';
    const age = ageSelect ? parseInt(ageSelect.value, 10) : 6;
    const hand = handRadio ? handRadio.value : 'diestro';

    return {
      name,
      age,
      hand,
      avatar: this.selectedAvatar,
      stars: 0
    };
  }

  updatePlayerPill(childData) {
    if (this.navPill) {
      this.navAvatar.textContent = childData.avatar;
      this.navName.textContent = childData.name;
      this.navPill.classList.remove('hidden');
    }
  }

  showScreen(screenId) {
    window.speechGuide.stop();

    // Ocultar todas las pantallas
    Object.values(this.screens).forEach(screen => {
      if (screen) {
        screen.classList.add('hidden');
        screen.classList.remove('active');
      }
    });

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Mostrar/ocultar botón de salir
    if (this.exitGameBtn) {
      const isPlaying = screenId.startsWith('screenGame') || screenId === 'screenTutorial';
      this.exitGameBtn.classList.toggle('hidden', !isPlaying);
    }
  }

  handleStartEvaluation() {
    const childData = this.getFormData();
    window.appState.startSession(childData, 'evaluation');
    this.updatePlayerPill(childData);
    window.soundSystem.playClick();
    this.startEvaluationSequence();
  }

  handleStartFreeMode() {
    const childData = this.getFormData();
    window.appState.startSession(childData, 'free');
    this.updatePlayerPill(childData);
    window.soundSystem.playClick();
    this.showScreen('screenMenu');
  }

  startEvaluationSequence() {
    window.appState.mode = 'evaluation';
    window.appState.currentGameIndex = 0;
    this.launchGameInSequence(0);
  }

  launchGameInSequence(stepIndex) {
    const sequence = window.appState.evaluationSequence;
    if (stepIndex >= sequence.length) {
      // Evaluación completada con éxito -> Mostrar Reporte Oficial
      this.showScreen('screenReport');
      window.reportGenerator.generateAndDisplay();
      return;
    }

    window.appState.currentGameIndex = stepIndex;
    const gameKey = sequence[stepIndex];
    this.launchIndividualGame(gameKey);
  }

  launchIndividualGame(gameKey) {
    window.soundSystem.playClick();

    switch (gameKey) {
      case 'tutorial':
        this.showScreen('screenTutorial');
        window.tutorialModule.start();
        break;
      case 'game-direct':
        this.showScreen('screenGameDirect');
        window.gameDirect.start();
        break;
      case 'game-maze':
        this.showScreen('screenGameMaze');
        window.gameMaze.start();
        break;
      case 'game-reaction':
        this.showScreen('screenGameReaction');
        window.gameReaction.start();
        break;
      case 'game-perspective':
        this.showScreen('screenGamePerspective');
        window.gamePerspective.start();
        break;
      default:
        this.showScreen('screenMenu');
    }
  }

  onGameFinished(gameKey) {
    if (window.appState.mode === 'evaluation') {
      const nextIndex = window.appState.currentGameIndex + 1;
      this.launchGameInSequence(nextIndex);
    } else {
      // En modo libre, preguntar o volver al menú
      this.showScreen('screenMenu');
    }
  }

  restartFullEvaluation() {
    const currentChild = window.appState.child;
    window.appState.startSession(currentChild, 'evaluation');
    this.startEvaluationSequence();
  }

  renderHistoryModal() {
    const container = document.getElementById('savedReportsList');
    if (!container) return;

    const history = window.appState.getHistoryFromStorage();
    if (history.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 30px; color: #64748B;">
          <span style="font-size: 3rem; display: block; margin-bottom: 8px;">📭</span>
          <p>No hay reportes guardados todavía.</p>
          <small>¡Completa una evaluación espacial para generar el primero!</small>
        </div>
      `;
      return;
    }

    container.innerHTML = history.map((rep, idx) => `
      <div class="saved-report-item">
        <div class="saved-rep-info">
          <h4>${rep.child.avatar} ${rep.child.name} (${rep.child.age} años)</h4>
          <p>📅 ${rep.date} a las ${rep.time} | Folio: ${rep.folio}</p>
        </div>
        <div style="display: flex; align-items: center; gap: 14px;">
          <span class="saved-rep-score">${rep.globalScore} pts</span>
          <button class="btn btn-outline btn-sm" onclick="window.appCoordinator.openSavedReport(${idx})">
            Ver Reporte 📄
          </button>
        </div>
      </div>
    `).join('');
  }

  openSavedReport(index) {
    const history = window.appState.getHistoryFromStorage();
    const rep = history[index];
    if (rep) {
      const modal = document.getElementById('historyModal');
      if (modal) modal.classList.add('hidden');
      window.reportGenerator.loadFromHistory(rep);
    }
  }
}

// Iniciar aplicación al cargar el DOM
window.addEventListener('DOMContentLoaded', () => {
  window.appCoordinator = new AppCoordinator();
  window.appCoordinator.init();
});

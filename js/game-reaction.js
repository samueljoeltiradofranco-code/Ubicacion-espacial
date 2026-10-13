/**
 * AstroEspacio - Juego 3: Reflejos de Asteroide
 * Mide y fortalece: Velocidad de procesamiento psicomotriz, tiempo de reacción y control inhibitorio.
 */

class GameReaction {
  constructor() {
    this.totalRounds = 10;
    this.currentRound = 0;
    this.activeDirection = null;
    this.stimulusTimestamp = 0;
    this.timerId = null;
    this.gaugeInterval = null;
    this.timeoutLimitMs = 3500; // 3.5 segundos generosos para niños
    this.isWaitingForResponse = false;
    this.currentReactionTimes = [];

    // Elementos DOM
    this.roundCounterEl = document.getElementById('reactRoundCounter');
    this.totalRoundsEl = document.getElementById('reactTotalRounds');
    this.progressBar = document.getElementById('reactProgressBar');
    this.avgTimeEl = document.getElementById('reactAvgTime');
    this.instructionEl = document.getElementById('reactInstructionText');
    this.voiceBtn = document.getElementById('reactVoiceBtn');
    this.stimulusCard = document.getElementById('stimulusCard');
    this.timeGaugeFill = document.getElementById('reactTimeBar');
    this.feedbackToast = document.getElementById('reactFeedback');

    this.buttons = {
      arriba: document.getElementById('reactBtnUp'),
      abajo: document.getElementById('reactBtnDown'),
      izquierda: document.getElementById('reactBtnLeft'),
      derecha: document.getElementById('reactBtnRight')
    };

    this.bindEvents();
  }

  bindEvents() {
    Object.keys(this.buttons).forEach((dir) => {
      const btn = this.buttons[dir];
      if (btn) {
        btn.addEventListener('click', () => this.handlePlayerResponse(dir));
      }
    });

    this.voiceBtn.addEventListener('click', () => {
      this.narrateInstruction();
    });
  }

  start() {
    this.currentRound = 0;
    this.currentReactionTimes = [];
    this.totalRoundsEl.textContent = this.totalRounds;
    this.avgTimeEl.textContent = '0';
    this.narrateInstruction();

    setTimeout(() => {
      this.nextRound();
    }, 1200);
  }

  narrateInstruction() {
    window.speechGuide.speak("¡Atento a la flecha! Cuando aparezca, toca el botón correcto lo más rápido que puedas.");
  }

  nextRound() {
    if (this.currentRound >= this.totalRounds) {
      this.finish();
      return;
    }

    this.currentRound++;
    this.roundCounterEl.textContent = this.currentRound;
    const progressPct = ((this.currentRound - 1) / this.totalRounds) * 100;
    this.progressBar.style.width = `${progressPct}%`;

    // Estado de espera (pre-estímulo)
    this.isWaitingForResponse = false;
    this.stimulusCard.innerHTML = `<span class="stimulus-waiting">¡Atento...! 👀</span>`;
    this.stimulusCard.style.borderColor = '#38BDF8';
    this.timeGaugeFill.style.width = '100%';

    // Retardo aleatorio entre 800ms y 2000ms para evitar respuestas automáticas
    const randomDelay = Math.floor(Math.random() * 1200) + 800;

    this.timerId = setTimeout(() => {
      this.presentStimulus();
    }, randomDelay);
  }

  presentStimulus() {
    const directions = ['arriba', 'abajo', 'izquierda', 'derecha'];
    this.activeDirection = directions[Math.floor(Math.random() * directions.length)];

    const icons = {
      arriba: '⬆️',
      abajo: '⬇️',
      izquierda: '⬅️',
      derecha: '➡️'
    };

    const colors = {
      arriba: '#3B82F6',
      abajo: '#10B981',
      izquierda: '#EF4444',
      derecha: '#F59E0B'
    };

    this.stimulusCard.innerHTML = `
      <div class="stimulus-arrow" style="color: ${colors[this.activeDirection]}">
        ${icons[this.activeDirection]}
      </div>
    `;
    this.stimulusCard.style.borderColor = colors[this.activeDirection];

    this.isWaitingForResponse = true;
    this.stimulusTimestamp = Date.now();
    window.soundSystem.playClick();

    // Barra de tiempo decreciente
    const startTime = Date.now();
    clearInterval(this.gaugeInterval);

    this.gaugeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPct = Math.max(0, 100 - (elapsed / this.timeoutLimitMs) * 100);
      this.timeGaugeFill.style.width = `${remainingPct}%`;

      if (elapsed >= this.timeoutLimitMs) {
        clearInterval(this.gaugeInterval);
        this.handleTimeout();
      }
    }, 40);
  }

  handlePlayerResponse(dir) {
    // Si respondió antes de que apareciera el estímulo (falsa alarma / impulsividad)
    if (!this.isWaitingForResponse) {
      window.soundSystem.playSoftError();
      this.showToast("¡Espera a que aparezca la flecha! ⏳", "incorrect");
      window.appState.recordReactionStimulus(false, 0, false);
      return;
    }

    clearInterval(this.gaugeInterval);
    this.isWaitingForResponse = false;

    const reactionTime = Date.now() - this.stimulusTimestamp;
    const isCorrect = (dir === this.activeDirection);

    window.appState.recordReactionStimulus(isCorrect, reactionTime, false);

    if (isCorrect) {
      this.currentReactionTimes.push(reactionTime);
      const avg = Math.round(this.currentReactionTimes.reduce((a, b) => a + b, 0) / this.currentReactionTimes.length);
      this.avgTimeEl.textContent = avg;
      window.appState.addStars(1);
      window.soundSystem.playSuccess();
      this.showToast(`¡Rápido como un rayo! ⚡ ${reactionTime} ms`, "correct");
    } else {
      window.soundSystem.playSoftError();
      this.showToast(`¡Uy! La flecha señalaba a ${this.activeDirection.toUpperCase()}`, "incorrect");
    }

    setTimeout(() => {
      this.nextRound();
    }, 1200);
  }

  handleTimeout() {
    if (!this.isWaitingForResponse) return;
    this.isWaitingForResponse = false;

    window.soundSystem.playSoftError();
    window.appState.recordReactionStimulus(false, this.timeoutLimitMs, true);
    this.showToast("¡Se escapó el asteroide! 🚀 Intenta más rápido", "incorrect");

    setTimeout(() => {
      this.nextRound();
    }, 1200);
  }

  showToast(msg, type) {
    this.feedbackToast.textContent = msg;
    this.feedbackToast.className = `feedback-toast ${type}`;
    this.feedbackToast.classList.remove('hidden');

    setTimeout(() => {
      this.feedbackToast.classList.add('hidden');
    }, 1100);
  }

  finish() {
    clearInterval(this.gaugeInterval);
    clearTimeout(this.timerId);
    this.progressBar.style.width = '100%';
    window.soundSystem.playVictory();
    window.confettiCannon.fire(50);

    setTimeout(() => {
      window.appCoordinator.onGameFinished('game-reaction');
    }, 1200);
  }
}

window.gameReaction = new GameReaction();

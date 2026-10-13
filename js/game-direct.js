/**
 * AstroEspacio - Juego 1: El Radar de las Estrellas (Orientación Absoluta)
 * Mide precisión y velocidad en Arriba, Abajo, Izquierda y Derecha.
 */

class GameDirect {
  constructor() {
    this.totalRounds = 8;
    this.currentRound = 0;
    this.score = 0;
    this.activeDirection = null;
    this.questionStartTime = 0;
    this.roundsSequence = [];
    this.isInputBlocked = false;

    // Elementos DOM
    this.currentRoundEl = document.getElementById('directCurrentRound');
    this.totalRoundsEl = document.getElementById('directTotalRounds');
    this.progressBar = document.getElementById('directProgressBar');
    this.scoreEl = document.getElementById('directScore');
    this.instructionText = document.getElementById('directInstructionText');
    this.voiceBtn = document.getElementById('directVoiceBtn');
    this.feedbackToast = document.getElementById('directFeedback');
    this.centerRocket = document.getElementById('directCenterRocket');

    this.targets = {
      arriba: document.getElementById('targetUp'),
      abajo: document.getElementById('targetDown'),
      izquierda: document.getElementById('targetLeft'),
      derecha: document.getElementById('targetRight')
    };

    this.bindEvents();
  }

  bindEvents() {
    Object.keys(this.targets).forEach((dir) => {
      const btn = this.targets[dir];
      if (btn) {
        btn.addEventListener('click', () => this.handleDirectionClick(dir));
      }
    });

    this.voiceBtn.addEventListener('click', () => {
      this.narrateInstruction();
    });
  }

  start() {
    this.currentRound = 0;
    this.score = 0;
    this.totalRoundsEl.textContent = this.totalRounds;
    this.scoreEl.textContent = this.score;

    // Generar secuencia balanceada de 8 preguntas (2 de cada dirección)
    const base = ['arriba', 'abajo', 'izquierda', 'derecha', 'arriba', 'abajo', 'izquierda', 'derecha'];
    // Barajar
    this.roundsSequence = base.sort(() => Math.random() - 0.5);

    this.nextRound();
  }

  nextRound() {
    if (this.currentRound >= this.totalRounds) {
      this.finish();
      return;
    }

    this.currentRound++;
    this.isInputBlocked = false;
    this.activeDirection = this.roundsSequence[this.currentRound - 1];

    this.currentRoundEl.textContent = this.currentRound;
    const progressPct = ((this.currentRound - 1) / this.totalRounds) * 100;
    this.progressBar.style.width = `${progressPct}%`;

    // Resetear rotación de cohete central
    if (this.centerRocket) {
      this.centerRocket.style.transform = 'rotate(0deg)';
    }

    // Frases variadas para niños
    const prompts = {
      arriba: ["¡Toca la dirección ARRIBA! ⬆️", "¡El cohete quiere volar hacia ARRIBA! ☁️", "¡Busca el cielo, toca ARRIBA! ⬆️"],
      abajo: ["¡Toca la dirección ABAJO! ⬇️", "¡El cohete quiere descender hacia ABAJO! 🌱", "¡Busca la tierra, toca ABAJO! ⬇️"],
      izquierda: ["¡Toca la dirección IZQUIERDA! ⬅️", "¡Gira hacia la IZQUIERDA (pulsera roja)! 🔴", "¡Toca a la IZQUIERDA! ⬅️"],
      derecha: ["¡Toca la dirección DERECHA! ➡️", "¡Gira hacia la DERECHA (pulsera verde)! 🟢", "¡Toca a la DERECHA! ➡️"]
    };

    const chosenText = prompts[this.activeDirection][Math.floor(Math.random() * prompts[this.activeDirection].length)];
    this.instructionText.textContent = chosenText;

    this.questionStartTime = Date.now();
    this.narrateInstruction();
  }

  narrateInstruction() {
    if (!this.activeDirection) return;
    const voiceTexts = {
      arriba: "¡Toca la dirección Arriba!",
      abajo: "¡Toca la dirección Abajo!",
      izquierda: "¡Toca la dirección Izquierda!",
      derecha: "¡Toca la dirección Derecha!"
    };
    window.speechGuide.speak(voiceTexts[this.activeDirection]);
  }

  handleDirectionClick(dir) {
    if (this.isInputBlocked) return;
    this.isInputBlocked = true;

    const responseTimeMs = Date.now() - this.questionStartTime;
    const isCorrect = (dir === this.activeDirection);

    // Animación del cohete girando hacia el botón presionado
    if (this.centerRocket) {
      const angles = { arriba: 0, derecha: 90, abajo: 180, izquierda: 270 };
      this.centerRocket.style.transition = 'transform 0.3s ease';
      this.centerRocket.style.transform = `rotate(${angles[dir]}deg) scale(1.15)`;
    }

    // Registrar en AppState
    window.appState.recordDirectAttempt(this.activeDirection, isCorrect, responseTimeMs);

    if (isCorrect) {
      this.score += 10;
      this.scoreEl.textContent = this.score;
      window.appState.addStars(1);
      window.soundSystem.playSuccess();
      this.showToast("¡Excelente! ⭐ ¡Bien ubicado!", "correct");
      window.speechGuide.speak("¡Excelente!");
    } else {
      window.soundSystem.playSoftError();
      const nameDir = this.activeDirection.toUpperCase();
      this.showToast(`¡Casi! La correcta era ${nameDir} ✨`, "incorrect");
      window.speechGuide.speak(`Era ${this.activeDirection}. ¡Sigue adelante!`);
    }

    setTimeout(() => {
      this.nextRound();
    }, 1300);
  }

  showToast(msg, type) {
    this.feedbackToast.textContent = msg;
    this.feedbackToast.className = `feedback-toast ${type}`;
    this.feedbackToast.classList.remove('hidden');

    setTimeout(() => {
      this.feedbackToast.classList.add('hidden');
    }, 1200);
  }

  finish() {
    this.progressBar.style.width = '100%';
    window.soundSystem.playVictory();
    window.confettiCannon.fire(50);

    setTimeout(() => {
      window.appCoordinator.onGameFinished('game-direct');
    }, 1200);
  }
}

window.gameDirect = new GameDirect();

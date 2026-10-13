/**
 * AstroEspacio - Juego 4: El Espejo del Robot (Lateralidad Relativa y Perspectiva)
 * Mide: Descentración espacial, rotación mental y comprensión de lateralidad en el otro.
 */

class GamePerspective {
  constructor() {
    this.totalRounds = 6;
    this.currentRound = 0;
    this.score = 0;
    this.targetHand = null; // 'izquierda' o 'derecha' (PERSPECTIVA DEL ROBOT)
    this.isInputBlocked = false;

    // Elementos DOM
    this.roundCounterEl = document.getElementById('perspRoundCounter');
    this.totalRoundsEl = document.getElementById('perspTotalRounds');
    this.progressBar = document.getElementById('perspProgressBar');
    this.scoreEl = document.getElementById('perspScore');
    this.instructionEl = document.getElementById('perspInstructionText');
    this.voiceBtn = document.getElementById('perspVoiceBtn');
    this.robotContainer = document.getElementById('robotSvgContainer');
    this.feedbackToast = document.getElementById('perspFeedback');

    this.choiceLeftBtn = document.getElementById('choiceLeftHand');
    this.choiceRightBtn = document.getElementById('choiceRightHand');

    this.bindEvents();
  }

  bindEvents() {
    this.choiceLeftBtn.addEventListener('click', () => this.handleChoice('izquierda'));
    this.choiceRightBtn.addEventListener('click', () => this.handleChoice('derecha'));

    this.voiceBtn.addEventListener('click', () => {
      this.narrateInstruction();
    });
  }

  start() {
    this.currentRound = 0;
    this.score = 0;
    this.totalRoundsEl.textContent = this.totalRounds;
    this.scoreEl.textContent = this.score;

    const base = ['izquierda', 'derecha', 'izquierda', 'derecha', 'izquierda', 'derecha'];
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
    this.targetHand = this.roundsSequence[this.currentRound - 1];

    this.roundCounterEl.textContent = this.currentRound;
    const progressPct = ((this.currentRound - 1) / this.totalRounds) * 100;
    this.progressBar.style.width = `${progressPct}%`;

    this.renderRobot(this.targetHand);
    this.instructionEl.textContent = "El robot te mira de frente. ¿Qué mano tiene levantada saludando?";
    this.narrateInstruction();
  }

  narrateInstruction() {
    window.speechGuide.speak("El robot te mira de frente como un espejo. ¿Qué mano tiene levantada?");
  }

  /**
   * Genera el SVG del robot con brazo levantado
   * NOTA PSICOPEDAGÓGICA CLAVE:
   * Cuando el robot mira de frente:
   * - Su brazo DERECHO queda en la parte IZQUIERDA de la pantalla del usuario.
   * - Su brazo IZQUIERDO queda en la parte DERECHA de la pantalla del usuario.
   */
  renderRobot(raisedHand) {
    const isRobotRightRaised = (raisedHand === 'derecha');

    // Animación y posición de brazos
    // screen-left arm = robot's RIGHT hand
    // screen-right arm = robot's LEFT hand
    const leftArmSvg = isRobotRightRaised 
      ? `<g class="arm-raised" transform="translate(30, 80) rotate(-40)">
           <rect x="-10" y="-55" width="20" height="55" rx="10" fill="#3B82F6"/>
           <circle cx="0" cy="-60" r="14" fill="#60A5FA"/>
           <!-- Pulsera verde en mano derecha del robot -->
           <rect x="-10" y="-35" width="20" height="8" fill="#10B981" rx="4"/>
         </g>`
      : `<g class="arm-down" transform="translate(35, 95)">
           <rect x="-10" y="0" width="20" height="50" rx="10" fill="#3B82F6"/>
           <circle cx="0" cy="55" r="12" fill="#60A5FA"/>
         </g>`;

    const rightArmSvg = !isRobotRightRaised
      ? `<g class="arm-raised" transform="translate(170, 80) rotate(40)">
           <rect x="-10" y="-55" width="20" height="55" rx="10" fill="#3B82F6"/>
           <circle cx="0" cy="-60" r="14" fill="#60A5FA"/>
           <!-- Pulsera roja en mano izquierda del robot -->
           <rect x="-10" y="-35" width="20" height="8" fill="#EF4444" rx="4"/>
         </g>`
      : `<g class="arm-down" transform="translate(165, 95)">
           <rect x="-10" y="0" width="20" height="50" rx="10" fill="#3B82F6"/>
           <circle cx="0" cy="55" r="12" fill="#60A5FA"/>
         </g>`;

    this.robotContainer.innerHTML = `
      <svg viewBox="0 0 200 220" width="100%" height="100%">
        <!-- Antena -->
        <line x1="100" y1="18" x2="100" y2="40" stroke="#F59E0B" stroke-width="6" stroke-linecap="round"/>
        <circle cx="100" cy="14" r="10" fill="#EF4444"/>

        <!-- Cabeza -->
        <rect x="60" y="38" width="80" height="60" rx="16" fill="#1E293B" stroke="#818CF8" stroke-width="4"/>
        
        <!-- Ojos -->
        <circle cx="82" cy="64" r="10" fill="#38BDF8"/>
        <circle cx="82" cy="64" r="4" fill="#FFFFFF"/>
        <circle cx="118" cy="64" r="10" fill="#38BDF8"/>
        <circle cx="118" cy="64" r="4" fill="#FFFFFF"/>

        <!-- Sonrisa -->
        <path d="M 86 82 Q 100 92 114 82" stroke="#F59E0B" stroke-width="4" fill="none" stroke-linecap="round"/>

        <!-- Orejas / Tornillos -->
        <rect x="50" y="55" width="10" height="18" rx="4" fill="#64748B"/>
        <rect x="140" y="55" width="10" height="18" rx="4" fill="#64748B"/>

        <!-- Cuello -->
        <rect x="90" y="98" width="20" height="12" fill="#475569"/>

        <!-- Cuerpo -->
        <rect x="52" y="106" width="96" height="74" rx="18" fill="#4338CA" stroke="#6366F1" stroke-width="4"/>
        
        <!-- Pantalla de pecho (Corazón del lado izquierdo del robot = pantalla derecha) -->
        <rect x="70" y="120" width="60" height="36" rx="10" fill="#0F172A"/>
        <text x="100" y="144" fill="#10B981" font-size="16" text-anchor="middle" font-weight="bold">❤️ ROBOT</text>

        <!-- Brazos -->
        ${leftArmSvg}
        ${rightArmSvg}

        <!-- Piernas -->
        <rect x="72" y="180" width="18" height="32" rx="8" fill="#1E293B"/>
        <rect x="110" y="180" width="18" height="32" rx="8" fill="#1E293B"/>
      </svg>
    `;
  }

  handleChoice(handChosen) {
    if (this.isInputBlocked) return;
    this.isInputBlocked = true;

    const isCorrect = (handChosen === this.targetHand);
    window.appState.recordPerspectiveAttempt(this.targetHand, isCorrect);

    if (isCorrect) {
      this.score += 15;
      this.scoreEl.textContent = this.score;
      window.appState.addStars(1);
      window.soundSystem.playSuccess();
      const handName = this.targetHand.toUpperCase();
      this.showToast(`¡Correcto! Es la mano ${handName} del Robot 🤖⭐`, "correct");
      window.speechGuide.speak(`¡Excelente! Es la mano ${this.targetHand} del robot.`);
    } else {
      window.soundSystem.playSoftError();
      const handName = this.targetHand.toUpperCase();
      this.showToast(`¡Casi! Desde el lugar del robot, es su mano ${handName} ✨`, "incorrect");
      window.speechGuide.speak(`Recuerda que está frente a ti. Era su mano ${this.targetHand}.`);
    }

    setTimeout(() => {
      this.nextRound();
    }, 1500);
  }

  showToast(msg, type) {
    this.feedbackToast.textContent = msg;
    this.feedbackToast.className = `feedback-toast ${type}`;
    this.feedbackToast.classList.remove('hidden');

    setTimeout(() => {
      this.feedbackToast.classList.add('hidden');
    }, 1400);
  }

  finish() {
    this.progressBar.style.width = '100%';
    window.soundSystem.playVictory();
    window.confettiCannon.fire(60);

    setTimeout(() => {
      window.appCoordinator.onGameFinished('game-perspective');
    }, 1200);
  }
}

window.gamePerspective = new GamePerspective();

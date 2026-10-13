/**
 * AstroEspacio - Escuela Espacial (Tutorial Interactivo y Conceptos)
 */

class TutorialModule {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 4;
    this.container = document.getElementById('tutorialContent');
    this.prevBtn = document.getElementById('tutorialPrevBtn');
    this.nextBtn = document.getElementById('tutorialNextBtn');
    this.repeatVoiceBtn = document.getElementById('tutorialRepeatVoiceBtn');
    this.dots = document.querySelectorAll('.step-dot');

    this.slides = [
      {
        title: "¡Bienvenidos a la Escuela Espacial! 🚀",
        desc: "Para ser un gran astronauta, necesitas conocer las 4 direcciones secretas del universo: Arriba, Abajo, Izquierda y Derecha.",
        voice: "¡Bienvenidos a la Escuela Espacial! Para ser un gran astronauta, necesitas conocer las cuatro direcciones secretas: Arriba, Abajo, Izquierda y Derecha. ¡Vamos a aprenderlas juntos!",
        render: () => `
          <div class="tut-visual-box">
            <div style="font-size: 5rem; animation: floatRocket 2s infinite alternate;">🧑‍🚀✨</div>
            <p style="margin-top: 14px; font-weight: 700; color: #4338CA;">
              ¡Usa tus ojos, tus oídos y tus manos para descubrir hacia dónde viajar!
            </p>
          </div>
        `
      },
      {
        title: "Eje Vertical: ¡Arriba y Abajo! ☁️🌱",
        desc: "ARRIBA es hacia el cielo y las estrellas ⬆️. ABAJO es hacia la tierra y el suelo que pisas ⬇️.",
        voice: "Arriba es hacia el cielo, como cuando saltas hacia el techo. Abajo es hacia el suelo y la tierra donde pisamos. ¡Toca los botones para ver al cohete!",
        render: () => `
          <div class="tut-visual-box">
            <div id="tutRocketScene" style="height: 140px; display: flex; align-items: center; justify-content: center; position: relative;">
              <span id="tutRocketAnim" style="font-size: 3.5rem; transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);">🚀</span>
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 12px;">
              <button class="btn btn-outline" onclick="window.tutorialModule.demoMove('arriba')">
                ⬆️ Subir ARRIBA
              </button>
              <button class="btn btn-outline" onclick="window.tutorialModule.demoMove('abajo')">
                ⬇️ Bajar ABAJO
              </button>
            </div>
          </div>
        `
      },
      {
        title: "Eje Lateral: ¡Izquierda y Derecha! 🔴🟢",
        desc: "Pon tus palmas frente a la pantalla. Tu mano IZQUIERDA tiene la pulsera ROJA (lado del corazón). Tu mano DERECHA tiene la pulsera VERDE.",
        voice: "Pon tus manitos frente a ti. A tu izquierda ponemos una pulsera roja, del lado de tu corazón. A tu derecha ponemos una pulsera verde. ¡Toca cada mano para escucharla!",
        render: () => `
          <div class="tut-visual-box">
            <div class="tut-hands-container">
              <div class="tut-hand hand-left-box" onclick="window.tutorialModule.testHand('izquierda')">
                <span class="tut-hand-icon">✋</span>
                <span class="tut-hand-label">IZQUIERDA</span>
                <span class="tut-hand-hint">🔴 Pulsera Roja</span>
              </div>
              <div class="tut-hand hand-right-box" onclick="window.tutorialModule.testHand('derecha')">
                <span class="tut-hand-icon">🤚</span>
                <span class="tut-hand-label">DERECHA</span>
                <span class="tut-hand-hint">🟢 Pulsera Verde</span>
              </div>
            </div>
            <p id="tutHandFeedback" style="margin-top: 12px; font-weight: 700; color: #4338CA; min-height: 24px;">
              Toca una de las dos manos para practicar.
            </p>
          </div>
        `
      },
      {
        title: "¡Graduación de Cadete Espacial! 🏅",
        desc: "¡Excelente! Ya conoces Arriba, Abajo, Izquierda y Derecha. Ahora demostrarás tus habilidades en los desafíos espaciales.",
        voice: "¡Fantástico! Ya conoces las cuatro direcciones. Ahora estás listo para jugar y poner a prueba tus reflejos, memoria y atención espacial. ¡A despegar!",
        render: () => `
          <div class="tut-visual-box">
            <div style="font-size: 5rem; animation: pulseGem 1.5s infinite;">🏆✨</div>
            <p style="margin-top: 12px; font-weight: 700; font-size: 1.1rem; color: #059669;">
              ¡Has aprendido con éxito las 4 direcciones espaciales!
            </p>
            <p style="font-size: 0.9rem; color: #64748B; margin-top: 6px;">
              Al completar los juegos, recibirás un diploma oficial y un reporte de tus superpoderes mentales.
            </p>
          </div>
        `
      }
    ];

    this.bindEvents();
  }

  bindEvents() {
    this.prevBtn.addEventListener('click', () => {
      if (this.currentStep > 0) {
        this.goToStep(this.currentStep - 1);
      }
    });

    this.nextBtn.addEventListener('click', () => {
      if (this.currentStep < this.totalSteps - 1) {
        this.goToStep(this.currentStep + 1);
      } else {
        // Fin del tutorial -> ir a menú o empezar
        window.soundSystem.playVictory();
        window.confettiCannon.fire(60);
        window.appCoordinator.showScreen('screenMenu');
      }
    });

    this.repeatVoiceBtn.addEventListener('click', () => {
      this.narrateCurrentStep();
    });
  }

  start() {
    this.goToStep(0);
  }

  goToStep(stepIndex) {
    this.currentStep = stepIndex;
    const slide = this.slides[stepIndex];

    this.container.innerHTML = `
      <h2 class="tut-slide-title">${slide.title}</h2>
      <p class="tut-slide-desc">${slide.desc}</p>
      ${slide.render()}
    `;

    // Actualizar botones de navegación
    this.prevBtn.disabled = this.currentStep === 0;
    this.nextBtn.textContent = this.currentStep === this.totalSteps - 1 ? '¡Listo para Jugar! 🚀' : 'Siguiente ➡';

    // Actualizar indicadores (puntos)
    this.dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentStep);
      dot.classList.toggle('completed', idx < this.currentStep);
    });

    this.narrateCurrentStep();
  }

  narrateCurrentStep() {
    const slide = this.slides[this.currentStep];
    if (slide && slide.voice) {
      window.speechGuide.speak(slide.voice);
    }
  }

  demoMove(direction) {
    const el = document.getElementById('tutRocketAnim');
    if (!el) return;
    window.soundSystem.playClick();
    if (direction === 'arriba') {
      el.style.transform = 'translateY(-40px)';
      window.speechGuide.speak("¡El cohete sube hacia ARRIBA!");
    } else {
      el.style.transform = 'translateY(40px)';
      window.speechGuide.speak("¡El cohete baja hacia ABAJO!");
    }
    setTimeout(() => {
      el.style.transform = 'translateY(0)';
    }, 1200);
  }

  testHand(side) {
    const feedback = document.getElementById('tutHandFeedback');
    window.soundSystem.playGem();
    if (side === 'izquierda') {
      if (feedback) feedback.textContent = "¡Muy bien! Esa es la mano IZQUIERDA con pulsera ROJA 🔴";
      window.speechGuide.speak("¡Muy bien! Mano IZQUIERDA con pulsera roja.");
    } else {
      if (feedback) feedback.textContent = "¡Genial! Esa es la mano DERECHA con pulsera VERDE 🟢";
      window.speechGuide.speak("¡Genial! Mano DERECHA con pulsera verde.");
    }
  }
}

window.tutorialModule = new TutorialModule();

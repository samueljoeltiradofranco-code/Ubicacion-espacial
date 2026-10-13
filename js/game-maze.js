/**
 * AstroEspacio - Juego 2: El Laberinto Cósmico
 * Mide y fortalece: Planificación espacial, memoria de trabajo visual y secuenciación lógica.
 */

class GameMaze {
  constructor() {
    this.currentLevelIdx = 0;
    this.totalLevels = 4;
    this.playerPos = { r: 0, c: 0 };
    this.currentGems = 0;
    this.totalGemsInLevel = 0;
    this.movesCount = 0;
    this.levelStartTime = 0;

    // Elementos DOM
    this.currentLevelEl = document.getElementById('mazeCurrentLevel');
    this.totalLevelsEl = document.getElementById('mazeTotalLevels');
    this.progressBar = document.getElementById('mazeProgressBar');
    this.gemsCountEl = document.getElementById('mazeGemsCount');
    this.totalGemsEl = document.getElementById('mazeTotalGems');
    this.gridEl = document.getElementById('mazeGrid');
    this.instructionEl = document.getElementById('mazeInstructionText');
    this.voiceBtn = document.getElementById('mazeVoiceBtn');
    this.feedbackToast = document.getElementById('mazeFeedback');

    // D-Pad botones
    this.dpad = {
      arriba: document.getElementById('dpadUp'),
      abajo: document.getElementById('dpadDown'),
      izquierda: document.getElementById('dpadLeft'),
      derecha: document.getElementById('dpadRight')
    };

    // Diseños de laberintos (W: Muro, .: Suelo, P: Jugador, G: Gema, E: Salida/Nave)
    this.levels = [
      {
        rows: 4,
        cols: 4,
        optimalMoves: 4,
        map: [
          ['P', '.', 'G', '.'],
          ['W', 'W', 'W', '.'],
          ['.', '.', '.', '.'],
          ['.', 'W', 'W', 'E']
        ],
        hint: "Mueve al astronauta a la DERECHA para atrapar la gema, luego baja a la NAVE espacial."
      },
      {
        rows: 5,
        cols: 5,
        optimalMoves: 7,
        map: [
          ['P', '.', 'W', '.', 'E'],
          ['W', '.', 'W', '.', 'G'],
          ['.', '.', '.', 'W', '.'],
          ['.', 'W', 'G', '.', '.'],
          ['.', '.', '.', '.', '.']
        ],
        hint: "Planifica tu camino: recolecta los 2 cristales antes de subir a la nave."
      },
      {
        rows: 5,
        cols: 5,
        optimalMoves: 9,
        map: [
          ['P', 'G', '.', 'W', '.'],
          ['W', 'W', '.', 'W', '.'],
          ['.', 'G', '.', '.', '.'],
          ['.', 'W', 'W', 'W', 'G'],
          ['.', '.', '.', '.', 'E']
        ],
        hint: "¡Cuidado con los asteroides! Usa izquierda y abajo para rodear el camino."
      },
      {
        rows: 6,
        cols: 6,
        optimalMoves: 11,
        map: [
          ['P', '.', 'W', '.', 'G', '.'],
          ['W', '.', 'W', '.', 'W', '.'],
          ['.', 'G', '.', '.', 'W', '.'],
          ['.', 'W', 'W', '.', '.', 'G'],
          ['.', '.', 'G', 'W', 'W', '.'],
          ['W', 'W', '.', '.', '.', 'E']
        ],
        hint: "¡Gran Misión! Recolecta todos los cristales y llega a la meta espacial."
      }
    ];

    this.bindEvents();
  }

  bindEvents() {
    Object.keys(this.dpad).forEach((dir) => {
      const btn = this.dpad[dir];
      if (btn) {
        btn.addEventListener('click', () => this.tryMove(dir));
      }
    });

    // Soporte para flechas de teclado
    window.addEventListener('keydown', (e) => {
      const activeScreen = document.getElementById('screenGameMaze');
      if (!activeScreen || activeScreen.classList.contains('hidden')) return;

      const keyMap = {
        'ArrowUp': 'arriba',
        'ArrowDown': 'abajo',
        'ArrowLeft': 'izquierda',
        'ArrowRight': 'derecha',
        'w': 'arriba',
        's': 'abajo',
        'a': 'izquierda',
        'd': 'derecha'
      };

      if (keyMap[e.key]) {
        e.preventDefault();
        this.tryMove(keyMap[e.key]);
      }
    });

    this.voiceBtn.addEventListener('click', () => {
      this.narrateInstruction();
    });
  }

  start() {
    this.currentLevelIdx = 0;
    this.totalLevelsEl.textContent = this.totalLevels;
    this.loadLevel(0);
  }

  loadLevel(idx) {
    this.currentLevelIdx = idx;
    this.currentLevelEl.textContent = idx + 1;
    this.movesCount = 0;
    this.currentGems = 0;
    this.levelStartTime = Date.now();

    const progressPct = (idx / this.totalLevels) * 100;
    this.progressBar.style.width = `${progressPct}%`;

    const lvlData = this.levels[idx];
    this.currentMap = JSON.parse(JSON.stringify(lvlData.map)); // Copia profunda

    // Contar gemas y ubicar jugador
    this.totalGemsInLevel = 0;
    for (let r = 0; r < lvlData.rows; r++) {
      for (let c = 0; c < lvlData.cols; c++) {
        if (this.currentMap[r][c] === 'P') {
          this.playerPos = { r, c };
        } else if (this.currentMap[r][c] === 'G') {
          this.totalGemsInLevel++;
        }
      }
    }

    this.gemsCountEl.textContent = this.currentGems;
    this.totalGemsEl.textContent = this.totalGemsInLevel;
    this.instructionEl.textContent = lvlData.hint;

    this.renderBoard();
    this.narrateInstruction();
  }

  narrateInstruction() {
    const lvl = this.levels[this.currentLevelIdx];
    window.speechGuide.speak(lvl.hint);
  }

  renderBoard() {
    const lvl = this.levels[this.currentLevelIdx];
    this.gridEl.style.gridTemplateColumns = `repeat(${lvl.cols}, 1fr)`;
    this.gridEl.style.gridTemplateRows = `repeat(${lvl.rows}, 1fr)`;
    this.gridEl.innerHTML = '';

    for (let r = 0; r < lvl.rows; r++) {
      for (let c = 0; c < lvl.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'maze-cell';
        const type = this.currentMap[r][c];

        if (type === 'W') {
          cell.classList.add('cell-wall');
          cell.textContent = '🪨';
        } else {
          cell.classList.add('cell-floor');

          if (r === this.playerPos.r && c === this.playerPos.c) {
            cell.classList.add('cell-player');
            cell.textContent = window.appState.child.avatar || '🧑‍🚀';
          } else if (type === 'G') {
            cell.classList.add('cell-gem');
            cell.textContent = '💎';
          } else if (type === 'E') {
            cell.textContent = '🚀';
          }
        }

        this.gridEl.appendChild(cell);
      }
    }
  }

  tryMove(direction) {
    const offsets = {
      arriba: { r: -1, c: 0 },
      abajo: { r: 1, c: 0 },
      izquierda: { r: 0, c: -1 },
      derecha: { r: 0, c: 1 }
    };

    const delta = offsets[direction];
    const newR = this.playerPos.r + delta.r;
    const newC = this.playerPos.c + delta.c;
    const lvl = this.levels[this.currentLevelIdx];

    // Verificar límites
    if (newR < 0 || newR >= lvl.rows || newC < 0 || newC >= lvl.cols) {
      window.soundSystem.playSoftError();
      return;
    }

    // Verificar pared
    if (this.currentMap[newR][newC] === 'W') {
      window.soundSystem.playSoftError();
      this.showToast("¡Hay un asteroide! Busca otro camino 🪨", "incorrect");
      return;
    }

    // Movimiento válido
    this.movesCount++;
    this.playerPos = { r: newR, c: newC };
    window.soundSystem.playClick();

    // Locución sutil de dirección
    const dirWords = { arriba: "Arriba", abajo: "Abajo", izquierda: "Izquierda", derecha: "Derecha" };

    // Si recoge gema
    if (this.currentMap[newR][newC] === 'G') {
      this.currentGems++;
      this.currentMap[newR][newC] = '.';
      this.gemsCountEl.textContent = this.currentGems;
      window.soundSystem.playGem();
      window.appState.addStars(1);
    }

    this.renderBoard();

    // Si llega a la salida 'E'
    if (this.currentMap[newR][newC] === 'E') {
      this.completeLevel();
    }
  }

  completeLevel() {
    const durationMs = Date.now() - this.levelStartTime;
    const lvl = this.levels[this.currentLevelIdx];

    // Registrar en AppState
    window.appState.recordMazeLevel(
      this.currentLevelIdx + 1,
      this.movesCount,
      lvl.optimalMoves,
      this.currentGems,
      this.totalGemsInLevel,
      durationMs
    );

    window.soundSystem.playSuccess();
    window.confettiCannon.fire(40);
    this.showToast("¡Nivel superado con éxito! 🚀✨", "correct");
    window.speechGuide.speak("¡Misión cumplida! Llegaste a la nave.");

    setTimeout(() => {
      if (this.currentLevelIdx + 1 < this.totalLevels) {
        this.loadLevel(this.currentLevelIdx + 1);
      } else {
        this.finish();
      }
    }, 1500);
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
    window.confettiCannon.fire(60);

    setTimeout(() => {
      window.appCoordinator.onGameFinished('game-maze');
    }, 1200);
  }
}

window.gameMaze = new GameMaze();

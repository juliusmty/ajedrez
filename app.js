/*
 * Lógica principal para el juego de puzzles de ajedrez.
 *
 * Utiliza las librerías chess.js para validar movimientos y detectar
 * mates, y chessboard.js para mostrar el tablero. Este archivo
 * define un conjunto de puzzles de ejemplo, gestiona el flujo entre
 * niveles, implementa el sistema de estrellas en función de las
 * asesorías pedidas y permite avanzar al siguiente puzzle.
 *
 * NOTA: los puzzles definidos aquí son ejemplos y se recomienda
 * reemplazarlos por posiciones reales en formato FEN junto con las
 * soluciones apropiadas. Cada objeto de puzzle puede contener una
 * frase motivadora y el nombre de la pieza correspondiente al nivel
 * alcanzado para enlazar con las trofeos.
 */

// Definición de puzzles: cada puzzle contiene una posición FEN,
// una lista de jugadas de solución (en notación SAN), el lado que
// mueve, el número de movimientos para mate y una frase.
const puzzles = [
  {
    name: 'El Molino',
    fen: 'r1bq2r1/b4pk1/p1pp1p2/1p2pP2/1P2P1PB/3P4/1PPQ2P1/R3K2R w',
    solution: ['Qh6+', 'Kxh6', 'Bxf6#'],
    side: 'w',
    mateIn: 2,
    quote: '“La estrategia es el arte de la batalla.” – Emanuel Lasker'
  },
  {
    name: 'Mate simple',
    // Esta posición sencilla permite un mate rápido para ilustrar la lógica.
    fen: '7k/5Q2/8/8/8/8/8/7K w - - 0 1',
    solution: ['Qf8#'],
    side: 'w',
    mateIn: 1,
    quote: '“Ver una jugada más allá que tu oponente marca la diferencia.”'
  },
  {
    name: 'Dama y rey',
    fen: '6k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 1',
    solution: ['Kd2', 'Kf1', 'Qd8#'],
    side: 'w',
    mateIn: 3,
    quote: '“La paciencia y la visión a largo plazo triunfan.”'
  }
];

let currentPuzzleIndex = 0;
let hintCount = 0;
let starsEarned = 3;
let game;
let board;

// Inicializa el juego cargando el primer puzzle
function init() {
  loadPuzzle(currentPuzzleIndex);
  document.getElementById('hintBtn').addEventListener('click', showHint);
  document.getElementById('nextBtn').addEventListener('click', nextPuzzle);
  updateProgress();
}

// Carga un puzzle por índice
function loadPuzzle(index) {
  const puzzle = puzzles[index];
  hintCount = 0;
  starsEarned = 3;
  game = new Chess(puzzle.fen);
  // Configuración del tablero con arrastre de piezas y callbacks
  if (board) {
    board.destroy();
  }
  board = Chessboard('board', {
    position: puzzle.fen,
    orientation: puzzle.side === 'w' ? 'white' : 'black',
    draggable: true,
    moveSpeed: 'fast',
    onDragStart: function (source, piece, position, orientation) {
      // Bloquear arrastre si el juego ha terminado o no es el turno del lado que mueve
      if (game.game_over()) return false;
      const turn = game.turn();
      if ((turn === 'w' && piece.search(/^b/) !== -1) || (turn === 'b' && piece.search(/^w/) !== -1)) {
        return false;
      }
    },
    onDrop: function (source, target) {
      const move = game.move({ from: source, to: target, promotion: 'q' });
      if (move === null) {
        return 'snapback';
      }
      updateStatus();
    },
    onSnapEnd: function () {
      board.position(game.fen());
    }
  });
  document.getElementById('info').textContent = `Nivel ${index + 1}: ${puzzle.name} – ${puzzle.mateIn === 1 ? 'Mate en 1' : 'Mate en ' + puzzle.mateIn}`;
  document.getElementById('stars').textContent = '★★★';
  document.getElementById('nextBtn').style.display = 'none';
}

// Muestra una pista revelando la siguiente jugada de la solución
function showHint() {
  const puzzle = puzzles[currentPuzzleIndex];
  if (hintCount >= puzzle.solution.length) return;
  const hintMove = puzzle.solution[hintCount];
  alert(`Asesoría: intenta jugar ${hintMove}`);
  hintCount++;
  // Reducir estrellas según número de asesorías
  starsEarned = Math.max(1, 3 - hintCount);
  document.getElementById('stars').textContent = '★'.repeat(starsEarned) + '☆'.repeat(3 - starsEarned);
}

// Comprueba el estado del juego después de cada movimiento y determina si se ha resuelto el puzzle
function updateStatus() {
  if (game.in_checkmate()) {
    // Puzzle resuelto
    const puzzle = puzzles[currentPuzzleIndex];
    alert(`¡Excelente! Has resuelto el puzzle "${puzzle.name}".\n${puzzle.quote}`);
    // Registrar estrellas (aquí podríamos guardar en localStorage o backend)
    document.getElementById('nextBtn').style.display = 'inline-block';
  } else {
    const puzzle = puzzles[currentPuzzleIndex];
    // Si se han excedido las jugadas permitidas sin lograr mate, reiniciamos
    const maxPlies = puzzle.mateIn * 2;
    if (game.history().length > maxPlies) {
      alert('Has realizado demasiados movimientos sin lograr mate. Reiniciando el puzzle.');
      loadPuzzle(currentPuzzleIndex);
    }
  }
}

// Calcula el número máximo de jugadas permitidas para mate (en medios movimientos)
function puzzleMatePlies() {
  const puzzle = puzzles[currentPuzzleIndex];
  return puzzle.mateIn * 2;
}

// Avanza al siguiente puzzle o finaliza
function nextPuzzle() {
  currentPuzzleIndex++;
  if (currentPuzzleIndex >= puzzles.length) {
    alert('¡Felicidades! Has completado todos los puzzles disponibles en esta demo.');
    // Reiniciar
    currentPuzzleIndex = 0;
  }
  updateProgress();
  loadPuzzle(currentPuzzleIndex);
}

// Actualiza la barra de progreso
function updateProgress() {
  const total = puzzles.length;
  const progressText = `Puzzle ${currentPuzzleIndex + 1} de ${total}`;
  document.getElementById('progress').textContent = progressText;
}

// Ejecutar la inicialización una vez que el DOM esté listo
document.addEventListener('DOMContentLoaded', init);
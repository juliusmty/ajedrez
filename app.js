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
    // FEN completo (incluye campos de castling, en passant, etc.)
    fen: 'r1bq2r1/b4pk1/p1pp1p2/1p2pP2/1P2P1PB/3P4/1PPQ2P1/R3K2R w - - 0 1',
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
// Mantenemos el cuadrado seleccionado y las jugadas legales actuales
let selectedSquare = null;
let legalMoves = [];

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
  selectedSquare = null;
  legalMoves = [];
  renderBoard();
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
  renderBoard();
  if (game.in_checkmate()) {
    // Puzzle resuelto
    const puzzle = puzzles[currentPuzzleIndex];
    alert(`¡Excelente! Has resuelto el puzzle "${puzzle.name}".\n${puzzle.quote}`);
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

/*
 * Representación y gestión del tablero manualmente usando un grid de divs.
 * Cada casilla tiene un atributo data-square con su notación algebraica (e.g., "e4").
 * Se utiliza Unicode para dibujar las piezas y CSS para el tablero.
 */

// Mapa de piezas en notación FEN a caracteres Unicode
const unicodeMap = {
  p: '\u265F', // peón negro
  r: '\u265C', // torre negra
  n: '\u265E', // caballo negro
  b: '\u265D', // alfil negro
  q: '\u265B', // reina negra
  k: '\u265A', // rey negro
  P: '\u2659', // peón blanco
  R: '\u2656', // torre blanca
  N: '\u2658', // caballo blanco
  B: '\u2657', // alfil blanco
  Q: '\u2655', // reina blanca
  K: '\u2654'  // rey blanco
};

// Genera el tablero en el DOM según el estado actual de game
function renderBoard() {
  const boardContainer = document.getElementById('chessBoard');
  boardContainer.innerHTML = '';
  // game.board() devuelve una matriz 8x8 comenzando desde la octava fila
  const position = game.board();
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.classList.add('square');
      // Determinar color de la casilla
      if ((row + col) % 2 === 0) {
        square.classList.add('light');
      } else {
        square.classList.add('dark');
      }
      // Coordenadas algebraicas: columnas a-h, filas 8-1
      const file = String.fromCharCode('a'.charCodeAt(0) + col);
      const rank = 8 - row;
      const coord = file + rank;
      square.dataset.square = coord;
      // Mostrar la pieza si la hay
      const piece = position[row][col];
      if (piece) {
        // piece.color es 'w' o 'b' y piece.type es la letra en minúscula
        const key = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
        const char = unicodeMap[key];
        square.textContent = char;
      }
      // Añadir clase highlight si el cuadrado está en las jugadas legales o seleccionado
      if (coord === selectedSquare) {
        square.classList.add('highlight');
      } else if (legalMoves.includes(coord)) {
        square.classList.add('highlight');
      }
      square.addEventListener('click', handleSquareClick);
      boardContainer.appendChild(square);
    }
  }
}

// Maneja clics en las casillas para seleccionar piezas y realizar jugadas
function handleSquareClick(event) {
  const clickedSquare = event.currentTarget.dataset.square;
  // Si hay una selección previa y el usuario hace clic en una jugada legal
  if (selectedSquare && legalMoves.includes(clickedSquare)) {
    // Realizar la jugada
    const move = game.move({ from: selectedSquare, to: clickedSquare, promotion: 'q' });
    if (move) {
      selectedSquare = null;
      legalMoves = [];
      updateStatus();
    }
    return;
  }
  // Si se hace clic sobre la misma casilla seleccionada, se deselecciona
  if (selectedSquare === clickedSquare) {
    selectedSquare = null;
    legalMoves = [];
    renderBoard();
    return;
  }
  // Obtener información de la pieza en la casilla clicada
  const piece = game.get(clickedSquare);
  if (piece && piece.color === game.turn()) {
    // Seleccionar esta pieza y calcular sus jugadas legales
    selectedSquare = clickedSquare;
    const moves = game.moves({ square: selectedSquare, verbose: true });
    legalMoves = moves.map(m => m.to);
  } else {
    // No hay pieza o no es del turno, deseleccionar
    selectedSquare = null;
    legalMoves = [];
  }
  renderBoard();
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
// Puzzle configuration
const GRID_COLS = 6;
const GRID_ROWS = 5;
const TOTAL_PIECES = GRID_COLS * GRID_ROWS; // 30 pieces
const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 600;

// Puzzle images - Add your own images in the 'images' folder
const puzzleImages = [
    '../images/puzzle1.jpg',
    '../images/puzzle2.jpg',
    '../images/puzzle3.jpg',
    '../images/puzzle4.jpg',
    '../images/puzzle5.jpg'
];

// Game state
let currentPuzzleIndex = 0;
let currentImage = null;
let pieces = [];
let placedPieces = [];
let selectedPiece = null;
let showHint = false;
let startTime = null;
let timerInterval = null;

// DOM elements
const canvas = document.getElementById('puzzleCanvas');
const ctx = canvas.getContext('2d');
const piecesContainer = document.getElementById('piecesContainer');
const puzzleSelect = document.getElementById('puzzleSelect');
const newGameBtn = document.getElementById('newGame');
const showHintBtn = document.getElementById('showHint');
const piecesPlacedSpan = document.getElementById('piecesPlaced');
const timerSpan = document.getElementById('timer');
const winModal = document.getElementById('winModal');
const finalTimeSpan = document.getElementById('finalTime');
const playAgainBtn = document.getElementById('playAgain');

// Initialize canvas
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// Piece dimensions
const pieceWidth = CANVAS_WIDTH / GRID_COLS;
const pieceHeight = CANVAS_HEIGHT / GRID_ROWS;

// Initialize game
function init() {
    currentPuzzleIndex = parseInt(puzzleSelect.value);
    loadPuzzle();
}

// Load puzzle image
function loadPuzzle() {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        currentImage = img;
        startNewGame();
    };
    img.src = puzzleImages[currentPuzzleIndex];
}

// Start new game
function startNewGame() {
    pieces = [];
    placedPieces = Array(TOTAL_PIECES).fill(false);
    selectedPiece = null;
    showHint = false;
    startTime = Date.now();
    
    // Clear timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    // Create pieces
    createPieces();
    
    // Draw canvas
    drawCanvas();
    
    // Update stats
    updateStats();
    
    // Hide modal
    winModal.classList.remove('show');
}

// Create puzzle pieces
function createPieces() {
    piecesContainer.innerHTML = '';
    const pieceIndices = [];
    
    // Create array of piece indices
    for (let i = 0; i < TOTAL_PIECES; i++) {
        pieceIndices.push(i);
    }
    
    // Shuffle pieces
    shuffleArray(pieceIndices);
    
    // Create piece elements
    pieceIndices.forEach(index => {
        const row = Math.floor(index / GRID_COLS);
        const col = index % GRID_COLS;
        
        const pieceCanvas = document.createElement('canvas');
        pieceCanvas.width = pieceWidth;
        pieceCanvas.height = pieceHeight;
        pieceCanvas.className = 'puzzle-piece';
        pieceCanvas.dataset.index = index;
        
        const pieceCtx = pieceCanvas.getContext('2d');
        pieceCtx.drawImage(
            currentImage,
            col * pieceWidth, row * pieceHeight,
            pieceWidth, pieceHeight,
            0, 0,
            pieceWidth, pieceHeight
        );
        
        // Add drag events
        pieceCanvas.draggable = true;
        pieceCanvas.addEventListener('dragstart', handleDragStart);
        pieceCanvas.addEventListener('dragend', handleDragEnd);
        
        piecesContainer.appendChild(pieceCanvas);
        pieces.push({ index, element: pieceCanvas });
    });
}

// Shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Draw canvas
function drawCanvas() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw blurred background
    if (showHint) {
        ctx.filter = 'blur(3px) brightness(0.7)';
    } else {
        ctx.filter = 'blur(8px) brightness(0.5)';
    }
    ctx.drawImage(currentImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.filter = 'none';
    
    // Draw placed pieces
    for (let i = 0; i < TOTAL_PIECES; i++) {
        if (placedPieces[i]) {
            const row = Math.floor(i / GRID_COLS);
            const col = i % GRID_COLS;
            
            ctx.drawImage(
                currentImage,
                col * pieceWidth, row * pieceHeight,
                pieceWidth, pieceHeight,
                col * pieceWidth, row * pieceHeight,
                pieceWidth, pieceHeight
            );
            
            // Draw border
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 2;
            ctx.strokeRect(
                col * pieceWidth,
                row * pieceHeight,
                pieceWidth,
                pieceHeight
            );
        }
    }
    
    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * pieceWidth, 0);
        ctx.lineTo(i * pieceWidth, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i <= GRID_ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * pieceHeight);
        ctx.lineTo(CANVAS_WIDTH, i * pieceHeight);
        ctx.stroke();
    }
}

// Drag handlers
function handleDragStart(e) {
    selectedPiece = parseInt(e.target.dataset.index);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// Canvas drop handler
canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    
    if (selectedPiece === null) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const col = Math.floor(x / pieceWidth);
    const row = Math.floor(y / pieceHeight);
    const targetIndex = row * GRID_COLS + col;
    
    // Check if piece matches the position
    if (selectedPiece === targetIndex && !placedPieces[targetIndex]) {
        placedPieces[targetIndex] = true;
        
        // Mark piece as placed
        const pieceElement = pieces.find(p => p.index === selectedPiece).element;
        pieceElement.classList.add('placed');
        
        // Show glitter animation
        showGlitterEffect(col * pieceWidth, row * pieceHeight);
        
        drawCanvas();
        updateStats();
        
        // Check win condition
        if (placedPieces.every(p => p)) {
            setTimeout(showWinModal, 500);
        }
    }
    
    selectedPiece = null;
});

// Glitter effect
function showGlitterEffect(x, y) {
    const glitterCount = 12;
    
    for (let i = 0; i < glitterCount; i++) {
        const glitter = document.createElement('div');
        glitter.className = 'glitter';
        glitter.style.left = `${x + pieceWidth / 2}px`;
        glitter.style.top = `${y + pieceHeight / 2}px`;
        
        const angle = (Math.PI * 2 * i) / glitterCount;
        const distance = 30 + Math.random() * 20;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        glitter.style.setProperty('--tx', `${tx}px`);
        glitter.style.setProperty('--ty', `${ty}px`);
        
        canvas.parentElement.appendChild(glitter);
        
        setTimeout(() => glitter.remove(), 600);
    }
}

// Update stats
function updateStats() {
    const placed = placedPieces.filter(p => p).length;
    piecesPlacedSpan.textContent = placed;
}

// Update timer
function updateTimer() {
    if (!startTime) return;
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerSpan.textContent = `${minutes}:${seconds}`;
}

// Show win modal
function showWinModal() {
    if (timerInterval) clearInterval(timerInterval);
    finalTimeSpan.textContent = timerSpan.textContent;
    winModal.classList.add('show');
}

// Event listeners
puzzleSelect.addEventListener('change', init);
newGameBtn.addEventListener('click', startNewGame);
showHintBtn.addEventListener('click', () => {
    showHint = !showHint;
    drawCanvas();
});
playAgainBtn.addEventListener('click', startNewGame);

// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .catch(err => console.log('Service worker registration failed:', err));
}

// Start game
init();

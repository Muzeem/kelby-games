// Optimized Jigsaw Puzzle Game for MSN Games
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        GRID_COLS: 6,
        GRID_ROWS: 5,
        CANVAS_WIDTH: 700,
        CANVAS_HEIGHT: 600,
        IMAGES: [
            '/images/puzzle1.jpg',
            '/images/puzzle2.jpg',
            '/images/puzzle3.jpg',
            '/images/puzzle4.jpg',
            '/images/puzzle5.jpg'
        ]
    };
    
    const TOTAL_PIECES = CONFIG.GRID_COLS * CONFIG.GRID_ROWS;
    const PIECE_WIDTH = CONFIG.CANVAS_WIDTH / CONFIG.GRID_COLS;
    const PIECE_HEIGHT = CONFIG.CANVAS_HEIGHT / CONFIG.GRID_ROWS;
    
    // Game state
    const state = {
        currentPuzzleIndex: 0,
        currentImage: null,
        pieces: [],
        placedPieces: new Array(TOTAL_PIECES).fill(false),
        selectedPiece: null,
        showHint: false,
        startTime: null,
        timerInterval: null,
        animationFrame: null
    };
    
    // DOM elements (cached)
    const elements = {
        canvas: document.getElementById('puzzleCanvas'),
        ctx: null,
        piecesContainer: document.getElementById('piecesContainer'),
        puzzleSelect: document.getElementById('puzzleSelect'),
        newGameBtn: document.getElementById('newGame'),
        showHintBtn: document.getElementById('showHint'),
        piecesPlacedSpan: document.getElementById('piecesPlaced'),
        timerSpan: document.getElementById('timer'),
        winModal: document.getElementById('winModal'),
        finalTimeSpan: document.getElementById('finalTime'),
        playAgainBtn: document.getElementById('playAgain')
    };
    
    // Initialize canvas
    elements.canvas.width = CONFIG.CANVAS_WIDTH;
    elements.canvas.height = CONFIG.CANVAS_HEIGHT;
    elements.ctx = elements.canvas.getContext('2d', { alpha: false });
    
    // Analytics
    function trackEvent(eventName, data = {}) {
        if (window.GameAnalytics) {
            window.GameAnalytics.track(eventName, { game: 'jigsaw', ...data });
        }
    }
    
    // Utility: Shuffle array (Fisher-Yates)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // Load puzzle image with error handling
    function loadPuzzle() {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            state.currentImage = img;
            startNewGame();
            trackEvent('puzzle_loaded', { puzzleIndex: state.currentPuzzleIndex });
        };
        
        img.onerror = function() {
            console.error('Failed to load puzzle image');
            alert('Failed to load puzzle image. Please try another puzzle.');
        };
        
        img.src = CONFIG.IMAGES[state.currentPuzzleIndex];
    }
    
    // Start new game
    function startNewGame() {
        // Reset state
        state.pieces = [];
        state.placedPieces.fill(false);
        state.selectedPiece = null;
        state.showHint = false;
        state.startTime = Date.now();
        
        // Clear timers
        if (state.timerInterval) clearInterval(state.timerInterval);
        if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
        
        state.timerInterval = setInterval(updateTimer, 1000);
        
        // Create pieces
        createPieces();
        
        // Draw canvas
        drawCanvas();
        
        // Update stats
        updateStats();
        
        // Hide modal
        elements.winModal.style.display = 'none';
        elements.winModal.classList.remove('show');
        
        trackEvent('game_started', { puzzleIndex: state.currentPuzzleIndex });
    }
    
    // Create puzzle pieces (optimized)
    function createPieces() {
        // Clear container efficiently
        elements.piecesContainer.innerHTML = '';
        
        // Create shuffled indices
        const indices = Array.from({ length: TOTAL_PIECES }, (_, i) => i);
        shuffleArray(indices);
        
        // Create document fragment for batch DOM insertion
        const fragment = document.createDocumentFragment();
        
        indices.forEach(index => {
            const row = Math.floor(index / CONFIG.GRID_COLS);
            const col = index % CONFIG.GRID_COLS;
            
            const pieceCanvas = document.createElement('canvas');
            pieceCanvas.width = PIECE_WIDTH;
            pieceCanvas.height = PIECE_HEIGHT;
            pieceCanvas.className = 'puzzle-piece';
            pieceCanvas.dataset.index = index;
            pieceCanvas.setAttribute('role', 'listitem');
            pieceCanvas.setAttribute('aria-label', `Puzzle piece ${index + 1}`);
            pieceCanvas.tabIndex = 0;
            
            const pieceCtx = pieceCanvas.getContext('2d', { alpha: false });
            pieceCtx.drawImage(
                state.currentImage,
                col * PIECE_WIDTH, row * PIECE_HEIGHT,
                PIECE_WIDTH, PIECE_HEIGHT,
                0, 0,
                PIECE_WIDTH, PIECE_HEIGHT
            );
            
            // Add drag events
            pieceCanvas.draggable = true;
            pieceCanvas.addEventListener('dragstart', handleDragStart, { passive: true });
            pieceCanvas.addEventListener('dragend', handleDragEnd, { passive: true });
            
            // Keyboard support
            pieceCanvas.addEventListener('keydown', handleKeyDown);
            
            fragment.appendChild(pieceCanvas);
            state.pieces.push({ index, element: pieceCanvas });
        });
        
        elements.piecesContainer.appendChild(fragment);
    }
    
    // Draw canvas (optimized with requestAnimationFrame)
    function drawCanvas() {
        const ctx = elements.ctx;
        
        // Clear canvas
        ctx.clearRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Draw background with hint
        ctx.save();
        if (state.showHint) {
            ctx.filter = 'blur(3px) brightness(0.7)';
        } else {
            ctx.filter = 'blur(8px) brightness(0.5)';
        }
        ctx.drawImage(state.currentImage, 0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        ctx.restore();
        
        // Draw placed pieces
        for (let i = 0; i < TOTAL_PIECES; i++) {
            if (state.placedPieces[i]) {
                const row = Math.floor(i / CONFIG.GRID_COLS);
                const col = i % CONFIG.GRID_COLS;
                
                ctx.drawImage(
                    state.currentImage,
                    col * PIECE_WIDTH, row * PIECE_HEIGHT,
                    PIECE_WIDTH, PIECE_HEIGHT,
                    col * PIECE_WIDTH, row * PIECE_HEIGHT,
                    PIECE_WIDTH, PIECE_HEIGHT
                );
                
                // Draw border
                ctx.strokeStyle = '#4CAF50';
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    col * PIECE_WIDTH,
                    row * PIECE_HEIGHT,
                    PIECE_WIDTH,
                    PIECE_HEIGHT
                );
            }
        }
        
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= CONFIG.GRID_COLS; i++) {
            ctx.beginPath();
            ctx.moveTo(i * PIECE_WIDTH, 0);
            ctx.lineTo(i * PIECE_WIDTH, CONFIG.CANVAS_HEIGHT);
            ctx.stroke();
        }
        
        for (let i = 0; i <= CONFIG.GRID_ROWS; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * PIECE_HEIGHT);
            ctx.lineTo(CONFIG.CANVAS_WIDTH, i * PIECE_HEIGHT);
            ctx.stroke();
        }
    }
    
    // Drag handlers
    function handleDragStart(e) {
        state.selectedPiece = parseInt(e.target.dataset.index);
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        trackEvent('piece_picked', { pieceIndex: state.selectedPiece });
    }
    
    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }
    
    // Keyboard support for accessibility
    function handleKeyDown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const index = parseInt(e.target.dataset.index);
            // Simulate drag to center of board
            placePieceAtIndex(index, index);
        }
    }
    
    // Place piece at index
    function placePieceAtIndex(pieceIndex, targetIndex) {
        if (pieceIndex === targetIndex && !state.placedPieces[targetIndex]) {
            state.placedPieces[targetIndex] = true;
            
            const pieceElement = state.pieces.find(p => p.index === pieceIndex).element;
            pieceElement.classList.add('placed');
            pieceElement.setAttribute('aria-label', `Puzzle piece ${pieceIndex + 1} - placed`);
            
            const col = targetIndex % CONFIG.GRID_COLS;
            const row = Math.floor(targetIndex / CONFIG.GRID_COLS);
            showGlitterEffect(col * PIECE_WIDTH, row * PIECE_HEIGHT);
            
            drawCanvas();
            updateStats();
            
            trackEvent('piece_placed', { pieceIndex, correct: true });
            
            // Check win condition
            if (state.placedPieces.every(p => p)) {
                setTimeout(showWinModal, 500);
            }
        } else {
            trackEvent('piece_placed', { pieceIndex, correct: false });
        }
    }
    
    // Canvas drop handler
    elements.canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });
    
    elements.canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        
        if (state.selectedPiece === null) return;
        
        const rect = elements.canvas.getBoundingClientRect();
        const scaleX = elements.canvas.width / rect.width;
        const scaleY = elements.canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        
        const col = Math.floor(x / PIECE_WIDTH);
        const row = Math.floor(y / PIECE_HEIGHT);
        const targetIndex = row * CONFIG.GRID_COLS + col;
        
        placePieceAtIndex(state.selectedPiece, targetIndex);
        state.selectedPiece = null;
    });
    
    // Glitter effect (optimized)
    function showGlitterEffect(x, y) {
        const glitterCount = 12;
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < glitterCount; i++) {
            const glitter = document.createElement('div');
            glitter.className = 'glitter';
            glitter.style.cssText = `
                left: ${x + PIECE_WIDTH / 2}px;
                top: ${y + PIECE_HEIGHT / 2}px;
            `;
            
            const angle = (Math.PI * 2 * i) / glitterCount;
            const distance = 30 + Math.random() * 20;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            glitter.style.setProperty('--tx', `${tx}px`);
            glitter.style.setProperty('--ty', `${ty}px`);
            
            fragment.appendChild(glitter);
            
            setTimeout(() => glitter.remove(), 600);
        }
        
        elements.canvas.parentElement.appendChild(fragment);
    }
    
    // Update stats
    function updateStats() {
        const placed = state.placedPieces.filter(p => p).length;
        elements.piecesPlacedSpan.textContent = placed;
    }
    
    // Update timer
    function updateTimer() {
        if (!state.startTime) return;
        
        const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        elements.timerSpan.textContent = `${minutes}:${seconds}`;
    }
    
    // Show win modal
    function showWinModal() {
        if (state.timerInterval) clearInterval(state.timerInterval);
        
        const finalTime = elements.timerSpan.textContent;
        elements.finalTimeSpan.textContent = finalTime;
        elements.winModal.style.display = 'flex';
        elements.winModal.classList.add('show');
        
        trackEvent('game_completed', {
            puzzleIndex: state.currentPuzzleIndex,
            time: finalTime
        });
        
        // Focus on play again button
        elements.playAgainBtn.focus();
    }
    
    // Event listeners
    elements.puzzleSelect.addEventListener('change', () => {
        state.currentPuzzleIndex = parseInt(elements.puzzleSelect.value);
        loadPuzzle();
    });
    
    elements.newGameBtn.addEventListener('click', startNewGame);
    
    elements.showHintBtn.addEventListener('click', () => {
        state.showHint = !state.showHint;
        drawCanvas();
        trackEvent('hint_toggled', { showHint: state.showHint });
    });
    
    elements.playAgainBtn.addEventListener('click', startNewGame);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (state.timerInterval) clearInterval(state.timerInterval);
        if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
    });
    
    // Initialize game
    function init() {
        state.currentPuzzleIndex = parseInt(elements.puzzleSelect.value);
        loadPuzzle();
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();

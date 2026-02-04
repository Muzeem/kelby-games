'use strict';

// Configuration Constants
const CONFIG = {
    TAB_SIZE: 0.2,
    MAX_BOARD_HEIGHT: 500,
    MAX_BOARD_WIDTH: 700,
    DROP_TOLERANCE: 0.4,
    DROP_TOLERANCE_MOBILE: 0.5
};

// Game State
let currentPuzzle = null;
let currentDifficulty = 24;
let pieces = [];
let placedCount = 0;
let boardWidth = 0;
let boardHeight = 0;
let pieceWidth = 0;
let pieceHeight = 0;
let cols = 0;
let rows = 0;
let loadedImage = null;

// DOM Elements
const screens = {
    intro: document.getElementById('intro-screen'),
    selection: document.getElementById('selection-screen'),
    difficulty: document.getElementById('difficulty-screen'),
    puzzle: document.getElementById('puzzle-screen'),
    completion: document.getElementById('completion-screen')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initIntro();
    renderPuzzleGrid();
    setupEventListeners();
    setupKeyboardNavigation();
});

// Intro Screen
let introStep = 0;
let introTimers = [];

function initIntro() {
    const texts = document.querySelectorAll('.intro-text');
    const beginBtn = document.getElementById('begin-btn');
    const introScreen = document.getElementById('intro-screen');
    
    const delays = [0, 4000, 7000, 11000];
    
    texts.forEach((text, index) => {
        const timer = setTimeout(() => {
            text.classList.add('visible');
            introStep = index + 1;
        }, delays[index]);
        introTimers.push(timer);
    });

    const btnTimer = setTimeout(() => {
        beginBtn.classList.add('visible');
        introStep = 4;
    }, delays[3]);
    introTimers.push(btnTimer);
    
    introScreen.addEventListener('click', (e) => {
        if (e.target === beginBtn) return;
        advanceIntro();
    });
}

function advanceIntro() {
    const texts = document.querySelectorAll('.intro-text');
    const beginBtn = document.getElementById('begin-btn');
    
    introTimers.forEach(t => clearTimeout(t));
    introTimers = [];
    
    if (introStep < 3) {
        for (let i = 0; i <= introStep; i++) {
            texts[i].classList.add('visible');
        }
        introStep++;
        if (introStep >= 3) {
            beginBtn.classList.add('visible');
        }
    } else {
        texts.forEach(t => t.classList.add('visible'));
        beginBtn.classList.add('visible');
    }
}

document.getElementById('begin-btn')?.addEventListener('click', () => {
    playBackgroundMusic();
    switchScreen('selection');
});

function playBackgroundMusic() {
    const music = document.getElementById('background-music');
    if (music) {
        music.volume = 0.25;
        music.play().catch(() => {});
    }
}

function switchScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
        screen.setAttribute('aria-hidden', 'true');
    });
    setTimeout(() => {
        screens[screenName].classList.add('active');
        screens[screenName].setAttribute('aria-hidden', 'false');
        screens[screenName].focus();
    }, 50);
}

function renderPuzzleGrid() {
    const grid = document.getElementById('puzzle-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    PUZZLES.forEach((puzzle, index) => {
        const card = document.createElement('div');
        card.className = 'puzzle-card';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Select puzzle: ${puzzle.hint}`);
        card.innerHTML = `
            <div class="puzzle-preview" style="background-image: url('${puzzle.image}')" aria-hidden="true"></div>
            <h3>${puzzle.hint}</h3>
        `;
        card.addEventListener('click', () => selectPuzzle(puzzle));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectPuzzle(puzzle);
            }
        });
        grid.appendChild(card);
    });
}

function selectPuzzle(puzzle) {
    currentPuzzle = puzzle;
    switchScreen('difficulty');
}

document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentDifficulty = parseInt(btn.dataset.pieces, 10);
        startPuzzle();
    });
});

function startPuzzle() {
    if (!currentPuzzle) return;
    
    const hintEl = document.getElementById('puzzle-hint');
    if (hintEl) hintEl.textContent = currentPuzzle.hint;
    
    switchScreen('puzzle');
    setTimeout(() => loadAndGeneratePuzzle(), 100);
}

function loadAndGeneratePuzzle() {
    const img = new Image();
    img.src = currentPuzzle.image;
    
    img.onload = () => {
        loadedImage = img;
        setupBoard(img);
        generatePieces();
    };
    
    img.onerror = () => {
        if (confirm('Failed to load image. Return to puzzle selection?')) {
            switchScreen('selection');
        }
    };
}

function setupBoard(img) {
    const board = document.getElementById('puzzle-board');
    const area = document.querySelector('.puzzle-area');
    
    const areaRect = area.getBoundingClientRect();
    const maxWidth = areaRect.width - 60;
    const maxHeight = areaRect.height - 60;
    
    const imgRatio = img.width / img.height;
    
    if (maxWidth / maxHeight > imgRatio) {
        boardHeight = Math.min(maxHeight, CONFIG.MAX_BOARD_HEIGHT);
        boardWidth = boardHeight * imgRatio;
    } else {
        boardWidth = Math.min(maxWidth, CONFIG.MAX_BOARD_WIDTH);
        boardHeight = boardWidth / imgRatio;
    }
    
    board.style.width = boardWidth + 'px';
    board.style.height = boardHeight + 'px';
    
    const ratio = boardWidth / boardHeight;
    cols = Math.round(Math.sqrt(currentDifficulty * ratio));
    rows = Math.round(currentDifficulty / cols);
    
    while (cols * rows < currentDifficulty) cols++;
    while (cols * rows > currentDifficulty && cols > 1) {
        if (cols * (rows - 1) >= currentDifficulty) rows--;
        else break;
    }
    
    pieceWidth = boardWidth / cols;
    pieceHeight = boardHeight / rows;
    
    drawBoardGrid();
}

function seededRandom(seed) {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
}

function calculateEdge(row, col, direction, seed) {
    if (direction === 'top' && row === 0) return 0;
    if (direction === 'bottom' && row === rows - 1) return 0;
    if (direction === 'left' && col === 0) return 0;
    if (direction === 'right' && col === cols - 1) return 0;
    
    if (direction === 'top') {
        const abovePiece = pieces.find(p => p.row === row - 1 && p.col === col);
        if (abovePiece && abovePiece.edges) {
            return -abovePiece.edges.bottom;
        }
    }
    if (direction === 'left') {
        const leftPiece = pieces.find(p => p.row === row && p.col === col - 1);
        if (leftPiece && leftPiece.edges) {
            return -leftPiece.edges.right;
        }
    }
    
    return seededRandom(seed) > 0.5 ? 1 : -1;
}

function drawBoardGrid() {
    const canvas = document.getElementById('board-grid');
    canvas.width = boardWidth;
    canvas.height = boardHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.3)';
    ctx.lineWidth = 1;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * pieceWidth;
            const y = row * pieceHeight;
            const seed = row * 1000 + col;
            const edges = {
                top: calculateEdge(row, col, 'top', seed + 1),
                right: calculateEdge(row, col, 'right', seed + 2),
                bottom: calculateEdge(row, col, 'bottom', seed + 3),
                left: calculateEdge(row, col, 'left', seed + 4)
            };
            drawJigsawOutline(ctx, x, y, pieceWidth, pieceHeight, edges);
        }
    }
}

function drawJigsawOutline(ctx, x, y, w, h, edges) {
    ctx.beginPath();
    const tabW = w * CONFIG.TAB_SIZE;
    const tabH = h * CONFIG.TAB_SIZE;
    
    ctx.moveTo(x, y);
    if (edges.top === 0) {
        ctx.lineTo(x + w, y);
    } else {
        ctx.lineTo(x + w * 0.35, y);
        ctx.bezierCurveTo(x + w * 0.35, y + edges.top * tabH, x + w * 0.65, y + edges.top * tabH, x + w * 0.65, y);
        ctx.lineTo(x + w, y);
    }
    
    if (edges.right === 0) {
        ctx.lineTo(x + w, y + h);
    } else {
        ctx.lineTo(x + w, y + h * 0.35);
        ctx.bezierCurveTo(x + w + edges.right * tabW, y + h * 0.35, x + w + edges.right * tabW, y + h * 0.65, x + w, y + h * 0.65);
        ctx.lineTo(x + w, y + h);
    }
    
    if (edges.bottom === 0) {
        ctx.lineTo(x, y + h);
    } else {
        ctx.lineTo(x + w * 0.65, y + h);
        ctx.bezierCurveTo(x + w * 0.65, y + h + edges.bottom * tabH, x + w * 0.35, y + h + edges.bottom * tabH, x + w * 0.35, y + h);
        ctx.lineTo(x, y + h);
    }
    
    if (edges.left === 0) {
        ctx.lineTo(x, y);
    } else {
        ctx.lineTo(x, y + h * 0.65);
        ctx.bezierCurveTo(x + edges.left * tabW, y + h * 0.65, x + edges.left * tabW, y + h * 0.35, x, y + h * 0.35);
        ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function generatePieces() {
    const container = document.getElementById('pieces-container');
    const tray = document.getElementById('tray-content');
    
    container.innerHTML = '';
    tray.innerHTML = '';
    pieces = [];
    placedCount = 0;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const seed = row * 1000 + col;
            const piece = {
                id: `piece-${row}-${col}`,
                row,
                col,
                correctX: col * pieceWidth,
                correctY: row * pieceHeight,
                placed: false,
                edges: {
                    top: calculateEdge(row, col, 'top', seed + 1),
                    right: calculateEdge(row, col, 'right', seed + 2),
                    bottom: calculateEdge(row, col, 'bottom', seed + 3),
                    left: calculateEdge(row, col, 'left', seed + 4)
                }
            };
            pieces.push(piece);
        }
    }
    
    drawBoardGridWithPieces();
    
    pieces.forEach(piece => {
        const canvas = createPieceCanvas(piece);
        const trayPiece = document.createElement('canvas');
        trayPiece.className = 'tray-piece';
        trayPiece.id = piece.id;
        trayPiece.width = 70;
        trayPiece.height = 70;
        trayPiece.setAttribute('role', 'button');
        trayPiece.setAttribute('tabindex', '0');
        trayPiece.setAttribute('aria-label', `Puzzle piece ${piece.row + 1}-${piece.col + 1}`);
        
        const trayCtx = trayPiece.getContext('2d');
        trayCtx.drawImage(canvas, 0, 0, 70, 70);
        
        trayPiece.draggable = true;
        trayPiece.addEventListener('dragstart', handleDragStart);
        trayPiece.addEventListener('dragend', handleDragEnd);
        trayPiece.addEventListener('touchstart', handleTouchStart, { passive: false });
        trayPiece.addEventListener('touchmove', handleTouchMove, { passive: false });
        trayPiece.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        tray.appendChild(trayPiece);
    });
    
    shuffleChildren(tray);
    updatePiecesRemaining();
    
    const board = document.getElementById('puzzle-board');
    board.addEventListener('dragover', handleDragOver);
    board.addEventListener('drop', handleDrop);
}

function drawBoardGridWithPieces() {
    const canvas = document.getElementById('board-grid');
    canvas.width = boardWidth;
    canvas.height = boardHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = 'rgba(201, 162, 39, 0.4)';
    ctx.lineWidth = 1;
    
    pieces.forEach(piece => {
        drawJigsawOutline(ctx, piece.correctX, piece.correctY, pieceWidth, pieceHeight, piece.edges);
    });
    
    drawBackgroundImage();
}

function drawBackgroundImage() {
    const canvas = document.getElementById('background-image');
    canvas.width = boardWidth;
    canvas.height = boardHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(loadedImage, 0, 0, boardWidth, boardHeight);
}

function updateBackgroundBlur() {
    const progress = placedCount / pieces.length;
    const bgCanvas = document.getElementById('background-image');
    
    const blur = 8 * (1 - progress * 0.7);
    const brightness = 0.4 + (progress * 0.3);
    const opacity = 0.6 - (progress * 0.4);
    
    bgCanvas.style.filter = `blur(${blur}px) brightness(${brightness})`;
    bgCanvas.style.opacity = opacity;
}

function createPieceCanvas(piece) {
    const tabW = pieceWidth * CONFIG.TAB_SIZE;
    const tabH = pieceHeight * CONFIG.TAB_SIZE;
    const extraW = tabW * 2;
    const extraH = tabH * 2;
    
    const canvas = document.createElement('canvas');
    canvas.width = pieceWidth + extraW;
    canvas.height = pieceHeight + extraH;
    
    const ctx = canvas.getContext('2d');
    const offsetX = tabW;
    const offsetY = tabH;
    
    ctx.beginPath();
    createJigsawPath(ctx, offsetX, offsetY, pieceWidth, pieceHeight, piece.edges);
    ctx.closePath();
    ctx.clip();
    
    const srcX = (piece.col * loadedImage.width) / cols;
    const srcY = (piece.row * loadedImage.height) / rows;
    const srcW = loadedImage.width / cols;
    const srcH = loadedImage.height / rows;
    const srcTabW = srcW * CONFIG.TAB_SIZE;
    const srcTabH = srcH * CONFIG.TAB_SIZE;
    
    ctx.drawImage(loadedImage, srcX - srcTabW, srcY - srcTabH, srcW + srcTabW * 2, srcH + srcTabH * 2, 0, 0, pieceWidth + extraW, pieceHeight + extraH);
    
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    createJigsawPath(ctx, offsetX, offsetY, pieceWidth, pieceHeight, piece.edges);
    ctx.stroke();
    
    return canvas;
}

function createJigsawPath(ctx, x, y, w, h, edges) {
    const tabW = w * CONFIG.TAB_SIZE;
    const tabH = h * CONFIG.TAB_SIZE;
    
    ctx.moveTo(x, y);
    
    if (edges.top === 0) {
        ctx.lineTo(x + w, y);
    } else {
        ctx.lineTo(x + w * 0.35, y);
        ctx.bezierCurveTo(x + w * 0.35, y - edges.top * tabH, x + w * 0.65, y - edges.top * tabH, x + w * 0.65, y);
        ctx.lineTo(x + w, y);
    }
    
    if (edges.right === 0) {
        ctx.lineTo(x + w, y + h);
    } else {
        ctx.lineTo(x + w, y + h * 0.35);
        ctx.bezierCurveTo(x + w + edges.right * tabW, y + h * 0.35, x + w + edges.right * tabW, y + h * 0.65, x + w, y + h * 0.65);
        ctx.lineTo(x + w, y + h);
    }
    
    if (edges.bottom === 0) {
        ctx.lineTo(x, y + h);
    } else {
        ctx.lineTo(x + w * 0.65, y + h);
        ctx.bezierCurveTo(x + w * 0.65, y + h + edges.bottom * tabH, x + w * 0.35, y + h + edges.bottom * tabH, x + w * 0.35, y + h);
        ctx.lineTo(x, y + h);
    }
    
    if (edges.left === 0) {
        ctx.lineTo(x, y);
    } else {
        ctx.lineTo(x, y + h * 0.65);
        ctx.bezierCurveTo(x - edges.left * tabW, y + h * 0.65, x - edges.left * tabW, y + h * 0.35, x, y + h * 0.35);
        ctx.lineTo(x, y);
    }
}

function shuffleChildren(parent) {
    const children = Array.from(parent.children);
    children.sort(() => Math.random() - 0.5);
    children.forEach(child => parent.appendChild(child));
}

// Drag and Drop
let draggedPieceId = null;
let draggedElement = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

function handleDragStart(e) {
    draggedPieceId = e.target.id;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    if (!draggedPieceId) return;
    
    const piece = pieces.find(p => p.id === draggedPieceId);
    if (!piece || piece.placed) return;
    
    const board = document.getElementById('puzzle-board');
    const rect = board.getBoundingClientRect();
    const dropX = e.clientX - rect.left;
    const dropY = e.clientY - rect.top;
    
    const tolerance = Math.min(pieceWidth, pieceHeight) * CONFIG.DROP_TOLERANCE;
    const centerX = piece.correctX + pieceWidth / 2;
    const centerY = piece.correctY + pieceHeight / 2;
    
    if (Math.abs(dropX - centerX) < tolerance && Math.abs(dropY - centerY) < tolerance) {
        placePiece(piece);
    }
    
    draggedPieceId = null;
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const target = e.target;
    
    draggedPieceId = target.id;
    draggedElement = target;
    
    const rect = target.getBoundingClientRect();
    touchOffsetX = touch.clientX - rect.left;
    touchOffsetY = touch.clientY - rect.top;
    
    const clone = target.cloneNode(true);
    clone.id = 'drag-clone';
    clone.style.cssText = `position:fixed;left:${touch.clientX - touchOffsetX}px;top:${touch.clientY - touchOffsetY}px;width:70px;height:70px;z-index:9999;pointer-events:none;opacity:0.9;transform:scale(1.1);filter:drop-shadow(0 5px 15px rgba(0,0,0,0.5))`;
    document.body.appendChild(clone);
    
    target.classList.add('dragging');
}

function handleTouchMove(e) {
    e.preventDefault();
    const clone = document.getElementById('drag-clone');
    if (!clone) return;
    
    const touch = e.touches[0];
    clone.style.left = (touch.clientX - touchOffsetX) + 'px';
    clone.style.top = (touch.clientY - touchOffsetY) + 'px';
}

function handleTouchEnd(e) {
    e.preventDefault();
    const clone = document.getElementById('drag-clone');
    if (clone) clone.remove();
    
    if (draggedElement) draggedElement.classList.remove('dragging');
    if (!draggedPieceId) return;
    
    const piece = pieces.find(p => p.id === draggedPieceId);
    if (!piece || piece.placed) {
        draggedPieceId = null;
        draggedElement = null;
        return;
    }
    
    const touch = e.changedTouches[0];
    const board = document.getElementById('puzzle-board');
    const rect = board.getBoundingClientRect();
    const dropX = touch.clientX - rect.left;
    const dropY = touch.clientY - rect.top;
    
    const tolerance = Math.min(pieceWidth, pieceHeight) * CONFIG.DROP_TOLERANCE_MOBILE;
    const centerX = piece.correctX + pieceWidth / 2;
    const centerY = piece.correctY + pieceHeight / 2;
    
    if (Math.abs(dropX - centerX) < tolerance && Math.abs(dropY - centerY) < tolerance) {
        placePiece(piece);
    }
    
    draggedPieceId = null;
    draggedElement = null;
}

function placePiece(piece) {
    piece.placed = true;
    placedCount++;
    
    const trayPiece = document.getElementById(piece.id);
    if (trayPiece) trayPiece.remove();
    
    const container = document.getElementById('pieces-container');
    const canvas = createPieceCanvas(piece);
    const tabW = pieceWidth * CONFIG.TAB_SIZE;
    const tabH = pieceHeight * CONFIG.TAB_SIZE;
    
    const placedEl = document.createElement('canvas');
    placedEl.className = 'puzzle-piece placed correct';
    placedEl.width = canvas.width;
    placedEl.height = canvas.height;
    placedEl.style.left = (piece.correctX - tabW) + 'px';
    placedEl.style.top = (piece.correctY - tabH) + 'px';
    placedEl.style.width = canvas.width + 'px';
    placedEl.style.height = canvas.height + 'px';
    
    const ctx = placedEl.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    container.appendChild(placedEl);
    
    playPlaceSound();
    updatePiecesRemaining();
    updateBackgroundBlur();
    
    if (placedCount === pieces.length) {
        setTimeout(() => completePuzzle(), 600);
    }
}

function updatePiecesRemaining() {
    const el = document.getElementById('pieces-remaining');
    if (el) el.textContent = `(${pieces.length - placedCount} remaining)`;
}

function playPlaceSound() {
    const sound = document.getElementById('place-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

function completePuzzle() {
    const completedImage = document.getElementById('completed-image');
    const revelationTitle = document.getElementById('revelation-title');
    const revelationText = document.getElementById('revelation-text');
    
    if (completedImage) completedImage.style.backgroundImage = `url('${currentPuzzle.image}')`;
    if (revelationTitle) revelationTitle.textContent = currentPuzzle.revelation;
    if (revelationText) revelationText.textContent = currentPuzzle.explanation;
    
    switchScreen('completion');
    setTimeout(() => {
        startCelebration();
        playCelebrationSound();
    }, 300);
}

function startCelebration() {
    const canvas = document.getElementById('celebration-canvas');
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const colors = ['#c9a227', '#e8c547', '#f0d878', '#ffffff', '#ffd700'];
    
    for (let i = 0; i < 120; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * 100,
            vx: (Math.random() - 0.5) * 3,
            vy: Math.random() * 2 + 1.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 8,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            type: Math.random() > 0.6 ? 'star' : 'confetti',
            alpha: 1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = 0;
        
        particles.forEach(p => {
            if (p.alpha <= 0) return;
            active++;
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05;
            p.rotation += p.rotationSpeed;
            if (p.y > canvas.height * 0.8) p.alpha -= 0.015;
            
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            
            if (p.type === 'star') {
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                    const px = Math.cos(angle) * p.size;
                    const py = Math.sin(angle) * p.size;
                    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            }
            ctx.restore();
        });
        
        if (active > 0) requestAnimationFrame(animate);
    }
    animate();
}

function playCelebrationSound() {
    const sound = document.getElementById('celebration-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {});
    }
}

// Keyboard Navigation
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const activeScreen = document.querySelector('.screen.active');
            if (activeScreen === screens.puzzle) {
                switchScreen('selection');
            } else if (activeScreen === screens.difficulty) {
                switchScreen('selection');
            } else if (activeScreen === screens.completion) {
                switchScreen('selection');
            }
        }
    });
}

// Control Buttons
function setupEventListeners() {
    const restartBtn = document.getElementById('restart-btn');
    const changeDiffBtn = document.getElementById('change-difficulty-btn');
    const chooseAnotherBtn = document.getElementById('choose-another-btn');
    const continueBtn = document.getElementById('continue-btn');
    
    if (restartBtn) restartBtn.addEventListener('click', startPuzzle);
    if (changeDiffBtn) changeDiffBtn.addEventListener('click', () => switchScreen('difficulty'));
    if (chooseAnotherBtn) chooseAnotherBtn.addEventListener('click', () => switchScreen('selection'));
    if (continueBtn) continueBtn.addEventListener('click', () => switchScreen('selection'));
}

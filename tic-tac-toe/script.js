// Game state
let gameState = {
    board: Array(9).fill(''),
    currentPlayer: 'X',
    isGameActive: true,
    difficulty: 'medium',
    playerWins: 0,
    computerWins: 0,
    draws: 0,
    moveHistory: [],
    hintsUsed: 0,
    soundEnabled: true,
    achievements: new Set()
};

// Game constants
const PLAYER = 'X';
const COMPUTER = 'O';
const WINNING_CONDITIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
];

// Achievements system
const ACHIEVEMENTS = {
    firstWin: { name: "First Victory", emoji: "🎉", description: "Win your first game", requirement: 1, type: "wins" },
    winStreak: { name: "Win Streak", emoji: "🔥", description: "Win 3 games in a row", requirement: 3, type: "streak" },
    hardMode: { name: "Hard Mode", emoji: "🧠", description: "Beat Hard difficulty", requirement: 1, type: "hardWin" },
    impossible: { name: "The Impossible", emoji: "👑", description: "Beat Impossible difficulty", requirement: 1, type: "impossibleWin" },
    noHints: { name: "Pure Skill", emoji: "💪", description: "Win without using hints", requirement: 1, type: "noHints" },
    quickWin: { name: "Speed Demon", emoji: "⚡", description: "Win in under 10 seconds", requirement: 1, type: "quickWin" }
};

// DOM elements
const difficultySelector = document.getElementById('difficultySelector');
const gamePlay = document.getElementById('gamePlay');
const gameBoard = document.getElementById('gameBoard');
const cells = document.querySelectorAll('.cell');
const gameMessage = document.getElementById('gameMessage');
const turnIndicator = document.getElementById('turnIndicator');
const thinkingDots = document.getElementById('thinkingDots');
const currentDifficultyText = document.getElementById('currentDifficultyText');
const playerWinsElement = document.getElementById('playerWins');
const computerWinsElement = document.getElementById('computerWins');
const drawsElement = document.getElementById('draws');
const hintBtn = document.getElementById('hintBtn');
const undoBtn = document.getElementById('undoBtn');
const achievementsGrid = document.getElementById('achievementsGrid');
const winModal = document.getElementById('winModal');
const soundToggle = document.getElementById('soundToggle');

let gameStartTime = 0;
let currentStreak = 0;

// Initialize game
function initGame() {
    loadGameData();
    updateDisplay();
    createAchievementElements();
    
    // Add event listeners
    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    
    // Auto-save every 30 seconds
    setInterval(saveGameData, 30000);
    
    // Save on page unload
    window.addEventListener('beforeunload', saveGameData);
}

// Difficulty selection
function setDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    currentDifficultyText.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    
    difficultySelector.style.display = 'none';
    gamePlay.style.display = 'block';
    
    restartGame();
    playSound('select');
}

function showDifficultySelector() {
    difficultySelector.style.display = 'block';
    gamePlay.style.display = 'none';
}

// Main game logic
function handleCellClick(event) {
    const clickedCell = event.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));
    
    if (gameState.board[clickedCellIndex] !== '' || !gameState.isGameActive || gameState.currentPlayer !== PLAYER) {
        return;
    }
    
    makeMove(clickedCellIndex, PLAYER);
    
    if (checkGameEnd()) return;
    
    // Computer's turn
    gameState.currentPlayer = COMPUTER;
    updateTurnIndicator();
    
    setTimeout(() => {
        if (gameState.isGameActive) {
            computerMove();
        }
    }, getComputerThinkTime());
}

function makeMove(index, player) {
    gameState.board[index] = player;
    gameState.moveHistory.push({ index, player });
    
    const cell = cells[index];
    
    // Add animation
    const animation = document.createElement('div');
    animation.className = 'cell-animation';
    animation.textContent = player;
    cell.appendChild(animation);
    
    setTimeout(() => {
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        if (animation.parentNode) {
            animation.remove();
        }
    }, 150);
    
    playSound('move');
    updateUndoButton();
}

function computerMove() {
    const availableSpots = gameState.board
        .map((val, index) => val === '' ? index : null)
        .filter(val => val !== null);
    
    if (availableSpots.length === 0) return;
    
    let moveIndex;
    
    switch (gameState.difficulty) {
        case 'easy':
            moveIndex = getRandomMove(availableSpots);
            break;
        case 'medium':
            moveIndex = getMediumMove(availableSpots);
            break;
        case 'hard':
            moveIndex = getHardMove(availableSpots);
            break;
        case 'impossible':
            moveIndex = getImpossibleMove(availableSpots);
            break;
        default:
            moveIndex = getRandomMove(availableSpots);
    }
    
    makeMove(moveIndex, COMPUTER);
    
    if (checkGameEnd()) return;
    
    gameState.currentPlayer = PLAYER;
    updateTurnIndicator();
}

// AI difficulty implementations
function getRandomMove(availableSpots) {
    return availableSpots[Math.floor(Math.random() * availableSpots.length)];
}

function getMediumMove(availableSpots) {
    // 70% chance to play optimally, 30% random
    if (Math.random() < 0.7) {
        return getOptimalMove(availableSpots);
    }
    return getRandomMove(availableSpots);
}

function getHardMove(availableSpots) {
    // 90% chance to play optimally, 10% random
    if (Math.random() < 0.9) {
        return getOptimalMove(availableSpots);
    }
    return getRandomMove(availableSpots);
}

function getImpossibleMove(availableSpots) {
    return getOptimalMove(availableSpots);
}

function getOptimalMove(availableSpots) {
    // Check if computer can win
    for (let spot of availableSpots) {
        gameState.board[spot] = COMPUTER;
        if (checkWinner() === COMPUTER) {
            gameState.board[spot] = '';
            return spot;
        }
        gameState.board[spot] = '';
    }
    
    // Check if need to block player
    for (let spot of availableSpots) {
        gameState.board[spot] = PLAYER;
        if (checkWinner() === PLAYER) {
            gameState.board[spot] = '';
            return spot;
        }
        gameState.board[spot] = '';
    }
    
    // Take center if available
    if (availableSpots.includes(4)) {
        return 4;
    }
    
    // Take corners
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => availableSpots.includes(corner));
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // Take sides
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(side => availableSpots.includes(side));
    if (availableSides.length > 0) {
        return availableSides[Math.floor(Math.random() * availableSides.length)];
    }
    
    return getRandomMove(availableSpots);
}

function getComputerThinkTime() {
    const baseTimes = {
        easy: 500,
        medium: 1000,
        hard: 1500,
        impossible: 2000
    };
    
    const variation = Math.random() * 500;
    return baseTimes[gameState.difficulty] + variation;
}

// Game end checking
function checkGameEnd() {
    const winner = checkWinner();
    
    if (winner) {
        endGame(winner);
        return true;
    }
    
    if (!gameState.board.includes('')) {
        endGame('draw');
        return true;
    }
    
    return false;
}

function checkWinner() {
    for (let condition of WINNING_CONDITIONS) {
        const [a, b, c] = condition;
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
            
            // Highlight winning cells
            cells[a].classList.add('winning');
            cells[b].classList.add('winning');
            cells[c].classList.add('winning');
            
            return gameState.board[a];
        }
    }
    return null;
}

function endGame(result) {
    gameState.isGameActive = false;
    const gameTime = Date.now() - gameStartTime;
    
    let message, icon, title;
    
    if (result === PLAYER) {
        gameState.playerWins++;
        currentStreak++;
        message = getWinMessage();
        icon = '🎉';
        title = 'You Win!';
        playSound('win');
        
        // Check for achievements
        checkWinAchievements(gameTime);
        
    } else if (result === COMPUTER) {
        gameState.computerWins++;
        currentStreak = 0;
        message = 'Better luck next time!';
        icon = '🤖';
        title = 'AI Wins!';
        playSound('lose');
        
    } else {
        gameState.draws++;
        currentStreak = 0;
        message = 'Great game!';
        icon = '🤝';
        title = "It's a Draw!";
        playSound('draw');
    }
    
    gameMessage.textContent = title;
    turnIndicator.textContent = '';
    thinkingDots.style.display = 'none';
    
    // Show win modal
    setTimeout(() => {
        showWinModal(icon, title, message);
    }, 1000);
    
    updateDisplay();
    checkAchievements();
}

function getWinMessage() {
    const messages = [
        "Excellent strategy!",
        "You outsmarted the AI!",
        "Brilliant moves!",
        "Victory is yours!",
        "Well played!",
        "Outstanding game!",
        "You're getting good at this!",
        "The AI didn't see that coming!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

// Game controls
function restartGame() {
    gameState.board = Array(9).fill('');
    gameState.currentPlayer = PLAYER;
    gameState.isGameActive = true;
    gameState.moveHistory = [];
    gameState.hintsUsed = 0;
    gameStartTime = Date.now();
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning', 'hint');
    });
    
    gameMessage.textContent = 'Make your move!';
    updateTurnIndicator();
    updateUndoButton();
    
    hintBtn.disabled = false;
    playSound('start');
}

function undoMove() {
    if (gameState.moveHistory.length < 2) return;
    
    // Undo last two moves (player and computer)
    for (let i = 0; i < 2 && gameState.moveHistory.length > 0; i++) {
        const lastMove = gameState.moveHistory.pop();
        gameState.board[lastMove.index] = '';
        
        const cell = cells[lastMove.index];
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');
    }
    
    gameState.currentPlayer = PLAYER;
    gameState.isGameActive = true;
    updateTurnIndicator();
    updateUndoButton();
    
    playSound('undo');
}

function getHint() {
    if (!gameState.isGameActive || gameState.currentPlayer !== PLAYER) return;
    
    gameState.hintsUsed++;
    const availableSpots = gameState.board
        .map((val, index) => val === '' ? index : null)
        .filter(val => val !== null);
    
    const bestMove = getOptimalMove(availableSpots);
    
    // Highlight the hint cell
    cells[bestMove].classList.add('hint');
    setTimeout(() => {
        cells[bestMove].classList.remove('hint');
    }, 2000);
    
    hintBtn.disabled = true;
    setTimeout(() => {
        hintBtn.disabled = false;
    }, 5000);
    
    playSound('hint');
}

// UI updates
function updateTurnIndicator() {
    if (!gameState.isGameActive) return;
    
    if (gameState.currentPlayer === PLAYER) {
        turnIndicator.textContent = 'Your Turn';
        thinkingDots.style.display = 'none';
    } else {
        turnIndicator.textContent = 'AI Thinking';
        thinkingDots.style.display = 'flex';
    }
}

function updateUndoButton() {
    undoBtn.disabled = gameState.moveHistory.length < 2;
}

function updateDisplay() {
    playerWinsElement.textContent = gameState.playerWins;
    computerWinsElement.textContent = gameState.computerWins;
    drawsElement.textContent = gameState.draws;
}

// Win modal
function showWinModal(icon, title, message) {
    document.getElementById('winIcon').textContent = icon;
    document.getElementById('winTitle').textContent = title;
    document.getElementById('winMessage').textContent = message;
    winModal.classList.add('show');
}

function closeWinModal() {
    winModal.classList.remove('show');
}

// Achievements system
function checkWinAchievements(gameTime) {
    // Quick win achievement (under 10 seconds)
    if (gameTime < 10000 && !gameState.achievements.has('quickWin')) {
        unlockAchievement('quickWin');
    }
    
    // No hints achievement
    if (gameState.hintsUsed === 0 && !gameState.achievements.has('noHints')) {
        unlockAchievement('noHints');
    }
    
    // Difficulty-based achievements
    if (gameState.difficulty === 'hard' && !gameState.achievements.has('hardMode')) {
        unlockAchievement('hardMode');
    }
    
    if (gameState.difficulty === 'impossible' && !gameState.achievements.has('impossible')) {
        unlockAchievement('impossible');
    }
}

function checkAchievements() {
    // First win
    if (gameState.playerWins >= 1 && !gameState.achievements.has('firstWin')) {
        unlockAchievement('firstWin');
    }
    
    // Win streak
    if (currentStreak >= 3 && !gameState.achievements.has('winStreak')) {
        unlockAchievement('winStreak');
    }
}

function unlockAchievement(achievementId) {
    gameState.achievements.add(achievementId);
    const achievement = ACHIEVEMENTS[achievementId];
    
    // Show achievement notification
    showAchievementNotification(achievement);
    createAchievementElements();
    playSound('achievement');
}

function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div style="background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); 
                    color: #333; padding: 16px; border-radius: 12px; 
                    position: fixed; top: 20px; left: 50%; 
                    transform: translateX(-50%); z-index: 3000;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
                    animation: slideDown 0.5s ease-out;">
            <div style="font-size: 24px; margin-bottom: 8px;">${achievement.emoji}</div>
            <div style="font-weight: 600; margin-bottom: 4px;">Achievement Unlocked!</div>
            <div style="font-size: 14px;">${achievement.name}</div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function createAchievementElements() {
    achievementsGrid.innerHTML = '';
    
    for (const [id, achievement] of Object.entries(ACHIEVEMENTS)) {
        const element = document.createElement('div');
        element.className = 'achievement';
        element.title = `${achievement.name}: ${achievement.description}`;
        
        if (gameState.achievements.has(id)) {
            element.classList.add('unlocked');
            element.textContent = achievement.emoji;
        } else {
            element.textContent = '❓';
        }
        
        achievementsGrid.appendChild(element);
    }
}

// Sound system
function playSound(type) {
    if (!gameState.soundEnabled) return;
    
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const sounds = {
        move: { frequency: 800, duration: 0.1 },
        win: { frequency: 1000, duration: 0.3 },
        lose: { frequency: 400, duration: 0.3 },
        draw: { frequency: 600, duration: 0.2 },
        select: { frequency: 1200, duration: 0.1 },
        hint: { frequency: 1500, duration: 0.15 },
        undo: { frequency: 700, duration: 0.1 },
        start: { frequency: 900, duration: 0.2 },
        achievement: { frequency: 1600, duration: 0.4 }
    };
    
    const sound = sounds[type];
    if (!sound) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + sound.duration);
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    soundToggle.textContent = gameState.soundEnabled ? '🔊' : '🔇';
    soundToggle.classList.toggle('muted', !gameState.soundEnabled);
    
    if (gameState.soundEnabled) {
        playSound('select');
    }
}

// Data persistence
function saveGameData() {
    const saveData = {
        ...gameState,
        achievements: Array.from(gameState.achievements)
    };
    localStorage.setItem('ticTacToeSave', JSON.stringify(saveData));
}

function loadGameData() {
    const saved = localStorage.getItem('ticTacToeSave');
    if (saved) {
        const loadedData = JSON.parse(saved);
        gameState = { ...gameState, ...loadedData };
        
        // Convert achievements back to Set
        if (Array.isArray(gameState.achievements)) {
            gameState.achievements = new Set(gameState.achievements);
        }
    }
}

// Add CSS for slide down animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            transform: translateX(-50%) translateY(-100%);
            opacity: 0;
        }
        to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);
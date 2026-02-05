// Game themes
const themes = {
    fruits: ['🍎', '🍌', '🍒', '🍇', '🍋', '🥝', '🍓', '🍍', '🥭', '🍑', '🍊', '🥥'],
    animals: ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸'],
    emojis: ['😀', '😂', '😍', '🤔', '😎', '🥳', '😴', '🤗', '😇', '🤩', '😋', '🙃'],
    shapes: ['🔵', '🔴', '🟡', '🟢', '🟣', '🟠', '⚫', '⚪', '🔺', '🔻', '💎', '⭐']
};

// Game configuration
const difficulties = {
    easy: { rows: 3, cols: 4, pairs: 6 },
    medium: { rows: 4, cols: 4, pairs: 8 },
    hard: { rows: 4, cols: 6, pairs: 12 }
};

// Game state
let currentDifficulty = 'medium';
let currentTheme = 'fruits';
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let moves = 0;
let score = 0;
let lockBoard = false;
let startTime = null;
let timerInterval = null;

// DOM elements
const gameBoard = document.getElementById('gameBoard');
const difficultySelect = document.getElementById('difficultySelect');
const themeSelect = document.getElementById('themeSelect');
const newGameBtn = document.getElementById('newGame');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const pairsFoundDisplay = document.getElementById('pairsFound');
const movesDisplay = document.getElementById('moves');
const accuracyDisplay = document.getElementById('accuracy');
const gameModal = document.getElementById('gameModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const finalTimeDisplay = document.getElementById('finalTime');
const finalMovesDisplay = document.getElementById('finalMoves');
const finalScoreDisplay = document.getElementById('finalScore');

// Initialize game
function initializeGame() {
    const config = difficulties[currentDifficulty];
    totalPairs = config.pairs;
    
    // Reset game state
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    moves = 0;
    score = 0;
    lockBoard = false;
    startTime = Date.now();
    
    // Clear timer
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    // Create card pairs
    const selectedSymbols = themes[currentTheme].slice(0, totalPairs);
    cards = [...selectedSymbols, ...selectedSymbols];
    shuffleArray(cards);
    
    // Set up game board
    gameBoard.className = `game-board ${currentDifficulty}`;
    gameBoard.innerHTML = '';
    
    // Create card elements
    cards.forEach((symbol, index) => {
        const cardElement = createCard(symbol, index);
        gameBoard.appendChild(cardElement);
    });
    
    // Update displays
    updateStats();
    gameModal.classList.remove('show');
}

function createCard(symbol, index) {
    const cardElement = document.createElement('div');
    cardElement.classList.add('card');
    cardElement.dataset.symbol = symbol;
    cardElement.dataset.index = index;
    
    const front = document.createElement('div');
    front.classList.add('front');
    front.textContent = symbol;
    
    const back = document.createElement('div');
    back.classList.add('back');
    back.textContent = '?';
    
    cardElement.appendChild(front);
    cardElement.appendChild(back);
    cardElement.addEventListener('click', () => flipCard(cardElement));
    
    return cardElement;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function flipCard(card) {
    if (lockBoard || 
        card === flippedCards[0] || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched')) {
        return;
    }
    
    card.classList.add('flipped');
    flippedCards.push(card);
    
    if (flippedCards.length === 2) {
        lockBoard = true;
        moves++;
        updateStats();
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    const isMatch = card1.dataset.symbol === card2.dataset.symbol;
    
    if (isMatch) {
        // Match found
        setTimeout(() => {
            card1.classList.add('matched', 'match-success');
            card2.classList.add('matched', 'match-success');
            matchedPairs++;
            
            // Calculate score
            const timeBonus = Math.max(0, 100 - Math.floor((Date.now() - startTime) / 1000));
            const moveBonus = Math.max(0, 50 - moves);
            score += 100 + timeBonus + moveBonus;
            
            updateStats();
            resetFlippedCards();
            
            // Check win condition
            if (matchedPairs === totalPairs) {
                setTimeout(() => endGame(), 500);
            }
        }, 300);
    } else {
        // No match
        setTimeout(() => {
            card1.classList.add('wrong');
            card2.classList.add('wrong');
            
            setTimeout(() => {
                card1.classList.remove('flipped', 'wrong');
                card2.classList.remove('flipped', 'wrong');
                resetFlippedCards();
            }, 500);
        }, 800);
    }
}

function resetFlippedCards() {
    flippedCards = [];
    lockBoard = false;
}

function updateStats() {
    scoreDisplay.textContent = score;
    pairsFoundDisplay.textContent = matchedPairs;
    movesDisplay.textContent = moves;
    
    // Calculate accuracy
    const accuracy = moves === 0 ? 100 : Math.round((matchedPairs / moves) * 100);
    accuracyDisplay.textContent = `${accuracy}%`;
}

function updateTimer() {
    if (!startTime) return;
    
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timerDisplay.textContent = `${minutes}:${seconds}`;
}

function endGame() {
    if (timerInterval) clearInterval(timerInterval);
    
    const finalTime = timerDisplay.textContent;
    const accuracy = Math.round((matchedPairs / moves) * 100);
    
    modalTitle.textContent = '🎉 Congratulations!';
    modalMessage.textContent = `You matched all ${totalPairs} pairs!`;
    finalTimeDisplay.textContent = finalTime;
    finalMovesDisplay.textContent = moves;
    finalScoreDisplay.textContent = score;
    
    // Save high score
    const highScoreKey = `memory-highscore-${currentDifficulty}`;
    const currentHighScore = parseInt(localStorage.getItem(highScoreKey) || '0');
    if (score > currentHighScore) {
        localStorage.setItem(highScoreKey, score.toString());
        modalMessage.textContent += ' 🏆 New High Score!';
    }
    
    setTimeout(() => {
        gameModal.classList.add('show');
    }, 1000);
}

// Event listeners
newGameBtn.addEventListener('click', initializeGame);

difficultySelect.addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    initializeGame();
});

themeSelect.addEventListener('change', (e) => {
    currentTheme = e.target.value;
    initializeGame();
});

document.getElementById('playAgain').addEventListener('click', initializeGame);

document.getElementById('changeDifficulty').addEventListener('click', () => {
    gameModal.classList.remove('show');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'n' || e.key === 'N') {
        initializeGame();
    }
    if (e.key === 'Escape') {
        gameModal.classList.remove('show');
    }
});

// Hint system (optional - can be activated with H key)
document.addEventListener('keydown', (e) => {
    if (e.key === 'h' || e.key === 'H') {
        showHint();
    }
});

function showHint() {
    if (lockBoard || flippedCards.length > 0) return;
    
    const unmatched = Array.from(gameBoard.children).filter(card => 
        !card.classList.contains('matched') && !card.classList.contains('flipped')
    );
    
    if (unmatched.length >= 2) {
        // Find a matching pair
        for (let i = 0; i < unmatched.length; i++) {
            for (let j = i + 1; j < unmatched.length; j++) {
                if (unmatched[i].dataset.symbol === unmatched[j].dataset.symbol) {
                    unmatched[i].classList.add('hint');
                    unmatched[j].classList.add('hint');
                    
                    setTimeout(() => {
                        unmatched[i].classList.remove('hint');
                        unmatched[j].classList.remove('hint');
                    }, 1000);
                    
                    return;
                }
            }
        }
    }
}

// Initialize game on load
initializeGame();
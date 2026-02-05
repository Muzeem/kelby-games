// Game configuration
const GAME_CONFIG = {
    gravity: 1200,
    jumpForce: 500,
    groundHeight: 60,
    runnerLeft: 80,
    gameSpeed: 200,
    spawnInterval: 1800,
    nobelDistance: 10000 // Distance to reach Nobel Prize
};

// Obstacle types with scientific theme
const OBSTACLES = [
    { emoji: '📚', name: 'Research Papers', size: 1.0, danger: 'low' },
    { emoji: '⚗️', name: 'Failed Experiment', size: 1.2, danger: 'medium' },
    { emoji: '💻', name: 'Broken Equipment', size: 1.1, danger: 'medium' },
    { emoji: '📊', name: 'Bad Data', size: 0.9, danger: 'low' },
    { emoji: '🔬', name: 'Contaminated Sample', size: 1.0, danger: 'high' },
    { emoji: '📋', name: 'Rejected Paper', size: 0.8, danger: 'low' },
    { emoji: '⚡', name: 'Power Outage', size: 1.3, danger: 'high' },
    { emoji: '🧪', name: 'Chemical Spill', size: 1.1, danger: 'medium' }
];

// Power-ups
const POWER_UPS = [
    { emoji: '🛡️', type: 'shield', duration: 5000, name: 'Research Grant Shield' },
    { emoji: '⚡', type: 'speed', duration: 3000, name: 'Caffeine Boost' },
    { emoji: '🚀', type: 'jump', duration: 4000, name: 'Inspiration Jump' }
];

// Game state
let gameState = {
    running: false,
    paused: false,
    score: 0,
    highScore: parseInt(localStorage.getItem('nobel-runner-high-score') || '0'),
    distance: 0,
    speed: GAME_CONFIG.gameSpeed,
    spawnTimer: 0,
    obstacles: [],
    powerUps: [],
    activePowerUps: new Set(),
    runner: {
        y: 0,
        velocityY: 0,
        isJumping: false,
        hasShield: false
    }
};

// DOM elements
const gameStage = document.getElementById('gameStage');
const runner = document.getElementById('runner');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const startOverlay = document.getElementById('startOverlay');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const winOverlay = document.getElementById('winOverlay');
const finalScore = document.getElementById('finalScore');
const progressFill = document.getElementById('progressFill');
const nobelPrize = document.getElementById('nobelPrize');

let animationId = null;
let lastTime = 0;

// Initialize game
function initGame() {
    updateHighScore();
    updateScore();
    updateProgress();
}

function startGame() {
    // Reset game state
    gameState.running = true;
    gameState.paused = false;
    gameState.score = 0;
    gameState.distance = 0;
    gameState.speed = GAME_CONFIG.gameSpeed;
    gameState.spawnTimer = 0;
    gameState.obstacles = [];
    gameState.powerUps = [];
    gameState.activePowerUps.clear();
    gameState.runner = {
        y: 0,
        velocityY: 0,
        isJumping: false,
        hasShield: false
    };
    
    // Clear existing obstacles and power-ups
    document.querySelectorAll('.obstacle, .power-up-item').forEach(el => el.remove());
    
    // Update UI
    startOverlay.style.display = 'none';
    gameOverOverlay.style.display = 'none';
    winOverlay.style.display = 'none';
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-block';
    restartBtn.style.display = 'inline-block';
    
    runner.className = 'runner idle';
    runner.style.bottom = GAME_CONFIG.groundHeight + 'px';
    
    updateScore();
    updateProgress();
    
    lastTime = performance.now();
    gameLoop();
}

function gameLoop(currentTime = performance.now()) {
    if (!gameState.running || gameState.paused) return;
    
    const deltaTime = Math.min(currentTime - lastTime, 50) / 1000;
    lastTime = currentTime;
    
    // Update runner physics
    updateRunner(deltaTime);
    
    // Spawn obstacles and power-ups
    updateSpawning(deltaTime);
    
    // Update obstacles
    updateObstacles(deltaTime);
    
    // Update power-ups
    updatePowerUps(deltaTime);
    
    // Update game progression
    updateGameProgression(deltaTime);
    
    // Check collisions
    checkCollisions();
    
    // Update UI
    updateScore();
    updateProgress();
    updatePowerUpDisplay();
    
    // Check win condition
    if (gameState.distance >= GAME_CONFIG.nobelDistance) {
        winGame();
        return;
    }
    
    animationId = requestAnimationFrame(gameLoop);
}

function updateRunner(deltaTime) {
    if (gameState.runner.isJumping || gameState.runner.y > 0) {
        gameState.runner.velocityY -= GAME_CONFIG.gravity * deltaTime;
        gameState.runner.y += gameState.runner.velocityY * deltaTime;
        
        if (gameState.runner.y <= 0) {
            gameState.runner.y = 0;
            gameState.runner.velocityY = 0;
            gameState.runner.isJumping = false;
            runner.classList.remove('jumping');
            runner.classList.add('idle');
        }
        
        runner.style.bottom = (GAME_CONFIG.groundHeight + gameState.runner.y) + 'px';
    }
}

function updateSpawning(deltaTime) {
    gameState.spawnTimer += deltaTime * 1000;
    
    const currentInterval = Math.max(800, GAME_CONFIG.spawnInterval - (gameState.score * 20));
    
    if (gameState.spawnTimer >= currentInterval) {
        gameState.spawnTimer = 0;
        
        // 80% chance for obstacle, 20% for power-up
        if (Math.random() < 0.8) {
            spawnObstacle();
        } else {
            spawnPowerUp();
        }
    }
}

function spawnObstacle() {
    const obstacleType = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
    const obstacle = document.createElement('div');
    obstacle.className = 'obstacle';
    if (obstacleType.danger === 'high') obstacle.classList.add('danger');
    
    obstacle.textContent = obstacleType.emoji;
    obstacle.style.right = '-60px';
    obstacle.style.transform = `scale(${obstacleType.size})`;
    
    gameStage.appendChild(obstacle);
    
    gameState.obstacles.push({
        element: obstacle,
        x: gameStage.clientWidth + 60,
        width: 50 * obstacleType.size,
        height: 60 * obstacleType.size,
        type: obstacleType
    });
}

function spawnPowerUp() {
    const powerUpType = POWER_UPS[Math.floor(Math.random() * POWER_UPS.length)];
    const powerUp = document.createElement('div');
    powerUp.className = 'power-up-item';
    powerUp.textContent = powerUpType.emoji;
    powerUp.style.right = '-50px';
    
    gameStage.appendChild(powerUp);
    
    gameState.powerUps.push({
        element: powerUp,
        x: gameStage.clientWidth + 50,
        width: 40,
        height: 40,
        type: powerUpType
    });
}

function updateObstacles(deltaTime) {
    const speed = gameState.speed * deltaTime;
    
    for (let i = gameState.obstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.obstacles[i];
        obstacle.x -= speed;
        obstacle.element.style.right = (gameStage.clientWidth - obstacle.x) + 'px';
        
        if (obstacle.x < -obstacle.width) {
            obstacle.element.remove();
            gameState.obstacles.splice(i, 1);
            gameState.score += 10;
        }
    }
}

function updatePowerUps(deltaTime) {
    const speed = gameState.speed * deltaTime;
    
    for (let i = gameState.powerUps.length - 1; i >= 0; i--) {
        const powerUp = gameState.powerUps[i];
        powerUp.x -= speed;
        powerUp.element.style.right = (gameStage.clientWidth - powerUp.x) + 'px';
        
        if (powerUp.x < -powerUp.width) {
            powerUp.element.remove();
            gameState.powerUps.splice(i, 1);
        }
    }
}

function updateGameProgression(deltaTime) {
    gameState.distance += gameState.speed * deltaTime;
    
    // Increase difficulty over time
    if (gameState.score > 0 && gameState.score % 100 === 0) {
        gameState.speed = Math.min(400, gameState.speed + 10);
    }
    
    // Move Nobel Prize closer as player progresses
    const nobelProgress = Math.min(1, gameState.distance / GAME_CONFIG.nobelDistance);
    const nobelPosition = gameStage.clientWidth - (nobelProgress * (gameStage.clientWidth + 100));
    nobelPrize.style.right = (gameStage.clientWidth - nobelPosition) + 'px';
}

function checkCollisions() {
    const runnerRect = {
        x: GAME_CONFIG.runnerLeft,
        y: GAME_CONFIG.groundHeight + gameState.runner.y,
        width: 50,
        height: 70
    };
    
    // Check obstacle collisions
    for (let obstacle of gameState.obstacles) {
        const obstacleRect = {
            x: obstacle.x,
            y: GAME_CONFIG.groundHeight,
            width: obstacle.width,
            height: obstacle.height
        };
        
        if (isColliding(runnerRect, obstacleRect)) {
            if (gameState.runner.hasShield) {
                // Shield protects from collision
                obstacle.element.remove();
                gameState.obstacles = gameState.obstacles.filter(o => o !== obstacle);
                gameState.score += 50; // Bonus for shield use
            } else {
                endGame();
                return;
            }
        }
    }
    
    // Check power-up collisions
    for (let i = gameState.powerUps.length - 1; i >= 0; i--) {
        const powerUp = gameState.powerUps[i];
        const powerUpRect = {
            x: powerUp.x,
            y: GAME_CONFIG.groundHeight + 60,
            width: powerUp.width,
            height: powerUp.height
        };
        
        if (isColliding(runnerRect, powerUpRect)) {
            collectPowerUp(powerUp);
            powerUp.element.remove();
            gameState.powerUps.splice(i, 1);
        }
    }
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function collectPowerUp(powerUp) {
    const type = powerUp.type.type;
    gameState.activePowerUps.add(type);
    
    switch (type) {
        case 'shield':
            gameState.runner.hasShield = true;
            runner.classList.add('shield');
            setTimeout(() => {
                gameState.runner.hasShield = false;
                runner.classList.remove('shield');
                gameState.activePowerUps.delete('shield');
            }, powerUp.type.duration);
            break;
            
        case 'speed':
            gameState.speed *= 0.7; // Slow down obstacles
            setTimeout(() => {
                gameState.speed /= 0.7;
                gameState.activePowerUps.delete('speed');
            }, powerUp.type.duration);
            break;
            
        case 'jump':
            // Enhanced jump for duration
            setTimeout(() => {
                gameState.activePowerUps.delete('jump');
            }, powerUp.type.duration);
            break;
    }
    
    gameState.score += 25;
}

function jump() {
    if (!gameState.runner.isJumping && gameState.runner.y === 0) {
        const jumpForce = gameState.activePowerUps.has('jump') ? 
                         GAME_CONFIG.jumpForce * 1.5 : GAME_CONFIG.jumpForce;
        
        gameState.runner.velocityY = jumpForce;
        gameState.runner.isJumping = true;
        runner.classList.remove('idle');
        runner.classList.add('jumping');
    }
}

function pauseGame() {
    gameState.paused = !gameState.paused;
    pauseBtn.textContent = gameState.paused ? 'Resume' : 'Pause';
    
    if (!gameState.paused) {
        lastTime = performance.now();
        gameLoop();
    }
}

function endGame() {
    gameState.running = false;
    cancelAnimationFrame(animationId);
    
    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('nobel-runner-high-score', gameState.highScore.toString());
        updateHighScore();
    }
    
    // Show game over screen
    finalScore.textContent = gameState.score;
    document.getElementById('gameOverTitle').textContent = getGameOverMessage();
    document.getElementById('gameOverMessage').innerHTML = 
        `Your research journey ended at score <strong>${gameState.score}</strong>`;
    
    // Show achievements
    showAchievements();
    
    gameOverOverlay.style.display = 'flex';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
}

function winGame() {
    gameState.running = false;
    cancelAnimationFrame(animationId);
    
    // Bonus score for winning
    gameState.score += 1000;
    
    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('nobel-runner-high-score', gameState.highScore.toString());
        updateHighScore();
    }
    
    document.getElementById('winStats').innerHTML = `
        <div class="achievements">
            <h3>🏆 Nobel Prize Achieved! 🏆</h3>
            <p>Final Score: <strong>${gameState.score}</strong></p>
            <p>You've made groundbreaking scientific discoveries!</p>
        </div>
    `;
    
    winOverlay.style.display = 'flex';
    startBtn.style.display = 'inline-block';
    pauseBtn.style.display = 'none';
}

function getGameOverMessage() {
    const messages = [
        "Research Setback! 🔬",
        "Experiment Failed! ⚗️",
        "Back to the Lab! 📚",
        "Science is Hard! 💻",
        "Try Again, Scientist! 🧪"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

function showAchievements() {
    const achievements = [];
    
    if (gameState.score >= 500) achievements.push("🏅 Research Master");
    if (gameState.score >= 1000) achievements.push("🎓 PhD Level");
    if (gameState.score >= 200) achievements.push("⚡ Speed Demon");
    if (gameState.activePowerUps.size > 0) achievements.push("🛡️ Power User");
    
    const achievementsEl = document.getElementById('achievements');
    if (achievements.length > 0) {
        achievementsEl.innerHTML = `<strong>Achievements:</strong><br>${achievements.join('<br>')}`;
    } else {
        achievementsEl.innerHTML = '<em>Keep trying to unlock achievements!</em>';
    }
}

function updateScore() {
    scoreDisplay.textContent = gameState.score;
}

function updateHighScore() {
    highScoreDisplay.textContent = gameState.highScore;
}

function updateProgress() {
    const progress = Math.min(100, (gameState.distance / GAME_CONFIG.nobelDistance) * 100);
    progressFill.style.width = progress + '%';
}

function updatePowerUpDisplay() {
    document.querySelectorAll('.power-up').forEach(el => {
        const type = el.dataset.type;
        el.classList.toggle('active', gameState.activePowerUps.has(type));
    });
}

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
restartBtn.addEventListener('click', startGame);
document.getElementById('playAgainBtn').addEventListener('click', startGame);
document.getElementById('celebrateBtn').addEventListener('click', startGame);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameState.running) {
            startGame();
        } else if (!gameState.paused) {
            jump();
        }
    }
    
    if (e.code === 'KeyP' && gameState.running) {
        pauseGame();
    }
});

// Touch controls
gameStage.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameState.running) {
        startGame();
    } else if (!gameState.paused) {
        jump();
    }
}, { passive: false });

// Share functionality
document.getElementById('shareBtn').addEventListener('click', () => {
    if (navigator.share) {
        navigator.share({
            title: 'Nobel Runner',
            text: `I just scored ${gameState.score} points in Nobel Runner! Can you beat my score?`,
            url: window.location.href
        });
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(`I just scored ${gameState.score} points in Nobel Runner! Play at ${window.location.href}`);
        alert('Score copied to clipboard!');
    }
});

// Initialize game
initGame();
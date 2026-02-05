# Game Development Guide

Guide for creating new games for the Kelby Games platform.

## Game Standards

### Technical Requirements
- Pure HTML5, CSS3, JavaScript (ES6+)
- No external frameworks or libraries
- Total file size < 500KB
- Works in Chrome 90+, Firefox 88+, Safari 14+
- Mobile responsive (320px minimum width)
- Accessible (WCAG 2.1 AA compliant)

### Performance Targets
- First Contentful Paint < 1.5s
- Time to Interactive < 2.5s
- Lighthouse Performance score > 90
- No memory leaks
- Smooth 60fps gameplay

## Game Architecture

### File Structure
```
games/game-name/
├── index.html          # Entry point
├── script.js           # Game logic
├── styles.css          # Styling
├── manifest.json       # PWA manifest
├── sw.js              # Service worker (optional)
├── icons/             # App icons
│   ├── icon-192.png
│   └── icon-512.png
└── assets/            # Game assets (optional)
    ├── images/
    └── sounds/
```

### HTML Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Brief game description">
    <meta name="theme-color" content="#4CAF50">
    <title>Game Name - Kelby Games</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="manifest" href="manifest.json">
    <link rel="icon" href="icons/icon-192.png">
</head>
<body>
    <div class="game-container">
        <header>
            <h1>Game Name</h1>
            <div class="score">Score: <span id="score">0</span></div>
        </header>
        
        <main id="game-area">
            <!-- Game content -->
        </main>
        
        <footer>
            <button id="restart">Restart</button>
            <a href="/" class="back-link">← Back to Games</a>
        </footer>
    </div>
    
    <script src="script.js"></script>
</body>
</html>
```

### JavaScript Structure
```javascript
// Game state
const gameState = {
    score: 0,
    level: 1,
    isPlaying: false,
    // ... other state
};

// Initialize game
function init() {
    setupEventListeners();
    loadSavedState();
    startGame();
}

// Game loop
function gameLoop(timestamp) {
    if (!gameState.isPlaying) return;
    
    update(timestamp);
    render();
    
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(timestamp) {
    // Update logic
}

// Render game
function render() {
    // Rendering logic
}

// Event listeners
function setupEventListeners() {
    document.getElementById('restart').addEventListener('click', restart);
    // ... other listeners
}

// Save/Load state
function saveState() {
    localStorage.setItem('game-name-state', JSON.stringify(gameState));
}

function loadSavedState() {
    const saved = localStorage.getItem('game-name-state');
    if (saved) {
        Object.assign(gameState, JSON.parse(saved));
    }
}

// Start game when DOM is ready
document.addEventListener('DOMContentLoaded', init);
```

### CSS Structure
```css
/* Reset and base styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Game container */
.game-container {
    max-width: 800px;
    width: 100%;
    padding: 20px;
}

/* Responsive design */
@media (max-width: 768px) {
    .game-container {
        padding: 10px;
    }
}

/* Accessibility */
button:focus,
a:focus {
    outline: 2px solid #fff;
    outline-offset: 2px;
}
```

## Canvas Games

### Canvas Setup
```javascript
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
```

### Rendering Pattern
```javascript
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw game objects
    gameObjects.forEach(obj => obj.draw(ctx));
}
```

### Game Object Pattern
```javascript
class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    update(deltaTime) {
        // Update logic
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    collidesWith(other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}
```

## Input Handling

### Keyboard
```javascript
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// In game loop
if (keys['ArrowLeft']) {
    player.moveLeft();
}
```

### Touch
```javascript
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    handleInput(x, y);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    // Handle touch move
});
```

### Mouse
```javascript
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    handleInput(x, y);
});
```

## State Management

### LocalStorage Pattern
```javascript
const STORAGE_KEY = 'game-name-state';

function saveGame() {
    const state = {
        score: gameState.score,
        level: gameState.level,
        highScore: gameState.highScore,
        timestamp: Date.now()
    };
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.error('Failed to save game:', e);
    }
}

function loadGame() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const state = JSON.parse(saved);
            Object.assign(gameState, state);
            return true;
        }
    } catch (e) {
        console.error('Failed to load game:', e);
    }
    return false;
}

function clearSave() {
    localStorage.removeItem(STORAGE_KEY);
}
```

## Audio

### Sound Effects
```javascript
class SoundManager {
    constructor() {
        this.sounds = {};
        this.muted = false;
    }
    
    load(name, url) {
        this.sounds[name] = new Audio(url);
    }
    
    play(name) {
        if (this.muted) return;
        
        const sound = this.sounds[name];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
    }
}

const soundManager = new SoundManager();
soundManager.load('jump', 'assets/sounds/jump.mp3');
soundManager.play('jump');
```

## Progressive Web App

### Manifest.json
```json
{
  "name": "Game Name",
  "short_name": "Game",
  "description": "Brief game description",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#667eea",
  "theme_color": "#4CAF50",
  "icons": [
    {
      "src": "icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker
```javascript
const CACHE_NAME = 'game-name-v1';
const urlsToCache = [
    './',
    './index.html',
    './script.js',
    './styles.css',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
```

## Accessibility

### Keyboard Navigation
```javascript
// Focus management
const focusableElements = document.querySelectorAll(
    'button, a, input, [tabindex]:not([tabindex="-1"])'
);

// Trap focus in modal
function trapFocus(element) {
    const focusable = element.querySelectorAll(
        'button, a, input, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
}
```

### ARIA Labels
```html
<button aria-label="Start game">▶</button>
<div role="status" aria-live="polite">
    Score: <span id="score">0</span>
</div>
<canvas aria-label="Game canvas" role="img"></canvas>
```

## Performance Optimization

### Efficient Rendering
```javascript
// Use requestAnimationFrame
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Only update if enough time has passed (60fps)
    if (deltaTime >= 16.67) {
        update(deltaTime);
        render();
    }
    
    requestAnimationFrame(gameLoop);
}

// Object pooling
class ObjectPool {
    constructor(createFn, size = 50) {
        this.pool = Array(size).fill(null).map(() => createFn());
        this.active = [];
    }
    
    get() {
        return this.pool.pop() || this.active[0];
    }
    
    release(obj) {
        this.pool.push(obj);
        const index = this.active.indexOf(obj);
        if (index > -1) this.active.splice(index, 1);
    }
}
```

### Memory Management
```javascript
// Clean up event listeners
function cleanup() {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    canvas.removeEventListener('click', handleClick);
    
    // Clear intervals/timeouts
    clearInterval(gameInterval);
    clearTimeout(gameTimeout);
    
    // Cancel animation frame
    cancelAnimationFrame(animationId);
}

// Call cleanup when leaving game
window.addEventListener('beforeunload', cleanup);
```

## Testing Checklist

### Functionality
- [ ] Game starts correctly
- [ ] Controls work (keyboard, mouse, touch)
- [ ] Score updates properly
- [ ] Game over works
- [ ] Restart works
- [ ] State persists (if applicable)
- [ ] Back button works

### Performance
- [ ] No lag or stuttering
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Fast initial load
- [ ] Efficient rendering

### Compatibility
- [ ] Chrome desktop
- [ ] Firefox desktop
- [ ] Safari desktop
- [ ] Edge desktop
- [ ] Chrome mobile
- [ ] Safari iOS
- [ ] Various screen sizes

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] Sufficient color contrast
- [ ] Touch targets 44x44px+
- [ ] No flashing content

## Common Patterns

### Collision Detection
```javascript
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}
```

### Random Number Generation
```javascript
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}
```

### Easing Functions
```javascript
const easing = {
    linear: t => t,
    easeIn: t => t * t,
    easeOut: t => t * (2 - t),
    easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
};
```

## Resources

- [MDN Game Development](https://developer.mozilla.org/en-US/docs/Games)
- [HTML5 Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

---

**Happy Game Development!** 🎮

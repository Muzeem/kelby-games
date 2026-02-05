# Architecture Documentation

## System Overview

Kelby Games is a static web application consisting of a portal homepage and multiple standalone browser games. The architecture prioritizes simplicity, performance, and privacy.

## Technology Stack

### Frontend
- **HTML5** - Semantic markup, Canvas API for game rendering
- **CSS3** - Modern layouts (Flexbox, Grid), animations, responsive design
- **JavaScript (ES6+)** - Pure vanilla JS, no frameworks
- **Web APIs** - Service Workers, LocalStorage, Canvas, Audio

### Infrastructure
- **Hosting** - Static file hosting (Netlify, GitHub Pages, S3)
- **CDN** - Automatic via hosting provider
- **SSL/TLS** - Automatic HTTPS
- **No Backend** - Fully client-side application

## Project Structure

```
kelby-games/
├── index.html              # Portal homepage
├── portal-style.css        # Portal styling
├── portal-script.js        # Portal functionality
├── manifest.json           # Portal PWA manifest
├── service-worker.js       # Portal service worker
├── privacy-policy.html     # Privacy policy
│
├── games/                  # Individual games
│   ├── dreamers-puzzle/    # Featured PWA game
│   ├── hangman/
│   ├── jigsaw-puzzle/
│   ├── memory-match/
│   ├── tic-tac-toe/
│   ├── life-simulator/
│   └── [other-games]/
│
├── images/                 # Shared assets
│   ├── *-thumbnail.svg     # Game thumbnails
│   └── puzzle*.jpg         # Puzzle images
│
├── icons/                  # Portal icons
│   ├── icon-192.png
│   └── icon-512.png
│
└── docs/                   # Documentation
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    └── GAME_DEVELOPMENT.md
```

## Game Architecture

### Standard Game Structure
```
games/game-name/
├── index.html          # Game entry point
├── script.js           # Game logic
├── styles.css          # Game styling
├── manifest.json       # PWA manifest
├── sw.js              # Service worker (optional)
└── icons/             # Game icons
    ├── icon-192.png
    └── icon-512.png
```

### Game Lifecycle
1. **Load** - HTML parsed, assets loaded
2. **Initialize** - Game state setup, event listeners
3. **Game Loop** - Render, update, handle input
4. **Persist** - Save state to LocalStorage
5. **Cleanup** - Remove listeners, clear timers

## Progressive Web App (PWA)

### Service Worker Strategy
- **Cache First** - Static assets (HTML, CSS, JS, images)
- **Network First** - Dynamic content (if any)
- **Offline Fallback** - Show offline page when network unavailable

### Caching Strategy
```javascript
// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

## Data Flow

### Portal Flow
```
User → Portal (index.html)
     → Select Game
     → Navigate to /games/[game-name]/
     → Game Loads
     → Play
     → Return to Portal
```

### Game State Management
```
Game Start
  ↓
Load State (LocalStorage)
  ↓
Game Loop (requestAnimationFrame)
  ↓
User Input → Update State → Render
  ↓
Save State (LocalStorage)
  ↓
Game End
```

## Performance Optimization

### Asset Optimization
- **Images** - Compressed, lazy loaded, responsive sizes
- **CSS** - Minified, critical CSS inlined
- **JavaScript** - Minified, deferred loading
- **Fonts** - System fonts preferred, web fonts preloaded

### Rendering Optimization
- **Canvas** - Hardware acceleration, efficient drawing
- **Animations** - CSS transforms, requestAnimationFrame
- **Reflows** - Minimize DOM manipulation
- **Memory** - Clean up listeners, clear intervals

### Loading Strategy
```
1. Critical HTML/CSS (inline)
2. Deferred JavaScript
3. Lazy-loaded images
4. Service worker registration
5. Prefetch next likely resources
```

## Security

### Content Security Policy
```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
```

### Privacy Measures
- No third-party scripts
- No tracking pixels
- No cookies
- No external API calls
- No user data collection

## Accessibility

### WCAG 2.1 AA Compliance
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Color contrast ratios
- Screen reader support
- Touch target sizes (44x44px minimum)

### Keyboard Controls
- Tab navigation
- Enter/Space for activation
- Arrow keys for game controls
- Escape for menus/dialogs

## Browser Support

### Target Browsers
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### Progressive Enhancement
```
Base Experience (All Browsers)
  ↓
Enhanced Experience (Modern Browsers)
  ↓
PWA Features (Supporting Browsers)
```

## Monitoring & Analytics

### Performance Monitoring
- Lighthouse CI (automated)
- Web Vitals tracking
- Error logging (console)

### No User Tracking
- No Google Analytics
- No Facebook Pixel
- No third-party analytics
- Privacy-first approach

## Scalability

### Horizontal Scaling
- Static files scale infinitely via CDN
- No server-side bottlenecks
- No database connections

### Content Scaling
- Add new games without infrastructure changes
- Modular game architecture
- Independent game deployments

## Deployment Pipeline

```
Developer
  ↓
Git Commit
  ↓
GitHub Repository
  ↓
CI/CD (GitHub Actions)
  ↓
Build & Test
  ↓
Deploy to Hosting
  ↓
CDN Distribution
  ↓
Live Site
```

## Future Considerations

### Potential Enhancements
- Build process (bundling, minification)
- TypeScript for type safety
- Automated testing (Jest, Playwright)
- Performance budgets
- A/B testing framework
- Internationalization (i18n)

### Architectural Decisions
- **No Framework** - Keeps bundle size minimal, reduces complexity
- **No Backend** - Eliminates server costs, scales infinitely
- **No Build Step** - Simplifies development, faster iteration
- **PWA First** - Offline support, installable, app-like experience

## Technical Debt

### Current Limitations
- Manual asset optimization
- No automated testing
- No TypeScript
- Inconsistent game architectures
- Limited error handling

### Improvement Roadmap
1. Add build process (Vite/Rollup)
2. Implement automated testing
3. Standardize game architecture
4. Add TypeScript gradually
5. Improve error handling
6. Add performance monitoring

---

**Last Updated:** February 2025

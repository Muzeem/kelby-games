# Folder Structure

Complete overview of the Kelby Games project structure.

## Root Directory

```
kelby-games/
├── .git/                       # Git repository data
├── .github/                    # GitHub-specific files
│   ├── ISSUE_TEMPLATE/        # Issue templates
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── game_submission.md
│   └── pull_request_template.md
│
├── .vscode/                    # VS Code settings (optional)
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md        # Technical architecture
│   ├── DEPLOYMENT.md          # Deployment guide
│   ├── GAME_DEVELOPMENT.md    # Game development guide
│   ├── PRODUCT_DESCRIPTION.md # Product overview
│   ├── PROJECT_STATUS.md      # Current status
│   └── FOLDER_STRUCTURE.md    # This file
│
├── games/                      # All games (see below)
│
├── images/                     # Shared assets
│   ├── *-thumbnail.svg        # Game thumbnails
│   └── puzzle*.jpg            # Puzzle images
│
├── .gitignore                  # Git ignore rules
├── CHANGELOG.md               # Version history
├── CNAME                      # Custom domain config
├── CODE_OF_CONDUCT.md         # Community guidelines
├── CONTRIBUTING.md            # Contribution guide
├── icon-192.png               # Portal icon
├── icon-512.png               # Portal icon
├── index.html                 # Portal homepage
├── LICENSE                    # MIT License
├── manifest.json              # Portal PWA manifest
├── portal-script.js           # Portal JavaScript
├── portal-style.css           # Portal styling
├── privacy-policy.html        # Privacy policy
├── README.md                  # Main documentation
├── SECURITY.md                # Security policy
└── service-worker.js          # Portal service worker
```

## Games Directory

```
games/
├── 06-Tower-Blocks/
│   ├── icons/
│   │   └── icon-512.png
│   ├── index.html
│   ├── manifest.json
│   ├── script.js
│   ├── style.css
│   └── sw.js
│
├── 17-Typing-Game/
│   ├── icons/
│   │   └── icon-512.png
│   ├── index.html
│   ├── manifest.json
│   ├── script.js
│   ├── style.css
│   └── sw.js
│
├── 19-Flappy-Bird-Game/
│   ├── icons/
│   │   └── icon-512.png
│   ├── index.html
│   ├── manifest.json
│   ├── script.js
│   ├── style.css
│   └── sw.js
│
├── 20-Crossy-Road-Game/
│   ├── icons/
│   │   └── icon-512.png
│   ├── index.html
│   ├── manifest.json
│   ├── script.js
│   ├── style.css
│   └── sw.js
│
├── 21-2048-Game/
│   ├── icons/
│   │   └── icon-512.png
│   ├── index.html
│   ├── manifest.json
│   ├── script.js
│   ├── style.css
│   └── sw.js
│
├── 29-Whack-A-Mole-Game/
│   ├── icons/
│   │   └── ChatGPT Image Feb 5, 2026, 11_03_34 PM.png
│   ├── index.html
│   ├── manifest.json
│   ├── script.js
│   ├── style.css
│   └── sw.js
│
├── dreamers-puzzle/           # Featured PWA game
│   ├── icons/                 # 10 icon sizes
│   │   ├── icon-16.png
│   │   ├── icon-32.png
│   │   ├── icon-72.png
│   │   ├── icon-96.png
│   │   ├── icon-128.png
│   │   ├── icon-144.png
│   │   ├── icon-152.png
│   │   ├── icon-192.png
│   │   ├── icon-384.png
│   │   ├── icon-512.png
│   │   └── README.md
│   ├── images/                # Historical images
│   │   ├── dream-speech.jpg
│   │   ├── first-step.jpg
│   │   ├── light-bulb.jpg
│   │   ├── moon-landing.jpg
│   │   ├── radium.jpg
│   │   ├── salt-march.jpg
│   │   ├── wright-brothers.jpg
│   │   └── IMAGE-SOURCES.md
│   ├── sounds/                # Audio files
│   │   ├── background.mp3
│   │   ├── celebration.mp3
│   │   ├── README.md
│   │   └── SOUND-INFO.md
│   ├── app.js                 # Main game logic
│   ├── index.html
│   ├── manifest.json
│   ├── offline.html           # Offline fallback
│   ├── puzzles-data.js        # Puzzle definitions
│   ├── styles.css
│   └── sw.js                  # Service worker
│
├── hangman/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── icon.svg
│   ├── index.html
│   ├── manifest.json
│   ├── script.js
│   ├── styles.css
│   └── sw.js
│
├── jigsaw-puzzle/
│   ├── icons/                 # Empty (needs icons)
│   ├── index.html
│   ├── jigsaw-script.js
│   ├── jigsaw-script-optimized.js
│   ├── manifest.json
│   └── styles.css
│
├── life-simulator/
│   ├── icons/                 # Empty (needs icons)
│   ├── index.html
│   ├── manifest.json
│   ├── script.js
│   └── styles.css
│
├── memory-match/
│   ├── icons/                 # Empty (needs icons)
│   ├── index.html
│   ├── manifest.json
│   ├── script.js
│   └── styles.css
│
└── tic-tac-toe/
    ├── icons/                 # Empty (needs icons)
    ├── index.html
    ├── manifest.json
    ├── script.js
    └── styles.css
```

## File Descriptions

### Root Files

| File | Purpose |
|------|---------|
| `.gitignore` | Specifies files Git should ignore |
| `CHANGELOG.md` | Version history and release notes |
| `CNAME` | Custom domain configuration for GitHub Pages |
| `CODE_OF_CONDUCT.md` | Community behavior guidelines |
| `CONTRIBUTING.md` | How to contribute to the project |
| `LICENSE` | MIT License terms |
| `README.md` | Main project documentation |
| `SECURITY.md` | Security policy and reporting |
| `index.html` | Portal homepage |
| `manifest.json` | Portal PWA manifest |
| `portal-script.js` | Portal JavaScript functionality |
| `portal-style.css` | Portal styling |
| `privacy-policy.html` | Privacy policy page |
| `service-worker.js` | Portal service worker for offline support |

### Documentation Files

| File | Purpose |
|------|---------|
| `docs/ARCHITECTURE.md` | Technical architecture and design decisions |
| `docs/DEPLOYMENT.md` | Deployment instructions for various platforms |
| `docs/GAME_DEVELOPMENT.md` | Guide for creating new games |
| `docs/PRODUCT_DESCRIPTION.md` | Detailed product overview |
| `docs/PROJECT_STATUS.md` | Current status of all features |
| `docs/FOLDER_STRUCTURE.md` | This file - project structure overview |

### Game Files

Each game typically includes:

| File | Purpose |
|------|---------|
| `index.html` | Game entry point |
| `script.js` | Game logic |
| `styles.css` | Game styling |
| `manifest.json` | PWA manifest |
| `sw.js` | Service worker (optional) |
| `icons/` | App icons (192px, 512px) |

## Naming Conventions

### Files
- HTML: `index.html`, `offline.html`
- CSS: `styles.css`, `style.css`, `portal-style.css`
- JavaScript: `script.js`, `app.js`, `portal-script.js`
- Manifests: `manifest.json`
- Service Workers: `sw.js`, `service-worker.js`

### Folders
- Games: `kebab-case` (e.g., `dreamers-puzzle`, `memory-match`)
- Some legacy games use numbers: `06-Tower-Blocks`, `21-2048-Game`
- Assets: `icons/`, `images/`, `sounds/`

### Images
- Icons: `icon-{size}.png` (e.g., `icon-192.png`, `icon-512.png`)
- Thumbnails: `{game-name}-thumbnail.svg`
- Game assets: Descriptive names (e.g., `dream-speech.jpg`)

## Size Guidelines

### Recommended Sizes
- **Total game size:** < 500KB
- **Individual images:** < 100KB
- **Icons:** 192x192px and 512x512px (required for PWA)
- **Thumbnails:** SVG preferred, or optimized PNG

### Current Sizes
- Portal: ~50KB (HTML + CSS + JS)
- Average game: 100-300KB
- Dreamers Puzzle: ~2MB (includes 7 images + audio)

## Asset Organization

### Icons
- Portal icons in root: `icon-192.png`, `icon-512.png`
- Game icons in `games/{game-name}/icons/`
- Multiple sizes for Dreamers Puzzle (16px to 512px)

### Images
- Shared images in `/images/`
- Game-specific images in `games/{game-name}/images/`
- Thumbnails for portal in `/images/`

### Audio
- Only Dreamers Puzzle has audio
- Located in `games/dreamers-puzzle/sounds/`

## Documentation Organization

### User-Facing
- `README.md` - First thing visitors see
- `CONTRIBUTING.md` - How to contribute
- `CODE_OF_CONDUCT.md` - Community guidelines
- `privacy-policy.html` - Privacy policy

### Developer-Facing
- `docs/ARCHITECTURE.md` - Technical details
- `docs/DEPLOYMENT.md` - Deployment guide
- `docs/GAME_DEVELOPMENT.md` - Game creation guide
- `SECURITY.md` - Security policy

### Project Management
- `CHANGELOG.md` - Version history
- `docs/PROJECT_STATUS.md` - Current status
- `docs/FOLDER_STRUCTURE.md` - This file

## GitHub-Specific Files

### Issue Templates
- `.github/ISSUE_TEMPLATE/bug_report.md`
- `.github/ISSUE_TEMPLATE/feature_request.md`
- `.github/ISSUE_TEMPLATE/game_submission.md`

### PR Template
- `.github/pull_request_template.md`

## Future Structure

### Planned Additions
```
├── tests/                     # Automated tests
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                   # Build/deployment scripts
│   ├── build.js
│   ├── deploy.js
│   └── optimize-images.js
│
├── .github/workflows/         # GitHub Actions
│   ├── ci.yml
│   ├── deploy.yml
│   └── lighthouse.yml
│
└── dist/                      # Build output (if build process added)
```

## Best Practices

### Adding New Games
1. Create folder in `games/` with kebab-case name
2. Include all required files (index.html, script.js, styles.css, manifest.json)
3. Add icons folder with 192px and 512px icons
4. Update portal `index.html` to include game
5. Add thumbnail to `/images/`
6. Update documentation

### Organizing Assets
- Keep game assets within game folder
- Use shared assets only for portal
- Optimize all images before committing
- Use SVG for thumbnails when possible

### Documentation
- Update `CHANGELOG.md` for all changes
- Keep `PROJECT_STATUS.md` current
- Document new features in relevant docs
- Update README for major changes

---

**Last Updated:** February 6, 2025

# Quick Start Guide

Get Kelby Games running locally in under 2 minutes!

## Prerequisites

You need ONE of the following:
- Python (any version)
- Node.js
- PHP
- Any static file server

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kelby-games.git
cd kelby-games
```

### 2. Start a Local Server

Choose your preferred method:

#### Option A: Python 3
```bash
python -m http.server 8000
```

#### Option B: Python 2
```bash
python -m SimpleHTTPServer 8000
```

#### Option C: Node.js (npx)
```bash
npx serve .
```

#### Option D: Node.js (http-server)
```bash
npm install -g http-server
http-server -p 8000
```

#### Option E: PHP
```bash
php -S localhost:8000
```

### 3. Open in Browser

```
http://localhost:8000
```

That's it! 🎉

## What You'll See

- **Portal Homepage** - Grid of 12 games
- **Click any game** - Instant play, no loading
- **Mobile Responsive** - Works on any device
- **No Build Required** - Pure HTML/CSS/JS

## Project Structure

```
kelby-games/
├── index.html          # Portal homepage (start here)
├── games/              # All 12 games
│   ├── dreamers-puzzle/
│   ├── hangman/
│   ├── jigsaw-puzzle/
│   └── ... (9 more games)
├── images/             # Shared assets
└── docs/               # Documentation
```

## Next Steps

### For Players
- Just play! No setup needed
- Install as PWA (optional)
- Works offline (some games)

### For Developers
1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Check [docs/GAME_DEVELOPMENT.md](docs/GAME_DEVELOPMENT.md)
3. Explore the code
4. Make improvements
5. Submit a PR

### For Deployers
1. Read [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
2. Choose hosting (GitHub Pages, Netlify, Vercel)
3. Push to Git
4. Auto-deploy!

## Common Issues

### Port Already in Use
Change the port number:
```bash
python -m http.server 3000
```

### CORS Errors
Use a proper server (not `file://` protocol)

### Service Worker Not Working
Service workers require HTTPS or localhost

### Games Not Loading
Check browser console for errors

## Testing

### Desktop Browsers
- Chrome: ✅ Works
- Firefox: ✅ Works
- Safari: ✅ Works
- Edge: ✅ Works

### Mobile Browsers
- iOS Safari: ✅ Works
- Chrome Android: ✅ Works

### Features to Test
- [ ] Portal loads
- [ ] All game links work
- [ ] Games are playable
- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] PWA installation (Dreamers Puzzle)

## Development Workflow

### 1. Make Changes
Edit HTML/CSS/JS files directly

### 2. Refresh Browser
No build step needed!

### 3. Test
Check in multiple browsers

### 4. Commit
```bash
git add .
git commit -m "Your changes"
git push
```

## Useful Commands

### Check File Sizes
```bash
# Linux/Mac
du -sh games/*

# Windows PowerShell
Get-ChildItem games -Recurse | Measure-Object -Property Length -Sum
```

### Find Large Files
```bash
# Linux/Mac
find . -type f -size +100k

# Windows PowerShell
Get-ChildItem -Recurse | Where-Object {$_.Length -gt 100KB}
```

### Validate HTML
Use [W3C Validator](https://validator.w3.org/)

### Test Accessibility
Use [WAVE Tool](https://wave.webaim.org/)

## Resources

- [README.md](README.md) - Full documentation
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Technical details
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment guide
- [docs/GAME_DEVELOPMENT.md](docs/GAME_DEVELOPMENT.md) - Create games

## Support

- 🐛 **Bugs:** [GitHub Issues](https://github.com/yourusername/kelby-games/issues)
- 💬 **Questions:** [GitHub Discussions](https://github.com/yourusername/kelby-games/discussions)
- 📧 **Email:** support@kelby.in

## Tips

### Speed Up Development
- Use browser DevTools
- Enable auto-refresh extension
- Use VS Code Live Server

### Optimize Images
```bash
# Install ImageMagick
convert input.png -resize 512x512 -quality 85 output.png
```

### Check Performance
- Open Chrome DevTools
- Go to Lighthouse tab
- Run audit

### Debug Service Workers
- Chrome: `chrome://serviceworker-internals/`
- Firefox: `about:debugging#/runtime/this-firefox`

## Quick Reference

### File Locations
- Portal: `index.html`
- Games: `games/*/index.html`
- Styles: `portal-style.css`, `games/*/styles.css`
- Scripts: `portal-script.js`, `games/*/script.js`

### Important URLs
- Portal: `/`
- Privacy: `/privacy-policy.html`
- Game: `/games/{game-name}/`

### Key Concepts
- **No Build:** Edit and refresh
- **No Dependencies:** Pure web tech
- **No Backend:** All client-side
- **No Tracking:** Privacy-first

---

**Happy Coding!** 🚀

Need help? Check the [full documentation](README.md) or [open an issue](https://github.com/yourusername/kelby-games/issues).

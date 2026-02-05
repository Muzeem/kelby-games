# 🎮 Kelby Games

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Premium Free Games Portal - No Ads, No Tracking, Pure Fun**

A curated collection of 12 high-quality browser games built with pure web technologies. Play instantly, no downloads required.

🌐 **Live Demo:** [https://kelby.in/](https://kelby.in/)

---

## ✨ Features

- 🎯 **12 Unique Games** - Puzzles, arcade classics, brain trainers
- 🚫 **Zero Ads** - No interruptions, ever
- 🔒 **Privacy First** - No tracking, no data collection, no cookies
- 📱 **PWA Ready** - Install on any device, works offline
- ⚡ **Lightning Fast** - Optimized for performance (Lighthouse 95+)
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🌍 **Works Everywhere** - All modern browsers, mobile & desktop

## 🕹️ Games Collection

### Featured Games

**🧩 Dreamers Puzzle** ⭐  
Contemplative jigsaw puzzles exploring pivotal moments in human history. Full PWA with offline support.
- 7 historical moments (Wright Brothers, Marie Curie, Gandhi, MLK, Moon Landing, Edison, Armstrong)
- 3 difficulty levels (12, 24, 48 pieces)
- Educational content with each puzzle

**🎯 Picture Puzzle Master**  
Classic jigsaw puzzles with beautiful imagery
- 30-piece challenges
- 5 unique images
- Drag-and-drop interface

**📝 Word Guess Pro**  
Modern take on classic hangman
- Multiple categories
- Hint system
- Progressive difficulty

### Arcade & Action

- **🐦 Flappy Bird** - Tap to fly through obstacles
- **🚗 Crossy Road** - Navigate traffic and rivers
- **🔨 Whack-a-Mole** - Classic arcade fun
- **🏗️ Tower Blocks** - Stack blocks as high as you can

### Brain Games

- **🧠 Brain Trainer** - Memory card matching
- **⭕ Tic Tac Toe Showdown** - Beat the AI
- **🔢 2048** - Merge tiles to reach 2048
- **⌨️ Speed Typer** - Test your typing speed

### Simulation

- **🎭 Life Choices** - Decision-based life simulator

## 🚀 Quick Start

### Play Online
Visit [https://kelby.in/](https://kelby.in/) and start playing instantly!

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/kelby-games.git
   cd kelby-games
   ```

2. **Start a local server**
   
   Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Using Node.js:
   ```bash
   npx serve .
   ```
   
   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

That's it! No build process, no dependencies to install.

## 📁 Project Structure

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
│   ├── 21-2048-Game/
│   ├── 17-Typing-Game/
│   ├── 19-Flappy-Bird-Game/
│   ├── 20-Crossy-Road-Game/
│   ├── 29-Whack-A-Mole-Game/
│   └── 06-Tower-Blocks/
│
├── images/                 # Shared assets
├── icons/                  # Portal icons
│
└── docs/                   # Documentation
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    └── GAME_DEVELOPMENT.md
```

## 🛠️ Tech Stack

- **Frontend:** Pure HTML5, CSS3, JavaScript (ES6+)
- **Graphics:** Canvas API for game rendering
- **Offline:** Service Workers for PWA functionality
- **Storage:** LocalStorage for game state
- **No Frameworks:** Zero dependencies, lightweight and fast

## 📊 Performance

- ⚡ Lighthouse Score: 95+
- 🚀 First Contentful Paint: < 1s
- ⏱️ Time to Interactive: < 2s
- 📦 Total Bundle Size: < 500KB per game

## 🤝 Contributing

We welcome contributions! Whether it's bug fixes, new games, or improvements.

1. Read our [Contributing Guide](CONTRIBUTING.md)
2. Check out [Game Development Guide](docs/GAME_DEVELOPMENT.md)
3. Fork the repo and create a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📖 Documentation

- [Architecture Overview](docs/ARCHITECTURE.md) - Technical architecture and design decisions
- [Deployment Guide](docs/DEPLOYMENT.md) - How to deploy to various platforms
- [Game Development](docs/GAME_DEVELOPMENT.md) - Guide for creating new games

## 🚀 Deployment

### Quick Deploy

**GitHub Pages:**
```bash
# Enable GitHub Pages in repository settings
# Set source to main branch, root folder
```

**Netlify:**
```bash
# Connect repository to Netlify
# Build command: (leave empty)
# Publish directory: .
```

**Vercel:**
```bash
# Import project from GitHub
# Framework: Other
# Build command: (leave empty)
```

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 🔒 Privacy & Security

- ✅ HTTPS only
- ✅ No cookies
- ✅ No third-party scripts
- ✅ No analytics or tracking
- ✅ No data collection
- ✅ GDPR, CCPA, COPPA compliant

Read our [Privacy Policy](privacy-policy.html)

## 📱 Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Firefox | 88+     |
| Safari  | 14+     |
| Edge    | 90+     |

Mobile browsers (iOS Safari, Chrome Android) fully supported.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Game concepts inspired by classic arcade and puzzle games
- Historical images for Dreamers Puzzle from public domain sources
- Icons and graphics created specifically for this project

## 📞 Contact & Support

- 🌐 Website: [https://kelby.in/](https://kelby.in/)
- 📧 Email: support@kelby.in
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/kelby-games/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/kelby-games/discussions)

## 🗺️ Roadmap

- [ ] Add 10+ more games
- [ ] Implement leaderboards (privacy-respecting)
- [ ] Add multiplayer support
- [ ] Create mobile apps (iOS, Android)
- [ ] Add internationalization (i18n)
- [ ] Implement achievement system
- [ ] Add daily challenges

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ for gamers who value quality over quantity**

Made with pure web technologies - no frameworks, no bloat, just great games.

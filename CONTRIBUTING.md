# Contributing to Kelby Games

Thanks for your interest in contributing! This project is a curated collection of browser games focused on quality, privacy, and performance.

## 🎯 Project Philosophy

- **No Ads, Ever** - User experience comes first
- **Privacy First** - No tracking, no data collection
- **Performance Matters** - Fast, lightweight, accessible
- **Pure Web Tech** - No frameworks, minimal dependencies

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (Python, Node.js, or any static server)
- Basic knowledge of HTML, CSS, and JavaScript

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

## 📝 How to Contribute

### Reporting Bugs
- Use GitHub Issues
- Include browser version and OS
- Provide steps to reproduce
- Include screenshots if relevant

### Suggesting Features
- Open a GitHub Issue with the "enhancement" label
- Explain the use case
- Consider how it aligns with project philosophy

### Submitting Code

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow existing code style
   - Test in multiple browsers
   - Keep changes focused and atomic

4. **Test thoroughly**
   - Desktop browsers (Chrome, Firefox, Safari, Edge)
   - Mobile browsers (iOS Safari, Chrome Android)
   - Different screen sizes
   - Offline functionality (for PWA games)

5. **Commit with clear messages**
   ```bash
   git commit -m "Add: Brief description of changes"
   ```

6. **Push and create Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🎮 Adding a New Game

### Game Requirements
- Pure HTML/CSS/JavaScript (no frameworks)
- Mobile responsive
- Accessible (WCAG 2.1 AA)
- No external dependencies
- File size < 500KB total
- Works offline (PWA preferred)

### Game Structure
```
games/your-game-name/
├── index.html          # Main game file
├── script.js           # Game logic
├── styles.css          # Game styling
├── manifest.json       # PWA manifest
├── sw.js              # Service worker (optional)
└── icons/             # Game icons
    ├── icon-192.png
    └── icon-512.png
```

### Game Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Game Name - Kelby Games</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="manifest" href="manifest.json">
</head>
<body>
    <!-- Your game content -->
    
    <footer>
        <a href="/">← Back to Games</a>
    </footer>
    
    <script src="script.js"></script>
</body>
</html>
```

### Adding to Portal
Update `index.html` to include your game:
```html
<a href="games/your-game-name/" class="game-link">
    <img src="games/your-game-name/icons/icon-512.png" alt="Your Game">
    <span>Your Game Name</span>
    <small>Brief description</small>
</a>
```

## 🎨 Code Style

### HTML
- Use semantic HTML5 elements
- Include proper ARIA labels
- Validate with W3C validator

### CSS
- Use CSS custom properties for theming
- Mobile-first responsive design
- Avoid !important
- Keep specificity low

### JavaScript
- Use ES6+ features
- Avoid global variables
- Comment complex logic
- Handle errors gracefully
- No console.log in production

### File Naming
- Use kebab-case: `my-game-name`
- Lowercase only
- No spaces or special characters

## ✅ Pull Request Checklist

- [ ] Code follows project style
- [ ] Tested in Chrome, Firefox, Safari
- [ ] Tested on mobile devices
- [ ] No console errors
- [ ] Accessible (keyboard navigation, screen readers)
- [ ] Responsive design
- [ ] No external dependencies added
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear

## 🔍 Code Review Process

1. Automated checks (if any)
2. Manual code review
3. Testing in multiple browsers
4. Performance check
5. Accessibility audit
6. Merge or request changes

## 📚 Resources

- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev](https://web.dev/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 💬 Questions?

- Open a GitHub Issue
- Email: support@kelby.in

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for helping make Kelby Games better!** 🎮

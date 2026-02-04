// Simple portal script for Kelby Games
document.addEventListener('DOMContentLoaded', () => {
    console.log('Kelby Games Portal loaded');
    
    // Add click tracking for analytics (optional)
    const gameLinks = document.querySelectorAll('.game-link');
    gameLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const gameName = link.querySelector('span').textContent;
            console.log(`Game clicked: ${gameName}`);
        });
    });
});

// Service Worker registration for portal
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Portal Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

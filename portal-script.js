// Kelby Games Portal
document.addEventListener('DOMContentLoaded', () => {
    // Subtle fade-in for game cards on scroll
    const cards = document.querySelectorAll('.game-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.style.transitionDelay = `${index * 0.1}s`;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Smooth nav background on scroll
    const nav = document.querySelector('.top-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.style.borderBottomColor = '#333';
        } else {
            nav.style.borderBottomColor = '#222';
        }
    });
});

// Visible class handler
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `.game-card.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);
});

// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => {})
            .catch(() => {});
    });
}

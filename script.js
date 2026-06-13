// ===== ANIMATED SMOKE BACKGROUND =====
(function () {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];

    function resize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.2;
            this.r = Math.random() * 280 + 120;
            this.alpha = Math.random() * 0.12 + 0.03;
            this.phase = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 0.005 + 0.003;
        }

        update() {
            this.phase += this.speed;
            this.x += this.vx + Math.sin(this.phase * 0.7) * 0.4;
            this.y += this.vy + Math.cos(this.phase * 0.5) * 0.3;

            if (this.x < -this.r * 2 || this.x > W + this.r * 2 ||
                this.y < -this.r * 2 || this.y > H + this.r * 2) {
                this.reset();
            }
        }

        draw() {
            const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
            g.addColorStop(0, `rgba(200, 200, 210, ${this.alpha})`);
            g.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = g;
            ctx.fill();
        }
    }

    // Create particles
    for (let i = 0; i < 12; i++) {
        particles.push(new Particle());
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(loop);
    }

    loop();
})();

// ===== SCROLL REVEAL ANIMATION =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) {
            e.target.classList.add('visible');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ===== HORIZONTAL SLIDER =====
(function () {
    const track = document.getElementById('slider-track');
    const cards = track.querySelectorAll('.slide-card');
    let idx = 0;

    function getVisible() {
        if (window.innerWidth < 600) return 1;
        if (window.innerWidth < 900) return 2;
        return 4;
    }

    function update() {
        const visible = getVisible();
        const cardW = track.parentElement.offsetWidth / visible;
        const gap = 16;
        track.style.transform = `translateX(-${idx * (cardW + gap)}px)`;
    }

    document.getElementById('next-btn').addEventListener('click', () => {
        const visible = getVisible();
        if (idx < cards.length - visible) {
            idx++;
        } else {
            idx = 0;
        }
        update();
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        const visible = getVisible();
        if (idx > 0) {
            idx--;
        } else {
            idx = cards.length - visible;
        }
        update();
    });

    // Touch support for slider
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        const visible = getVisible();

        if (Math.abs(diff) > 50) {
            if (diff > 0 && idx < cards.length - visible) {
                idx++;
            } else if (diff < 0 && idx > 0) {
                idx--;
            }
            update();
        }
    });

    window.addEventListener('resize', update);
    update();
})();

// ===== FAQ ACCORDION =====
function toggleFaq(el) {
    const item = el.parentElement;
    const isOpen = item.classList.contains('open');

    // Close all items
    document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });

    // Open clicked item if it wasn't already open
    if (!isOpen) {
        item.classList.add('open');
        el.setAttribute('aria-expanded', 'true');
    }
}

// ===== KEYBOARD SUPPORT FOR FAQ =====
document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFaq(q);
        }
    });
});

// ===== NAVIGATION SCROLL EFFECT =====
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 60) {
        nav.style.background = 'rgba(8, 8, 8, 0.92)';
    } else {
        nav.style.background = 'rgba(8, 8, 8, 0.75)';
    }
});

// ===== MOBILE MENU TOGGLE =====
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        mobileMenuToggle.setAttribute('aria-expanded', isActive);
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== PERFORMANCE: PAUSE MARQUEE WHEN NOT VISIBLE =====
const marqueeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const tracks = entry.target.querySelectorAll('.marquee-track');
        tracks.forEach(track => {
            track.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
    });
}, { threshold: 0.1 });

document.querySelectorAll('.marquee-wrap').forEach(wrap => marqueeObserver.observe(wrap));

// ===== SERVICE WORKER REGISTRATION (PWA) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swCode = `
            const CACHE_NAME = 'nexusai-v1';
            const urlsToCache = [
                '/',
                '/index.html'
            ];
            
            self.addEventListener('install', event => {
                event.waitUntil(
                    caches.open(CACHE_NAME)
                        .then(cache => cache.addAll(urlsToCache))
                );
            });
            
            self.addEventListener('fetch', event => {
                event.respondWith(
                    caches.match(event.request)
                        .then(response => response || fetch(event.request))
                );
            });
        `;

        const blob = new Blob([swCode], { type: 'application/javascript' });
        const swUrl = URL.createObjectURL(blob);

        navigator.serviceWorker.register(swUrl)
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

console.log('🚀 NexusAI — Enterprise AI Solutions');
console.log('✅ All systems initialized successfully');
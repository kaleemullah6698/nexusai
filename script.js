// Clear service workers and caches to prevent caching issues during updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
        for(let registration of registrations) {
            registration.unregister();
        }
    });
}
if ('caches' in window) {
    caches.keys().then(function(names) {
        for (let name of names) caches.delete(name);
    });
}

// ===== SCROLL REVEAL ANIMATION (unchanged) =====
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

// ===== HORIZONTAL SLIDER (unchanged) =====
(function () {
    const track = document.getElementById('slider-track');
    if (!track) return;
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

// ===== FAQ ACCORDION (unchanged) =====
function toggleFaq(el) {
    const item = el.parentElement;
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-item.open').forEach(i => {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
        item.classList.add('open');
        el.setAttribute('aria-expanded', 'true');
    }
}

document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFaq(q);
        }
    });
});

// ===== NAVIGATION SCROLL EFFECT (unchanged) =====
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (window.scrollY > 60) {
        nav.style.background = 'rgba(8, 8, 8, 0.92)';
    } else {
        nav.style.background = 'rgba(8, 8, 8, 0.75)';
    }
});

// ===== MOBILE MENU TOGGLE (unchanged) =====
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        mobileMenuToggle.setAttribute('aria-expanded', isActive);
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// ===== SMOOTH SCROLL FOR ALL ANCHOR LINKS (unchanged) =====
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

// ===== PERFORMANCE: PAUSE MARQUEE WHEN NOT VISIBLE (unchanged) =====
const marqueeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const tracks = entry.target.querySelectorAll('.marquee-track');
        tracks.forEach(track => {
            track.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
    });
}, { threshold: 0.1 });

document.querySelectorAll('.marquee-wrap').forEach(wrap => marqueeObserver.observe(wrap));

// ===== SERVICE WORKER REGISTRATION (PWA) (unchanged) =====
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

// ===== 3D RIBBON ANIMATION (UPDATED – enhanced visibility + cyan tint) =====
(function () {
    const canvas = document.getElementById('fx');
    if (!canvas) {
        console.warn('[Ribbon] Canvas #fx not found');
        return;
    }
    const ctx = canvas.getContext('2d', { alpha: true });
    let W = 0, H = 0, DPR = 1;

    function resize() {
        DPR = Math.min(window.devicePixelRatio || 1, 1.6);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = Math.round(W * DPR);
        canvas.height = Math.round(H * DPR);
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();

    console.log('[Ribbon] Initialized on', W, 'x', H);

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    function lerp(a, b, t) {
        return a + (b - a) * t;
    }
    function hash(x, y, z) {
        let n = x * 374761393 + y * 668265263 + z * 2147483647;
        n = (n ^ (n >> 13)) * 1274126177;
        return ((n ^ (n >> 16)) >>> 0) / 4294967295;
    }
    function noise3(x, y, z) {
        const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
        const xf = x - X, yf = y - Y, zf = z - Z;
        const u = fade(xf), v = fade(yf), w = fade(zf);
        const n000 = hash(X, Y, Z), n100 = hash(X + 1, Y, Z);
        const n010 = hash(X, Y + 1, Z), n110 = hash(X + 1, Y + 1, Z);
        const n001 = hash(X, Y, Z + 1), n101 = hash(X + 1, Y, Z + 1);
        const n011 = hash(X, Y + 1, Z + 1), n111 = hash(X + 1, Y + 1, Z + 1);
        const x00 = lerp(n000, n100, u), x10 = lerp(n010, n110, u);
        const x01 = lerp(n001, n101, u), x11 = lerp(n011, n111, u);
        const y0 = lerp(x00, x10, v), y1 = lerp(x01, x11, v);
        return lerp(y0, y1, w) * 2 - 1;
    }
    function fbm(x, y, z) {
        let v = 0;
        let a = 0.58;
        let f = 1;
        for (let i = 0; i < 4; i++) {
            v += noise3(x * f, y * f, z * f) * a;
            f *= 2;
            a *= 0.5;
        }
        return v;
    }
    function gauss(x, mu, sigma) {
        const d = x - mu;
        return Math.exp(-(d * d) / (2 * sigma * sigma));
    }

    const ribbons = [
        {
            baseY: 0.24,
            thickness: 0.17,
            amp1: 0.040,
            amp2: 0.026,
            seed: 2.7,
            speed: 0.032,
            drift: 0.025,
            peaks: [
                { pos: 0.18, amp: -0.09, width: 0.08 },
                { pos: 0.48, amp: 0.10, width: 0.11 },
                { pos: 0.76, amp: -0.06, width: 0.09 }
            ]
        },
        {
            baseY: 0.70,
            thickness: 0.18,
            amp1: 0.050,
            amp2: 0.028,
            seed: 8.9,
            speed: 0.030,
            drift: 0.020,
            peaks: [
                { pos: 0.14, amp: 0.07, width: 0.09 },
                { pos: 0.53, amp: -0.11, width: 0.12 },
                { pos: 0.82, amp: 0.08, width: 0.09 }
            ]
        }
    ];

    function ridgeY(x, r, t) {
        const nx = x / Math.max(W, 1);
        const flow = nx - t * r.drift;

        let y = H * r.baseY;
        y += Math.sin(flow * Math.PI * 2.1 + r.seed + t * r.speed) * H * r.amp1;
        y += Math.sin(flow * Math.PI * 4.2 - r.seed * 0.4 + t * r.speed * 1.2) * H * r.amp2;
        y += fbm(flow * 1.7 + r.seed, r.seed * 0.13, t * r.speed * 0.7) * H * 0.030;

        for (const p of r.peaks) {
            const movingPos = p.pos + Math.sin(t * r.speed * 0.6 + p.pos * 6.0) * 0.015;
            y += gauss(nx, movingPos, p.width) * H * p.amp;
        }

        return y;
    }

    function localThickness(x, r, t) {
        const nx = x / Math.max(W, 1);
        const core = H * r.thickness;
        const mod = 0.78 + Math.abs(Math.sin(nx * Math.PI * 2.0 + r.seed + t * 0.15)) * 0.20;
        const centerBoost = 1 + gauss(nx, 0.50, 0.20) * 0.30;
        return core * mod * centerBoost;
    }

    function drawRibbon(r, t) {
        const step = 14;
        const top = [];
        const bottom = [];
        const center = [];

        for (let x = -120; x <= W + 120; x += step) {
            const y = ridgeY(x, r, t);
            const thick = localThickness(x, r, t);
            const edgeWobble = fbm(x * 0.008, r.seed * 2.3, t * 0.05) * 8;

            top.push({ x, y: y - thick * (0.50 + fbm(x * 0.002, 3.2, t * 0.03) * 0.04) + edgeWobble });
            bottom.push({ x, y: y + thick * (0.50 + fbm(x * 0.0025, 8.7, t * 0.03) * 0.04) - edgeWobble });
            center.push({ x, y });
        }

        // wide soft body
        fillClosedPath(top, bottom, 'rgba(255,255,255,0.070)', 56, 'lighter');
        // mid body
        fillClosedPath(offsetBand(center, r, t, 0.66), offsetBand(center, r, t, -0.66), 'rgba(255,255,255,0.105)', 34, 'lighter');
        // inner bright body
        fillClosedPath(offsetBand(center, r, t, 0.36), offsetBand(center, r, t, -0.36), 'rgba(255,255,255,0.135)', 18, 'lighter');

        // center highlight line
        strokeSmooth(center, 6.5, 'rgba(255,255,255,0.16)', 11, 'lighter');
        strokeSmooth(center, 2.4, 'rgba(255,255,255,0.30)', 3.2, 'lighter');

        // top crest / inner mountain fold
        const crest = center.map((p, i) => {
            const nx = p.x / Math.max(W, 1);
            const fold = gauss(nx, 0.50, 0.18) * H * 0.04 + Math.sin(nx * Math.PI * 3.1 + t * 0.16 + r.seed) * H * 0.012;
            return { x: p.x, y: p.y - fold };
        });
        strokeSmooth(crest, 1.5, 'rgba(255,255,255,0.25)', 7, 'lighter');
    }

    function offsetBand(center, r, t, factor) {
        return center.map((p) => {
            const thick = localThickness(p.x, r, t);
            const dir = Math.sign(factor);
            const mag = Math.abs(factor);
            return { x: p.x, y: p.y + dir * thick * 0.5 * mag };
        });
    }

    function fillClosedPath(top, bottom, fill, blur, comp) {
        ctx.save();
        ctx.globalCompositeOperation = comp || 'source-over';
        ctx.filter = `blur(${blur}px)`;
        ctx.fillStyle = fill;
        ctx.beginPath();
        smoothPath(top, true);
        const rev = bottom.slice().reverse();
        smoothPath(rev, false);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function strokeSmooth(points, width, stroke, blur, comp) {
        ctx.save();
        ctx.globalCompositeOperation = comp || 'source-over';
        ctx.filter = `blur(${blur}px)`;
        ctx.strokeStyle = stroke;
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        smoothPath(points, true);
        ctx.stroke();
        ctx.restore();
    }

    function smoothPath(points, move) {
        if (!points.length) return;
        if (move) ctx.moveTo(points[0].x, points[0].y);
        else ctx.lineTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        const last = points[points.length - 1];
        ctx.lineTo(last.x, last.y);
    }

    function glowBlob(x, y, rx, ry, alpha, blur) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.filter = `blur(${blur}px)`;
        ctx.translate(x, y);
        ctx.scale(rx, ry);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        g.addColorStop(0.00, `rgba(255,255,255,${alpha})`);
        g.addColorStop(0.35, `rgba(255,255,255,${alpha * 0.38})`);
        g.addColorStop(1.00, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawAmbient(t) {
        // very soft center light to help the middle look brighter
        glowBlob(W * 0.48, H * 0.38, 300, 88, 0.05, 22);
        glowBlob(W * 0.52, H * 0.60, 340, 94, 0.05, 26);

        // side curtain-like smoke hints
        glowBlob(W * 0.08, H * 0.26, 90, 220, 0.035, 30);
        glowBlob(W * 0.92, H * 0.72, 90, 220, 0.03, 32);

        // left-to-right drifting soft lights
        for (let i = 0; i < 4; i++) {
            const x = ((0.14 + i * 0.22 + t * 0.006) % 1.32) * (W + 260) - 130;
            const y = H * (0.38 + Math.sin(t * 0.04 + i) * 0.16);
            glowBlob(x, y, 150, 34, 0.024, 18);
        }
    }

    function render(ms) {
        const t = ms * 0.001;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);

        drawAmbient(t);
        ribbons.forEach(r => drawRibbon(r, t));

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
})();

console.log('🚀 NexusAI — Enterprise AI Solutions');
console.log('✅ All systems initialized successfully');
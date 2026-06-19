/* ===========================
   Youbi Key Solutions — JS
   =========================== */

gsap.registerPlugin(ScrollTrigger, TextPlugin);

/* ===========================
   THREE.JS HERO BACKGROUND
   =========================== */
(function initThreeBackground() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // Grid of floating dots
  const geo = new THREE.BufferGeometry();
  const count = 800;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

    const isGold = Math.random() > 0.7;
    if (isGold) {
      colors[i * 3] = 0.96; colors[i * 3 + 1] = 0.78; colors[i * 3 + 2] = 0.26;
    } else {
      colors[i * 3] = 0.11; colors[i * 3 + 1] = 0.19; colors[i * 3 + 2] = 0.42;
    }
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.6 });
  const particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // Connection lines geometry (lazy — just a subtle grid)
  const lineMat = new THREE.LineBasicMaterial({ color: 0x1e3060, transparent: true, opacity: 0.15 });
  for (let i = 0; i < 8; i++) {
    const lineGeo = new THREE.BufferGeometry();
    const pts = [
      new THREE.Vector3(-12, -6 + i * 1.8, -2),
      new THREE.Vector3(12, -6 + i * 1.8 + (Math.random()-0.5) * 2, -2)
    ];
    lineGeo.setFromPoints(pts);
    scene.add(new THREE.Line(lineGeo, lineMat));
  }

  let mouse = { x: 0, y: 0 };
  document.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 0.4;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 0.2;
  });

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame += 0.005;
    particles.rotation.y = frame * 0.05 + mouse.x * 0.3;
    particles.rotation.x = frame * 0.02 + mouse.y * 0.2;
    renderer.render(scene, camera);
  }
  animate();
})();

/* ===========================
   HERO ANIMATIONS (GSAP)
   =========================== */
const heroTl = gsap.timeline({ delay: 0.2 });

heroTl
  .to('#heroBadge', { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', from: { y: 20 } })
  .to('.hero-title .line', {
    opacity: 1, y: 0, duration: 0.65, stagger: 0.18, ease: 'power3.out',
    from: { y: 40 }
  }, '-=0.3')
  .to('#heroSubtitle', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', from: { y: 20 } }, '-=0.2')
  .to('#heroButtons', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', from: { y: 20 } }, '-=0.2')
  .to('#heroStats', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', from: { y: 20 } }, '-=0.2')
  .to('#heroVisual', { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', from: { x: 60 } }, '-=0.5');

// Initial states
gsap.set('#heroBadge', { y: 20 });
gsap.set('.hero-title .line', { y: 40 });
gsap.set('#heroSubtitle', { y: 20 });
gsap.set('#heroButtons', { y: 20 });
gsap.set('#heroStats', { y: 20 });
gsap.set('#heroVisual', { x: 60 });

/* ===========================
   COUNTER ANIMATION
   =========================== */
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    gsap.to({ val: 0 }, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate() { el.textContent = Math.round(this.targets()[0].val); }
    });
  });
}
animateCounters();

/* ===========================
   SCROLL REVEAL (GSAP + ScrollTrigger)
   =========================== */
function scrollReveal(selector, fromVars = {}, opts = {}) {
  gsap.utils.toArray(selector).forEach((el, i) => {
    gsap.fromTo(el,
      { opacity: 0, ...fromVars },
      {
        opacity: 1, y: 0, x: 0, scale: 1, duration: 0.75,
        delay: (opts.stagger || 0) * i,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
          ...opts.trigger
        }
      }
    );
  });
}

scrollReveal('.section-header', { y: 40 });
scrollReveal('.service-card', { y: 50 }, { stagger: 0.1 });
scrollReveal('.step', { y: 40 }, { stagger: 0.15 });
scrollReveal('.price-card', { y: 40 }, { stagger: 0.1 });
scrollReveal('.review-card', { y: 40 }, { stagger: 0.12 });
scrollReveal('.group-item', { scale: 0.9 }, { stagger: 0.06 });
scrollReveal('.trust-item', { y: 20 }, { stagger: 0.08 });
scrollReveal('.contact-card', { x: -30 }, { stagger: 0.15 });
scrollReveal('.contact-form', { x: 30 });
scrollReveal('.area-map', { x: -40 });
scrollReveal('.area-info', { x: 40 });
scrollReveal('.about-visual', { x: -40 });
scrollReveal('.about-text', { x: 40 });

/* ===========================
   SERVICE CARD HOVER GLOW
   =========================== */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mx', x + 'px');
    card.style.setProperty('--my', y + 'px');
  });
});

/* ===========================
   NAVBAR SCROLL BEHAVIOR
   =========================== */
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const scroll = window.scrollY;
  if (scroll > 60) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
  lastScroll = scroll;
}, { passive: true });

/* ===========================
   MOBILE NAV TOGGLE
   =========================== */
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close nav on outside click
document.addEventListener('click', e => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ===========================
   FLOATING CTA VISIBILITY
   =========================== */
const floatingCTA = document.getElementById('floatingCTA');

ScrollTrigger.create({
  trigger: '#home',
  start: 'bottom top',
  onEnter: () => floatingCTA.classList.add('visible'),
  onLeaveBack: () => floatingCTA.classList.remove('visible')
});

/* ===========================
   PARTICLES
   =========================== */
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    const startX = Math.random() * 100;
    const duration = Math.random() * 12 + 8;
    const delay = Math.random() * 8;

    p.style.cssText = `
      width:${size}px;height:${size}px;
      left:${startX}%;bottom:-20px;
      animation-duration:${duration}s;
      animation-delay:${delay}s;
      opacity:${Math.random() * 0.5 + 0.2};
    `;
    container.appendChild(p);
  }
})();

/* ===========================
   SMOOTH ANCHOR SCROLL
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ===========================
   FORM SUBMIT (Mock)
   =========================== */
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    const orig = btn.innerHTML;
    btn.innerHTML = '✓ Anfrage gesendet!';
    btn.style.background = '#22c55e';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
    }, 3500);
  });
}

/* ===========================
   MAP ANIMATION
   =========================== */
ScrollTrigger.create({
  trigger: '#mapContainer',
  start: 'top 80%',
  once: true,
  onEnter() {
    gsap.fromTo('.munich-map circle[r="160"]',
      { strokeDasharray: '1000', strokeDashoffset: '1000' },
      { strokeDashoffset: 0, duration: 2, ease: 'power2.out' }
    );
    gsap.fromTo('.munich-map circle[r="110"]',
      { opacity: 0 }, { opacity: 1, duration: 1.5, delay: 0.5 }
    );

    gsap.utils.toArray('.munich-map circle[r="5"]').forEach((dot, i) => {
      gsap.fromTo(dot,
        { scale: 0, transformOrigin: 'center' },
        { scale: 1, duration: 0.5, delay: 0.8 + i * 0.12, ease: 'back.out(1.7)' }
      );
    });
  }
});

/* ===========================
   ACTIVE NAV LINKS (ScrollSpy)
   =========================== */
const sections = document.querySelectorAll('section[id]');

ScrollTrigger.create({
  trigger: 'body',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate() {
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top < 120 && rect.bottom > 120) {
        document.querySelectorAll('.nav-links a').forEach(a => {
          a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id);
        });
      }
    });
  }
});

/* ===========================
   BUTTON RIPPLE EFFECT
   =========================== */
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;border-radius:50%;
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      background:rgba(255,255,255,0.2);
      transform:scale(0);animation:rippleAnim 0.6s ease-out forwards;
      pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// Inject ripple keyframe
const style = document.createElement('style');
style.textContent = `@keyframes rippleAnim{to{transform:scale(2.5);opacity:0}}`;
document.head.appendChild(style);

/* ===========================
   PRICE CARD TILT EFFECT
   =========================== */
document.querySelectorAll('.price-card, .service-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    gsap.to(card, {
      rotateX: -y * 6,
      rotateY: x * 6,
      duration: 0.4,
      ease: 'power1.out',
      transformPerspective: 600
    });
  });
  card.addEventListener('mouseleave', () => {
    gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.5, ease: 'power2.out' });
  });
});

/* ===========================
   FOOTER LINK HOVER LINE
   =========================== */
document.querySelectorAll('.footer-links a, .nav-links a:not(.nav-cta)').forEach(link => {
  link.addEventListener('mouseenter', () => {
    gsap.fromTo(link, { '--line-scale': 0 }, { '--line-scale': 1, duration: 0.3 });
  });
});

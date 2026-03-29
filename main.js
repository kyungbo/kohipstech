// ===== Analytics Helper =====
function gaEvent(eventName, params) {
  if (typeof gtag === 'function') gtag('event', eventName, params);
}

// ===== Loader =====
let progress = 0;
const fill = document.getElementById('loaderFill');
const loaderInterval = setInterval(() => {
  progress += Math.random() * 25 + 5;
  if (progress >= 100) { progress = 100; clearInterval(loaderInterval); setTimeout(() => document.getElementById('loader').classList.add('hidden'), 300); }
  fill.style.width = progress + '%';
}, 180);

// ===== Custom Cursor =====
const dot = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.left = (mouseX - 4) + 'px';
  dot.style.top = (mouseY - 4) + 'px';
});

(function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = (ringX - 20) + 'px';
  ring.style.top = (ringY - 20) + 'px';
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll('a, button, .product-card, .equip-card, .service-card, .side-dot, .news-card').forEach(el => {
  el.addEventListener('mouseenter', () => ring.classList.add('hover'));
  el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
});

// ===== Navbar Scroll =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== Mobile Menu =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
window.closeMobile = function() { mobileMenu.classList.remove('open'); };

// ===== Hero Slider =====
const slides = document.querySelectorAll('.hero-slide');
const sliderDots = document.querySelectorAll('.slider-dot');
let currentSlide = 0;
let slideInterval;

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  sliderDots[currentSlide].classList.remove('active');
  currentSlide = index;
  slides[currentSlide].classList.add('active');
  sliderDots[currentSlide].classList.add('active');
}

function nextSlide() { goToSlide((currentSlide + 1) % slides.length); }
function prevSlide() { goToSlide((currentSlide - 1 + slides.length) % slides.length); }

function startSlider() {
  slideInterval = setInterval(nextSlide, 5000);
}
function resetSlider() {
  clearInterval(slideInterval);
  startSlider();
}

sliderDots.forEach((d, i) => {
  d.addEventListener('click', () => { goToSlide(i); resetSlider(); });
});
document.getElementById('heroNext').addEventListener('click', () => { nextSlide(); resetSlider(); });
document.getElementById('heroPrev').addEventListener('click', () => { prevSlide(); resetSlider(); });
startSlider();

// ===== Scroll Reveal =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Counter Animation =====
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const duration = 1500;
      const startTime = performance.now();

      function updateCounter(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOut
        const eased = 1 - Math.pow(1 - progress, 3);
        current = Math.floor(eased * target);
        el.textContent = current.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(updateCounter);
        else el.textContent = target.toLocaleString() + suffix;
      }
      requestAnimationFrame(updateCounter);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.number-value[data-count]').forEach(el => counterObserver.observe(el));

// ===== Side Dots =====
const sections = document.querySelectorAll('section[id]');
const sideDots = document.querySelectorAll('.side-dot');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      sideDots.forEach(d => d.classList.remove('active'));
      const target = document.querySelector(`.side-dot[data-target="${entry.target.id}"]`);
      if (target) target.classList.add('active');
      gaEvent('section_view', { section_id: entry.target.id });
    }
  });
}, { threshold: 0.35 });
sections.forEach(s => { if (s.id !== 'services' && s.id !== 'numbers' && s.id !== 'news') sectionObserver.observe(s); });

sideDots.forEach(d => {
  d.addEventListener('click', () => {
    document.getElementById(d.dataset.target).scrollIntoView({ behavior: 'smooth' });
  });
});

// ===== Hero Canvas =====
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.radius = Math.random() * 1.5 + 0.5;
    this.opacity = Math.random() * 0.4 + 0.1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(58, 123, 213, ${this.opacity})`;
    ctx.fill();
  }
}

for (let i = 0; i < 70; i++) particles.push(new Particle());

function drawLines() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 140) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(58, 123, 213, ${0.06 * (1 - dist / 140)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

(function animateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawLines();
  requestAnimationFrame(animateCanvas);
})();

// ===== HIP Floating Particles =====
const hipParticles = document.getElementById('hipParticles');
if (hipParticles) {
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'fp';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 6 + 5) + 's';
    p.style.animationDelay = (Math.random() * 5) + 's';
    hipParticles.appendChild(p);
  }
}

// ===== Magnetic Buttons =====
document.querySelectorAll('.magnetic').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translate(0, 0)';
  });
});

// ===== File Upload =====
const fileUpload = document.getElementById('fileUpload');
const fileInput = document.getElementById('fileInput');
if (fileUpload && fileInput) {
  fileUpload.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      fileUpload.querySelector('span').textContent = fileInput.files[0].name;
    }
  });
}

// ===== Form Submit =====
window.handleSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('.btn-primary');
  const origText = btn.textContent;

  // 폼 데이터 수집
  const inputs = form.querySelectorAll('input, textarea');
  const formData = {
    company: inputs[0]?.value || '',
    name: inputs[1]?.value || '',
    phone: inputs[2]?.value || '',
    email: inputs[3]?.value || '',
    message: inputs[4]?.value || '',
  };

  // 파일 첨부 처리
  const fileInput = form.querySelector('input[type="file"]');
  let payload;
  if (fileInput && fileInput.files.length > 0) {
    payload = new FormData();
    Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
    payload.append('file', fileInput.files[0]);
  } else {
    payload = JSON.stringify(formData);
  }

  // 전송 상태 표시
  btn.textContent = '전송 중...';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  try {
    const apiUrl = CONFIG.apiUrl(CONFIG.CONTACT_ENDPOINT);
    const headers = {};
    if (!(payload instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: payload,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    gaEvent('contact_form_submit', { has_file: !!(fileInput && fileInput.files.length > 0) });
    btn.textContent = '전송 완료!';
    btn.style.background = '#10b981';
    btn.style.opacity = '1';
    form.reset();
    // 파일 업로드 표시 초기화
    const fileUploadLabel = document.querySelector('#fileUpload span');
    if (fileUploadLabel) fileUploadLabel.textContent = '파일을 드래그하거나 클릭하여 첨부';

    setTimeout(() => {
      btn.textContent = origText;
      btn.style.background = '';
      btn.disabled = false;
    }, 2500);

  } catch (error) {
    console.error('[KOHIPS] Contact form error:', error);

    // 개발환경에서는 성공으로 시뮬레이션 (백엔드 미연결 시)
    if (CONFIG.IS_DEV) {
      console.warn('[KOHIPS] Dev mode: simulating successful submission');
      btn.textContent = '전송 완료! (dev)';
      btn.style.background = '#10b981';
      btn.style.opacity = '1';
      form.reset();
      setTimeout(() => {
        btn.textContent = origText;
        btn.style.background = '';
        btn.disabled = false;
      }, 2500);
      return;
    }

    gaEvent('contact_form_error', { error: error.message });
    btn.textContent = '전송 실패 - 다시 시도해주세요';
    btn.style.background = '#e63946';
    btn.style.opacity = '1';
    setTimeout(() => {
      btn.textContent = origText;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }
};

// ===== Parallax on Hero =====
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const activeSlide = document.querySelector('.hero-slide.active .hero-content');
  if (activeSlide && scrolled < window.innerHeight) {
    activeSlide.style.transform = `translateY(${scrolled * 0.25}px)`;
    activeSlide.style.opacity = 1 - scrolled / 700;
  }
});

// ===== Smooth anchor scrolling for nav links =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// ===== Analytics: CTA & Phone Click Tracking =====
document.querySelectorAll('.btn-primary, .btn-outline, .magnetic').forEach(btn => {
  btn.addEventListener('click', () => {
    gaEvent('cta_click', { label: btn.textContent.trim().slice(0, 50) });
  });
});

document.querySelectorAll('a[href^="tel:"], .nav-phone').forEach(el => {
  el.addEventListener('click', () => {
    gaEvent('phone_click', { phone: '053-857-3541' });
  });
});

// ===== Language Toggle (Claude API Translation) =====
(function () {
  const STORAGE_KEY = 'kohips_lang';
  const CACHE_KEY   = 'kohips_en_cache';

  // 번역 대상 선택자 — 네비, 히어로, 섹션 전체 텍스트 노드
  const TRANSLATE_SELECTOR = [
    'nav .nav-links a',
    '.hero-eyebrow', '.hero-title', '.hero-sub', '.hero-cta',
    '.section-label', '.section-title', '.section-sub',
    '.about-desc', '.feature-card', '.product-card',
    '.contact-info-item p', '.contact-info-item strong',
    '.footer-desc', '.footer-col h4', '.footer-col a',
    'h1,h2,h3,h4', 'p', 'li', 'button:not(.lang-btn)',
    'label', 'th', 'td', '.map-btn'
  ].join(',');

  let currentLang = localStorage.getItem(STORAGE_KEY) || 'ko';
  let enCache = null;  // { selector_index_key: translated_text }

  try { enCache = JSON.parse(localStorage.getItem(CACHE_KEY)); } catch(_) {}

  // 원본 한국어 텍스트 스냅샷 (최초 1회)
  let koSnapshot = null;

  function buildSnapshot() {
    const nodes = document.querySelectorAll(TRANSLATE_SELECTOR);
    const snap = {};
    nodes.forEach((el, i) => {
      const key = getKey(el, i);
      // 직접 자식 텍스트만 (자식 엘리먼트 텍스트 제외)
      const text = directText(el);
      if (text.trim()) snap[key] = text;
    });
    return snap;
  }

  function directText(el) {
    let t = '';
    el.childNodes.forEach(n => { if (n.nodeType === Node.TEXT_NODE) t += n.textContent; });
    return t;
  }

  function getKey(el, i) {
    return el.id || (el.className + '_' + i);
  }

  function applyTexts(textMap) {
    const nodes = document.querySelectorAll(TRANSLATE_SELECTOR);
    nodes.forEach((el, i) => {
      const key = getKey(el, i);
      if (textMap[key]) {
        // 텍스트 노드만 교체 (자식 태그 유지)
        el.childNodes.forEach(n => {
          if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
            n.textContent = textMap[key];
          }
        });
      }
    });
  }

  async function translateToEnglish() {
    // 캐시 있으면 즉시 사용
    if (enCache && Object.keys(enCache).length > 0) {
      applyTexts(enCache);
      return;
    }

    // 스냅샷 빌드
    if (!koSnapshot) koSnapshot = buildSnapshot();

    // 번역할 텍스트만 추출
    const entries = Object.entries(koSnapshot);
    if (!entries.length) return;

    // Claude API 호출 (/api/translate — Railway 백엔드로 프록시)
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        texts: Object.fromEntries(entries),
        targetLang: 'en'
      })
    });

    if (!response.ok) throw new Error('Translation API error: ' + response.status);
    const data = await response.json();

    enCache = data.translations;
    localStorage.setItem(CACHE_KEY, JSON.stringify(enCache));
    applyTexts(enCache);
  }

  function restoreKorean() {
    if (!koSnapshot) return;
    applyTexts(koSnapshot);
  }

  async function switchLang(lang) {
    if (lang === currentLang) return;

    // 맵 버튼 레이블도 전환
    const mapLabels = {
      ko: { google: 'Google 경로안내', naver: '네이버 경로안내', kakao: '카카오 경로안내' },
      en: { google: 'Google Directions', naver: 'Naver Directions', kakao: 'Kakao Directions' }
    };

    // UI 업데이트
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    if (lang === 'ko') {
      restoreKorean();
      document.documentElement.lang = 'ko';
      currentLang = 'ko';
      localStorage.setItem(STORAGE_KEY, 'ko');
      gaEvent('language_switch', { to: 'ko' });
      return;
    }

    // 영어 전환 — 오버레이 표시
    if (!koSnapshot) koSnapshot = buildSnapshot();

    const overlay = document.createElement('div');
    overlay.className = 'translate-overlay';
    overlay.innerHTML = '<div class="spinner"></div><p>번역 중... Translating...</p>';
    document.body.appendChild(overlay);

    // 버튼 로딩 상태
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.add('loading'));

    try {
      await translateToEnglish();

      // 맵 버튼 레이블 수동 교체 (번역 API에 의존하지 않음)
      const mapBtns = document.querySelectorAll('.map-btn[data-lang-key]');
      mapBtns.forEach(btn => {
        const key = btn.dataset.langKey;
        if (mapLabels[lang] && mapLabels[lang][key.replace('map_', '')]) {
          const icon = btn.querySelector('svg');
          btn.textContent = mapLabels[lang][key.replace('map_', '')];
          if (icon) btn.prepend(icon);
        }
      });

      document.documentElement.lang = 'en';
      currentLang = 'en';
      localStorage.setItem(STORAGE_KEY, 'en');
      gaEvent('language_switch', { to: 'en' });
    } catch (err) {
      console.error('[KOHIPS] Translation failed:', err);
      // 실패 시 조용히 원복
      document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === 'ko');
      });
    } finally {
      overlay.remove();
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('loading'));
    }
  }

  // 초기화: 저장된 언어 복원
  document.addEventListener('DOMContentLoaded', () => {
    // 스냅샷은 로드 직후 찍어야 한국어 원본 보존
    koSnapshot = buildSnapshot();

    document.querySelectorAll('#langSwitch .lang-btn').forEach(btn => {
      btn.addEventListener('click', () => switchLang(btn.dataset.lang));
    });

    if (currentLang === 'en') {
      // 저장된 영어 캐시가 있으면 바로 적용
      if (enCache) {
        document.querySelectorAll('.lang-btn').forEach(b =>
          b.classList.toggle('active', b.dataset.lang === 'en'));
        applyTexts(enCache);
        document.documentElement.lang = 'en';
      }
    }
  });
})();

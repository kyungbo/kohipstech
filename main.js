// ===== Analytics Helper =====
function gaEvent(eventName, params) {
  if (typeof gtag === 'function') gtag('event', eventName, params);
}

// ===== Enhanced GA4: Virtual Pageview for SPA Sections =====
function gaPageView(sectionId) {
  if (typeof gtag === 'function') {
    gtag('event', 'page_view', {
      page_title: sectionTitle(sectionId),
      page_location: window.location.origin + '/#' + sectionId,
      page_path: '/#' + sectionId
    });
  }
}

function sectionTitle(id) {
  const titles = {
    hero: '코힙스테크 | 메인',
    services: '코힙스테크 | 서비스',
    numbers: '코힙스테크 | 실적',
    about: '코힙스테크 | 회사소개',
    hip: '코힙스테크 | HIP 기술',
    products: '코힙스테크 | 생산품목',
    equipment: '코힙스테크 | 보유장비',
    atomize: '코힙스테크 | 가스아토마이즈',
    news: '코힙스테크 | 소식',
    contact: '코힙스테크 | 문의/오시는길'
  };
  return titles[id] || '코힙스테크 | ' + id;
}

// ===== Enhanced GA4: Scroll Depth Tracking =====
(function() {
  const milestones = [25, 50, 75, 100];
  const fired = new Set();
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const pct = Math.round((scrollTop / docHeight) * 100);
    milestones.forEach(m => {
      if (pct >= m && !fired.has(m)) {
        fired.add(m);
        gaEvent('scroll_depth', { percent: m });
      }
    });
  });
})();

// ===== Enhanced GA4: Section Dwell Time =====
(function() {
  let currentSection = null;
  let enterTime = null;

  window._trackSectionEnter = function(sectionId) {
    // 이전 섹션 체류시간 기록
    if (currentSection && enterTime) {
      const dwellSec = Math.round((Date.now() - enterTime) / 1000);
      if (dwellSec >= 2) { // 2초 이상만 기록
        gaEvent('section_dwell', {
          section_id: currentSection,
          dwell_seconds: dwellSec
        });
      }
    }
    currentSection = sectionId;
    enterTime = Date.now();
  };

  // 페이지 이탈 시 마지막 섹션 체류시간 기록
  window.addEventListener('beforeunload', () => {
    if (currentSection && enterTime) {
      const dwellSec = Math.round((Date.now() - enterTime) / 1000);
      if (dwellSec >= 2) {
        gaEvent('section_dwell', {
          section_id: currentSection,
          dwell_seconds: dwellSec
        });
      }
    }
  });
})();

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

// ===== Side Dots + Section View Tracking (Enhanced) =====
const sections = document.querySelectorAll('section[id]');
const sideDots = document.querySelectorAll('.side-dot');
let lastTrackedSection = null;

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const sectionId = entry.target.id;

      // Side dot UI
      sideDots.forEach(d => d.classList.remove('active'));
      const target = document.querySelector(`.side-dot[data-target="${sectionId}"]`);
      if (target) target.classList.add('active');

      // GA4: section_view + virtual pageview (중복 방지)
      if (sectionId !== lastTrackedSection) {
        lastTrackedSection = sectionId;
        gaEvent('section_view', { section_id: sectionId });
        gaPageView(sectionId);
        if (window._trackSectionEnter) window._trackSectionEnter(sectionId);
      }
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

// ===== Google Sheets Webhook (문의 기록 자동 저장) =====
async function logToGoogleSheets(formData) {
  const SHEETS_URL = CONFIG.GOOGLE_SHEETS_WEBHOOK;
  if (!SHEETS_URL) return; // 설정 안 되어 있으면 skip

  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors', // Google Apps Script은 CORS 제한
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        company: formData.company,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        message: formData.message,
        source: window.location.href,
        userAgent: navigator.userAgent.slice(0, 100)
      })
    });
  } catch (err) {
    console.warn('[KOHIPS] Google Sheets logging failed (non-blocking):', err.message);
  }
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
  btn.textContent = window.getI18nText('form_submitting');
  btn.disabled = true;
  btn.style.opacity = '0.7';

  // Google Sheets 기록은 서버(api/contact.js)에서 처리

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

    // GA4: 전환 추적 (문의 폼 전송 성공)
    gaEvent('contact_form_submit', {
      has_file: !!(fileInput && fileInput.files.length > 0),
      company: formData.company,
      contact_email: formData.email
    });
    gaEvent('generate_lead', {
      currency: 'KRW',
      value: 1
    });

    btn.textContent = window.getI18nText('form_success');
    btn.style.background = '#10b981';
    btn.style.opacity = '1';
    form.reset();
    const fileUploadLabel = document.querySelector('#fileUpload span');
    if (fileUploadLabel) fileUploadLabel.textContent = window.getI18nText('form_file_hint');

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
      btn.textContent = window.getI18nText('form_success') + ' (dev)';
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
    btn.textContent = window.getI18nText('form_error');
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
    gaEvent('phone_click', { phone: CONFIG.COMPANY.tel });
  });
});

// ===== Analytics: Map Direction Button Clicks =====
document.querySelectorAll('.map-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    let provider = 'unknown';
    if (btn.classList.contains('map-btn-google')) provider = 'google';
    else if (btn.classList.contains('map-btn-naver')) provider = 'naver';
    else if (btn.classList.contains('map-btn-kakao')) provider = 'kakao';

    gaEvent('map_direction_click', {
      provider: provider,
      destination: CONFIG.COMPANY.address
    });
  });
});

// ===== Analytics: Map Iframe Visibility (지도 확인 추적) =====
(function() {
  const mapIframe = document.querySelector('.google-map-iframe');
  if (!mapIframe) return;

  let mapViewed = false;
  const mapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !mapViewed) {
        mapViewed = true;
        gaEvent('map_view', { map_provider: 'google_embed' });
        mapObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  mapObserver.observe(mapIframe);
})();

// ===== Analytics: Contact Section Engagement =====
(function() {
  const contactSection = document.getElementById('contact');
  if (!contactSection) return;

  let contactViewed = false;
  const contactObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !contactViewed) {
        contactViewed = true;
        gaEvent('contact_section_view', {
          has_pending_trips: false, // website context
          referrer: document.referrer || 'direct'
        });
        contactObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  contactObserver.observe(contactSection);
})();

// ===== Analytics: Form Field Interaction =====
(function() {
  const contactForm = document.querySelector('#contact form');
  if (!contactForm) return;

  let formStarted = false;
  contactForm.addEventListener('focusin', () => {
    if (!formStarted) {
      formStarted = true;
      gaEvent('form_start', { form_name: 'contact' });
    }
  });
})();

// ===== Analytics: Outbound Link Tracking =====
document.querySelectorAll('a[target="_blank"]').forEach(link => {
  link.addEventListener('click', () => {
    gaEvent('outbound_click', {
      url: link.href,
      label: link.textContent.trim().slice(0, 50)
    });
  });
});

// ===== Language Toggle (Static i18n via i18n.js) =====
(function () {
  const STORAGE_KEY = 'kohips_lang';
  let currentLang = localStorage.getItem(STORAGE_KEY) || 'ko';

  function applyLanguage(lang) {
    const texts = I18N[lang];
    if (!texts) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (texts[key] == null) return;
      if (el.children.length === 0) {
        el.textContent = texts[key];
      } else {
        let replaced = false;
        el.childNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            if (!replaced) { node.textContent = texts[key] + ' '; replaced = true; }
          }
        });
      }
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (texts[key] != null) el.innerHTML = texts[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (texts[key] != null) el.placeholder = texts[key];
    });

    document.querySelectorAll('[data-i18n-suffix]').forEach(el => {
      const key = el.getAttribute('data-i18n-suffix');
      if (texts[key] != null) {
        el.dataset.suffix = texts[key];
        const count = el.dataset.count;
        if (count) el.textContent = (+count).toLocaleString() + texts[key];
      }
    });

    document.documentElement.lang = lang;
  }

  function switchLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    applyLanguage(lang);
    gaEvent('language_switch', { to: lang });
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#langSwitch .lang-btn').forEach(btn => {
      btn.addEventListener('click', () => switchLang(btn.dataset.lang));
    });

    if (currentLang !== 'ko') {
      document.querySelectorAll('.lang-btn').forEach(b =>
        b.classList.toggle('active', b.dataset.lang === currentLang));
      applyLanguage(currentLang);
    }
  });

  window.getI18nText = function(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || key;
  };
})();

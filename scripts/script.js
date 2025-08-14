

let currentLang = 'de';
let typingTimer = null;
let typingIndex = 0;

/* ===== Apply translations (text + aria-labels) ===== */
function applyTranslations(lang) {
  currentLang = lang;


  document.querySelectorAll('[data-de]').forEach(el => {
    const t = el.getAttribute(`data-${lang}`);
    if (t !== null) el.innerHTML = t;
  });


  document.querySelectorAll('[data-de-ph]').forEach(el => {
    const labelText = (lang === 'de') ? el.getAttribute('data-de-ph') : el.getAttribute('data-en-ph');
    if (labelText) el.setAttribute('aria-label', labelText);
  });

  // update language buttons state
  const btnDe = document.getElementById('lang-de');
  const btnEn = document.getElementById('lang-en');
  if (btnDe && btnEn) {
    btnDe.classList.toggle('active', lang === 'de');
    btnEn.classList.toggle('active', lang === 'en');
    btnDe.setAttribute('aria-pressed', (lang === 'de').toString());
    btnEn.setAttribute('aria-pressed', (lang === 'en').toString());
  }
}

/* ===== Typing effect (safe) ===== */
function startTyping() {
  const el = document.getElementById('typing-text');
  if (!el) return;
  if (typingTimer) { clearTimeout(typingTimer); typingTimer = null; }
  typingIndex = 0;
  el.textContent = '';
  const text = el.getAttribute(`data-${currentLang}`) || '';
  function tick() {
    if (typingIndex < text.length) {
      el.textContent += text.charAt(typingIndex++);
      typingTimer = setTimeout(tick, 60);
    } else {
      typingTimer = null;
    }
  }
  tick();
}

/* ===== Overlay flash for language change ===== */
function flashLanguageOverlay(cb) {
  const overlay = document.getElementById('lang-overlay');
  overlay.style.transition = 'opacity .28s ease';
  overlay.style.opacity = '1';
  setTimeout(() => {
    cb();
    setTimeout(() => overlay.style.opacity = '0', 100);
  }, 200);
}

/* ===== Floating labels ===== */
function setupFloatingLabels() {
  document.querySelectorAll('.field').forEach(field => {
    const inp = field.querySelector('input, textarea');
    if (!inp) return;

    // initial state
    if (inp.value && inp.value.trim().length > 0) field.classList.add('filled');
    else field.classList.remove('filled');

    // focus
    inp.addEventListener('focus', () => {
      field.classList.add('filled');
    });

    // blur
    inp.addEventListener('blur', () => {
      if (!inp.value || inp.value.trim().length === 0) {
        field.classList.remove('filled');
      } else {
        field.classList.add('filled');
      }
    });

    // input
    inp.addEventListener('input', () => {
      if (inp.value && inp.value.trim().length > 0) field.classList.add('filled');
      else field.classList.remove('filled');
    });


    inp.addEventListener('click', () => setTimeout(() => {
      if (inp.value && inp.value.trim().length > 0) field.classList.add('filled');
      else field.classList.remove('filled');
    }, 0));
  });
}

/* ===== Reveal on scroll (one-time) ===== */
function setupRevealOnScroll() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ===== Smooth scroll to anchors (controlled) ===== */
function smoothScrollTo(targetY, duration = 800) {
  const startY = window.pageYOffset;
  const diff = targetY - startY;
  const start = performance.now();
  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  function frame(now) {
    const time = Math.min(1, (now - start) / duration);
    const eased = easeInOutQuad(time);
    window.scrollTo(0, Math.round(startY + diff * eased));
    if (time < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function setupAnchorScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const header = document.querySelector('.top-header');
      const headerHeight = header ? header.offsetHeight : 0;
      const targetY = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    });
  });
}

/* ===== Init ===== */
document.addEventListener('DOMContentLoaded', () => {

  applyTranslations('de');


  document.querySelectorAll('[data-de-ph]').forEach(el => {
    const aria = el.getAttribute('data-de-ph') || el.getAttribute('data-en-ph') || '';
    if (aria) el.setAttribute('aria-label', aria);
  });


  startTyping();


  document.getElementById('lang-de').addEventListener('click', () => {
    if (currentLang === 'de') return;
    flashLanguageOverlay(() => { applyTranslations('de'); startTyping(); });
  });
  document.getElementById('lang-en').addEventListener('click', () => {
    if (currentLang === 'en') return;
    flashLanguageOverlay(() => { applyTranslations('en'); startTyping(); });
  });


  setupFloatingLabels();


  setupRevealOnScroll();


  setupAnchorScrolling();


  window.addEventListener('beforeunload', () => { if (typingTimer) clearTimeout(typingTimer); });
});

/* =========================================================
   THEME (dark / light) + RTL / LTR
   - Single source of truth: <html data-theme="dark|light"> and <html dir="rtl|ltr">
   - Saved in localStorage so every page uses the same mode
   - The same values are applied before first paint by the small
     inline snippet in each page <head> (no white flash)
========================================================= */
const THEME_KEY = 'theme';
const RTL_KEY = 'rtl';

// ArthroStride theme-aware logos supplied by the user.
function getThemeLogo(lightOrDark) {
  const inPagesFolder = /[\\/]pages[\\/]/i.test(window.location.pathname);
  const file = lightOrDark === 'dark'
    ? 'arthrostride-logo-dark.png'
    : 'arthrostride-logo-light.png';

  return new URL(
    (inPagesFolder ? '../assets/images/' : 'assets/images/') + file,
    document.baseURI
  ).href;
}

function updateThemeLogos(theme) {
  const logo = getThemeLogo(theme);

  document.querySelectorAll(
    '.brand-logo img, .footer-brand-logo img, .booking-logo img'
  ).forEach(img => {
    img.src = logo;
  });

  document.querySelectorAll(
    'link[rel="icon"], link[rel="apple-touch-icon"]'
  ).forEach(link => {
    link.href = logo;
  });
}

function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  updateThemeLogos(theme);

  // Header checkbox (index, home-2, products, contact ...)
  const checkbox = document.querySelector('input#theme-toggle');
  if (checkbox) checkbox.checked = theme === 'dark';

  // Button version (booking page)
  const button = document.querySelector('button#theme-toggle');
  if (button) {
    const icon = button.querySelector('i');
    if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    button.setAttribute('aria-pressed', String(theme === 'dark'));
  }
}

function applyRTL(isRTL) {
  document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

  const checkbox = document.querySelector('input#rtl-toggle');
  if (checkbox) checkbox.checked = isRTL;

  const button = document.querySelector('button#rtl-toggle');
  if (button) button.textContent = isRTL ? 'LTR' : 'RTL';
}

function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  applyTheme(safeGet(THEME_KEY) === 'dark' ? 'dark' : 'light');
  if (!toggle) return;

  const isCheckbox = toggle.tagName === 'INPUT';
  toggle.addEventListener(isCheckbox ? 'change' : 'click', () => {
    const next = isCheckbox
      ? (toggle.checked ? 'dark' : 'light')
      : (document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    safeSet(THEME_KEY, next);
    applyTheme(next);
  });
}

function initRTL() {
  const toggle = document.getElementById('rtl-toggle');
  applyRTL(safeGet(RTL_KEY) === 'true');
  if (!toggle) return;

  const isCheckbox = toggle.tagName === 'INPUT';
  toggle.addEventListener(isCheckbox ? 'change' : 'click', () => {
    const next = isCheckbox
      ? toggle.checked
      : document.documentElement.getAttribute('dir') !== 'rtl';
    safeSet(RTL_KEY, String(next));
    applyRTL(next);
  });
}

// Keep pages in sync if the mode is changed in another tab
window.addEventListener('storage', (e) => {
  if (e.key === THEME_KEY) applyTheme(e.newValue === 'dark' ? 'dark' : 'light');
  if (e.key === RTL_KEY) applyRTL(e.newValue === 'true');
});

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initMobileMenu();
  initSmoothScroll();
  initScrollAnimations();
  initHeaderScroll();
  initBookingForm();
  initBookingPage();
  initFittingDate();
  initHomeDropdown();
  initActiveNav();
});

function initMobileMenu() {
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-navigation');
  if (!toggle || !nav) return;

  const MOBILE_MAX = 960; // keep in sync with responsive.css

  function setOpen(open) {
    if (open) {
      // header is not pinned on short landscape screens: bring it into view
      const header = document.querySelector('.site-header');
      if (header && getComputedStyle(header).position === 'relative') {
        window.scrollTo(0, 0);
      }
    }
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (!open) {
      // collapse the Home accordion too
      const dd = nav.querySelector('.home-dropdown');
      const dt = nav.querySelector('.home-dropdown-toggle');
      if (dd) dd.classList.remove('open');
      if (dt) dt.setAttribute('aria-expanded', 'false');
    }
  }

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!nav.classList.contains('is-open'));
  });

  // Close after choosing a real page link (not the Home accordion toggle)
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  // Tap outside closes the menu
  document.addEventListener('click', (e) => {
    if (!nav.classList.contains('is-open')) return;
    // Theme (dark/light) and RTL/LTR controls live in .header-actions.
    // Tapping them must NOT close the drawer, otherwise the menu vanishes
    // while the page repaints in the new mode (looks like a black screen).
    if (e.target.closest('.header-actions')) return;
    if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Rotating the device (portrait <-> landscape) must not leave the drawer stuck open
  window.addEventListener('resize', () => {
    if (window.innerWidth > MOBILE_MAX) setOpen(false);
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const selector = a.getAttribute('href');
      if (!selector || selector === '#') return;

      const target = document.querySelector(selector);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });

      const nav = document.querySelector('.nav-links');
      const ham = document.querySelector('.hamburger');
      if (nav && nav.classList.contains('active') && ham) {
        nav.classList.remove('active');
        ham.setAttribute('aria-expanded', 'false');
        const icon = ham.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      }
    });
  });
}

function initScrollAnimations() {
  const animateEls = document.querySelectorAll('[data-animate]');
  if (!animateEls.length || !('IntersectionObserver' in window)) return;

  const entryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        entryObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  animateEls.forEach(el => entryObserver.observe(el));

  if (window.innerWidth <= 1024) {
    const hoverEls = document.querySelectorAll('.blog-card, .review-card, .offer-card, .program-card, .team-card, .prog-card');
    const autoHoverObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        entry.target.classList.toggle('active-on-scroll', entry.isIntersecting);
      });
    }, {
      rootMargin: '-20% 0% -20% 0%',
      threshold: 0.5
    });

    hoverEls.forEach(el => autoHoverObserver.observe(el));
  }
}

function initHeaderScroll() {
  const header = document.querySelector('header');
  if (!header) return;

  const update = () => header.classList.toggle('scrolled', window.scrollY > 60);
  update();
  window.addEventListener('scroll', update, { passive: true });
}


function initHomeDropdown() {
  const dropdown = document.querySelector('.home-dropdown');
  const toggle = document.querySelector('.home-dropdown-toggle');
  if (!dropdown || !toggle) return;

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', (event) => {
    if (!dropdown.contains(event.target)) {
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      dropdown.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function initBookingForm() {
  const form = document.getElementById('visit-booking-form');
  const dateInput = document.getElementById('preferred-date');
  const calendarButton = document.getElementById('calendar-button');
  const message = document.getElementById('booking-message');

  if (!form) return;

  if (dateInput) {
    // Hide the browser-native calendar indicator; the custom button
    // below is the only visible calendar control.
    dateInput.classList.add('custom-date-input');

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${year}-${month}-${day}`;
  }

  if (calendarButton && dateInput) {
    calendarButton.addEventListener('click', () => {
      if (typeof dateInput.showPicker === 'function') {
        dateInput.showPicker();
      } else {
        dateInput.focus();
      }
    });
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (message) {
      message.textContent = 'Your visit request has been received. Our team will contact you to confirm the details.';
      message.classList.add('show');
    }

    form.reset();
  });
}


/* Booking page (pages/booking.html): calendar button + form submit */
function initBookingPage() {
  const dateInput = document.getElementById('preferred-date');
  const calendarBtn = document.getElementById('calendar-btn');
  const form = document.getElementById('booking-form');

  if (dateInput) {
    const t = new Date();
    dateInput.min = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }

  if (dateInput && calendarBtn) {
    calendarBtn.addEventListener('click', () => {
      if (typeof dateInput.showPicker === 'function') {
        dateInput.showPicker();
      } else {
        dateInput.focus();
        dateInput.click();
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      alert('Thank you! Your visit request has been received.');
    });
  }
}

/* Fitting page (pages/fitting-consultation.html):
   date input + SVG calendar button + live summary + Sunday check */
function initFittingDate() {
  const input = document.getElementById('ft-date');
  const btn = document.getElementById('ft-calendar-btn');
  const summary = document.getElementById('sm-date');
  const note = document.getElementById('ft-date-note');
  if (!input) return;

  const pad = (n) => String(n).padStart(2, '0');
  const t = new Date();
  input.min = `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;

  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'];

  function update() {
    const parts = input.value.split('-');
    if (parts.length !== 3) {
      input.setCustomValidity('');
      if (note) note.classList.remove('bad');
      if (summary) summary.textContent = 'Select a date';
      return;
    }
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    const closed = d.getDay() === 0;

    input.setCustomValidity(closed ? 'We are closed on Sundays. Please choose another date.' : '');
    if (note) note.classList.toggle('bad', closed);
    if (summary) {
      summary.textContent = closed
        ? 'Closed on Sundays, pick another date'
        : `${DAYS[d.getDay()]}, ${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }
  }

  input.addEventListener('input', update);
  input.addEventListener('change', update);

  if (btn) {
    btn.addEventListener('click', () => {
      if (typeof input.showPicker === 'function') {
        try { input.showPicker(); } catch (e) { input.focus(); }
      } else {
        input.focus();
        input.click();
      }
    });
  }
  update();
}


/* =========================================================
   ACTIVE NAVIGATION
   The active link depends ONLY on the current page URL.
   It never changes with scroll position or #hash.
========================================================= */
function initActiveNav() {
  const links = document.querySelectorAll('.main-navigation .nav-link');
  if (!links.length) return;

  const fileOf = (path) => {
    const name = path.split('/').filter(Boolean).pop() || 'index.html';
    return name.toLowerCase();
  };

  const current = fileOf(window.location.pathname);
  const isHome = current === 'index.html' || current === 'home-2.html';

  links.forEach((link) => {
    let match = false;

    if (link.classList.contains('home-dropdown-toggle')) {
      match = isHome;
    } else {
      match = fileOf(new URL(link.getAttribute('href'), window.location.href).pathname) === current;
    }

    link.classList.toggle('active', match);
    if (match) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  // Home dropdown items (Home 1 / Home 2): mark the current page as active
  document.querySelectorAll('.home-dropdown-link').forEach((item) => {
    const match = fileOf(new URL(item.getAttribute('href'), window.location.href).pathname) === current;
    item.classList.toggle('active', match);
    if (match) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
}
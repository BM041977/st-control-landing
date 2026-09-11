document.getElementById('year').textContent = new Date().getFullYear();

/* Menú móvil */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Header: sombra al hacer scroll */
const header = document.querySelector('.site-header');
function onScrollHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 8);
}
document.addEventListener('scroll', onScrollHeader, { passive: true });
onScrollHeader();

/* Botón volver arriba */
const backToTop = document.getElementById('backToTop');
function onScrollBackToTop() {
  backToTop.classList.toggle('is-visible', window.scrollY > 600);
}
document.addEventListener('scroll', onScrollBackToTop, { passive: true });
onScrollBackToTop();
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
});

/* Revelado al hacer scroll */
const revealEls = document.querySelectorAll('.reveal');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach(el => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));
  // Red de seguridad: si por lo que sea el navegador nunca dispara el
  // observer para algún elemento, lo mostramos igual pasado un momento
  // para que el contenido nunca quede oculto de forma permanente.
  setTimeout(() => {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }, 2500);
}

/* Contador animado de cifras del hero */
const statEls = document.querySelectorAll('.stat-num[data-count-to]');
function animateCount(el) {
  const target = parseInt(el.getAttribute('data-count-to'), 10);
  const suffix = el.getAttribute('data-suffix') || '';
  if (prefersReducedMotion) {
    el.textContent = target + suffix;
    return;
  }
  const duration = 1200;
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
if (statEls.length) {
  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statEls.forEach(el => statObserver.observe(el));
    setTimeout(() => {
      statEls.forEach(el => {
        if (el.textContent === '0') animateCount(el);
      });
    }, 2500);
  } else {
    statEls.forEach(animateCount);
  }
}

/* Resalta el link activo del menú según la sección visible */
const sections = Array.from(document.querySelectorAll('main section[id]'));
const navLinks = Array.from(document.querySelectorAll('.main-nav a[href^="#"]'));
function setActiveLink(id) {
  navLinks.forEach(link => {
    link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
  });
}
if ('IntersectionObserver' in window && sections.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActiveLink(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(sec => sectionObserver.observe(sec));
}

/* Galería "Nuestro trabajo en campo": clic en miniatura -> se ve grande arriba, con transición suave */
const galleryThumbs = document.querySelectorAll('.gallery-thumb');
const galleryFeaturedImg = document.getElementById('galleryFeaturedImg');
const galleryFeaturedCaption = document.getElementById('galleryFeaturedCaption');
galleryThumbs.forEach(thumb => {
  thumb.addEventListener('click', () => {
    if (thumb.classList.contains('is-active')) return;
    const fullSrc = thumb.getAttribute('data-full');
    const caption = thumb.getAttribute('data-caption');
    const thumbImg = thumb.querySelector('img');
    const altText = thumbImg ? thumbImg.alt : caption;

    galleryThumbs.forEach(t => t.classList.remove('is-active'));
    thumb.classList.add('is-active');

    galleryFeaturedImg.style.opacity = '0';
    const preload = new Image();
    preload.onload = () => {
      galleryFeaturedImg.src = fullSrc;
      galleryFeaturedImg.alt = altText;
      galleryFeaturedCaption.textContent = caption;
      requestAnimationFrame(() => { galleryFeaturedImg.style.opacity = '1'; });
    };
    preload.src = fullSrc;
  });
});

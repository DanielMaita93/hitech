document.addEventListener('DOMContentLoaded', () => {
  // ----- Header sombra al hacer scroll -----
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20));

  // ----- Menú móvil -----
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  // ----- Hero slider -----
  const slider = document.querySelector('[data-slider]');
  if (slider) {
    const slides = [...slider.querySelectorAll('.hs-slide')];
    const dotsWrap = slider.querySelector('.hs-dots');
    const interval = +slider.dataset.interval || 6000;
    let idx = 0, timer;

    slides.forEach((_, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Ir a diapositiva ${i + 1}`);
      b.addEventListener('click', () => { go(i); restart(); });
      dotsWrap.appendChild(b);
    });
    const dots = [...dotsWrap.children];

    function go(i) {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('active', n === idx));
      dots.forEach((d, n) => d.classList.toggle('active', n === idx));
    }
    function restart() { clearInterval(timer); timer = setInterval(() => go(idx + 1), interval); }

    slider.querySelector('.hs-prev').addEventListener('click', () => { go(idx - 1); restart(); });
    slider.querySelector('.hs-next').addEventListener('click', () => { go(idx + 1); restart(); });
    go(0); restart();
  }

  // ----- Pestañas del catálogo -----
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  function openTab(name) {
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === name));
    panels.forEach(p => p.classList.toggle('active', p.dataset.panel === name));
  }
  tabBtns.forEach(b => b.addEventListener('click', () => openTab(b.dataset.tab)));

  // ----- Filtros de productos de refrigeración -----
  const chips = document.querySelectorAll('.chip');
  const cards = document.querySelectorAll('[data-panel="refrigeracion"] .product-card');
  function applyFilter(f) {
    chips.forEach(c => c.classList.toggle('active', c.dataset.filter === f));
    cards.forEach(card => card.classList.toggle('hidden', f !== 'all' && card.dataset.cat !== f));
  }
  chips.forEach(c => c.addEventListener('click', () => applyFilter(c.dataset.filter)));

  // ----- Enlaces del menú que abren una pestaña/filtro concreto -----
  document.querySelectorAll('[data-tab-link]').forEach(link => {
    link.addEventListener('click', () => {
      openTab(link.dataset.tabLink);
      if (link.dataset.tabLink === 'refrigeracion') applyFilter(link.dataset.filter || 'all');
    });
  });
});

// ----- Formulario -----
function handleFormSubmit(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const fb = document.getElementById('formFeedback');
  fb.hidden = false;
  fb.textContent = `¡Gracias, ${nombre}! Te contactaremos muy pronto.`;
  e.target.reset();
  return false;
}

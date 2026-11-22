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

    // Deslizamiento táctil (swipe) para manipular el carrusel con el dedo en móvil
    let touchStartX = 0;
    slider.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 45) {
        go(diff < 0 ? idx + 1 : idx - 1);
        restart();
      }
    }, { passive: true });

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

  // ----- Filtros independientes por cada pestaña (Refrigeración y Equipamiento Retail) -----
  function applyFilter(tabName, f) {
    const panel = document.querySelector(`[data-panel="${tabName}"]`);
    if (!panel) return;
    panel.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.filter === f));
    panel.querySelectorAll('.product-card').forEach(card => {
      card.classList.toggle('hidden', f !== 'all' && card.dataset.cat !== f);
    });
  }

  panels.forEach(panel => {
    const tabName = panel.dataset.panel;
    panel.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => applyFilter(tabName, chip.dataset.filter));
    });
  });

  // ----- Enlaces del menú que abren una pestaña/filtro concreto -----
  document.querySelectorAll('[data-tab-link]').forEach(link => {
    link.addEventListener('click', () => {
      const tab = link.dataset.tabLink;
      openTab(tab);
      applyFilter(tab, link.dataset.filter || 'all');
    });
  });

  // ----- Preseleccionar opción en el formulario (ej. Repuestos) -----
  document.querySelectorAll('[data-preselect]').forEach(link => {
    link.addEventListener('click', () => {
      const sel = document.getElementById('interes');
      if (sel) sel.value = link.dataset.preselect;
    });
  });

  // ----- Leer ?tab=shoproll o ?tab=refrigeracion al volver desde galeria/catalogo -----
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab');
  if (initialTab === 'shoproll' || initialTab === 'refrigeracion') {
    openTab(initialTab);
    applyFilter(initialTab, urlParams.get('filter') || 'all');
  }
});

// =========================================================================
// CONFIGURACIÓN DE ENVÍO DE COTIZACIONES
// - En GitHub Pages (pruebas):  FORM_MODE = 'github'    (usa QUOTE_EMAIL)
// - En Hostinger (producción):  FORM_MODE = 'hostinger' (usa enviar-cotizacion.php)
// =========================================================================
const FORM_MODE = 'github';
const QUOTE_EMAIL = 'demm932024@gmail.com';

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('submitBtn');
  const fb = document.getElementById('formFeedback');

  const nombre = document.getElementById('nombre').value.trim();
  const correo = document.getElementById('correo').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const interes = document.getElementById('interes').value;
  const mensaje = document.getElementById('mensaje').value.trim() || 'Sin detalles adicionales';

  btn.disabled = true;
  btn.textContent = 'Enviando solicitud...';
  fb.hidden = true;
  fb.classList.remove('error');

  const formData = new FormData();
  formData.append('Nombre o Empresa', nombre);
  formData.append('Correo del Cliente', correo);
  formData.append('Teléfono / WhatsApp', telefono);
  formData.append('Área de Interés', interes);
  formData.append('Detalles del Proyecto', mensaje);
  formData.append('_subject', `Nueva cotización web - ${nombre} (${interes})`);
  formData.append('_template', 'table');
  formData.append('_replyto', correo);
  formData.append('_captcha', 'false');

  const endpoint = FORM_MODE === 'hostinger'
    ? 'enviar-cotizacion.php'
    : `https://formsubmit.co/ajax/${QUOTE_EMAIL}`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && (data.success === 'true' || data.success === true || data.ok === true)) {
      fb.hidden = false;
      fb.textContent = `¡Gracias, ${nombre}! Recibimos tu solicitud de cotización. Te contactaremos a la brevedad.`;
      form.reset();
    } else {
      throw new Error('send_failed');
    }
  } catch (err) {
    fb.hidden = false;
    fb.classList.add('error');
    fb.innerHTML = 'Ocurrió un inconveniente al enviar el formulario. También puedes escribirnos directo por <a href="https://wa.me/584122026845" target="_blank" rel="noopener" style="text-decoration:underline;">WhatsApp aquí</a>.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Enviar solicitud';
  }
  return false;
}

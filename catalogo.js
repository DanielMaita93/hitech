document.addEventListener('DOMContentLoaded', () => {
  // Header scroll y menú móvil
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 20));
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  }

  const models = window.SHOPROLL_CATALOG || [];
  const grid = document.getElementById('catalogGrid');
  const filterBtns = document.querySelectorAll('[data-cat-filter]');

  // Contadores
  const carritosCount = models.filter(m => m.category === 'carritos').length;
  const cestasCount = models.filter(m => m.category === 'cestas').length;
  document.getElementById('countAll').textContent = `(${models.length})`;
  document.getElementById('countCarritos').textContent = `(${carritosCount})`;
  document.getElementById('countCestas').textContent = `(${cestasCount})`;

  // Estado del Lightbox
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbMainImg');
  const lbTitle = document.getElementById('lbTitle');
  const lbCap = document.getElementById('lbCapacity');
  const lbDesc = document.getElementById('lbDesc');
  const lbColorName = document.getElementById('lbColorName');
  const lbCounter = document.getElementById('lbCounter');
  const lbSwatches = document.getElementById('lbSwatches');
  const lbThumbs = document.getElementById('lbThumbs');
  const lbWa = document.getElementById('lbWhatsapp');

  let activeModel = null;
  let activeVariantIdx = 0;

  function buildWhatsAppUrl(modelName, colorName) {
    const msg = `Hola Grupo Hi-Tech, deseo cotizar el modelo ${modelName} (Color: ${colorName}) de la línea Shop&Roll.`;
    return `https://wa.me/584122026845?text=${encodeURIComponent(msg)}`;
  }

  function renderCards(filter = 'all') {
    grid.innerHTML = '';
    const filtered = filter === 'all' ? models : models.filter(m => m.category === filter);

    filtered.forEach(model => {
      let currentIdx = 0;
      const first = model.variants[0];
      const card = document.createElement('article');
      card.className = 'sr-card';

      card.innerHTML = `
        <div class="sr-media" title="Haz clic para ver galería completa">
          <span class="sr-cap-badge">${model.capacity}</span>
          <img src="${first.img}" alt="${model.name} - ${first.color}" loading="lazy" />
          <span class="sr-zoom-hint">🔍 Ver ${model.variants.length} colores</span>
        </div>
        <div class="sr-body">
          <span class="sr-type">${model.category === 'carritos' ? 'Carrito Compact Loop' : 'Cesta Rodante Shop&Roll'}</span>
          <h3>${model.name}</h3>
          <p class="sr-desc">${model.desc}</p>
          <div class="sr-colors-block">
            <div class="sr-color-meta">
              <span>Color: <strong class="card-color-name">${first.color}</strong></span>
              <span>${model.variants.length} colores</span>
            </div>
            <div class="sr-swatches"></div>
            <div class="sr-card-actions">
              <button type="button" class="btn sr-btn-gallery">Ver todos los colores</button>
              <a href="${buildWhatsAppUrl(model.name, first.color)}" target="_blank" rel="noopener" class="btn sr-btn-wa">WhatsApp</a>
            </div>
          </div>
        </div>
      `;

      const imgEl = card.querySelector('.sr-media img');
      const colorNameEl = card.querySelector('.card-color-name');
      const swatchesWrap = card.querySelector('.sr-swatches');
      const waLink = card.querySelector('.sr-btn-wa');

      model.variants.forEach((v, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'swatch' + (idx === 0 ? ' active' : '');
        dot.style.backgroundColor = v.hex;
        dot.title = v.color;
        dot.setAttribute('aria-label', `Color ${v.color}`);
        dot.addEventListener('click', () => {
          currentIdx = idx;
          imgEl.src = v.img;
          imgEl.alt = `${model.name} - ${v.color}`;
          colorNameEl.textContent = v.color;
          waLink.href = buildWhatsAppUrl(model.name, v.color);
          swatchesWrap.querySelectorAll('.swatch').forEach((s, n) => s.classList.toggle('active', n === idx));
        });
        swatchesWrap.appendChild(dot);
      });

      card.querySelector('.sr-media').addEventListener('click', () => openLightbox(model, currentIdx));
      card.querySelector('.sr-btn-gallery').addEventListener('click', () => openLightbox(model, currentIdx));

      grid.appendChild(card);
    });
  }

  function updateLightboxVariant(idx) {
    if (!activeModel) return;
    const total = activeModel.variants.length;
    activeVariantIdx = (idx + total) % total;
    const v = activeModel.variants[activeVariantIdx];

    lbImg.src = v.img;
    lbImg.alt = `${activeModel.name} - ${v.color}`;
    lbColorName.textContent = v.color;
    lbCounter.textContent = `${activeVariantIdx + 1} / ${total}`;
    lbWa.href = buildWhatsAppUrl(activeModel.name, v.color);

    lbSwatches.querySelectorAll('.swatch').forEach((s, n) => s.classList.toggle('active', n === activeVariantIdx));
    lbThumbs.querySelectorAll('.lb-thumb').forEach((t, n) => t.classList.toggle('active', n === activeVariantIdx));
  }

  function openLightbox(model, startIdx = 0) {
    activeModel = model;
    lbTitle.textContent = model.name;
    lbCap.textContent = model.capacity;
    lbDesc.textContent = model.desc;

    lbSwatches.innerHTML = '';
    lbThumbs.innerHTML = '';

    model.variants.forEach((v, idx) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'swatch';
      dot.style.backgroundColor = v.hex;
      dot.title = v.color;
      dot.addEventListener('click', () => updateLightboxVariant(idx));
      lbSwatches.appendChild(dot);

      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'lb-thumb';
      thumb.title = v.color;
      thumb.innerHTML = `<img src="${v.img}" alt="${v.color}" />`;
      thumb.addEventListener('click', () => updateLightboxVariant(idx));
      lbThumbs.appendChild(thumb);
    });

    updateLightboxVariant(startIdx);
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbBackdrop').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => updateLightboxVariant(activeVariantIdx - 1));
  document.getElementById('lbNext').addEventListener('click', () => updateLightboxVariant(activeVariantIdx + 1));

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') updateLightboxVariant(activeVariantIdx - 1);
    if (e.key === 'ArrowRight') updateLightboxVariant(activeVariantIdx + 1);
  });

  // Filtros
  function setFilter(f) {
    filterBtns.forEach(b => b.classList.toggle('active', b.dataset.catFilter === f));
    renderCards(f);
  }
  filterBtns.forEach(b => b.addEventListener('click', () => setFilter(b.dataset.catFilter)));

  // Leer parámetro ?tipo=carritos o ?tipo=cestas desde index.html
  const params = new URLSearchParams(window.location.search);
  const initial = params.get('tipo');
  setFilter(initial === 'carritos' || initial === 'cestas' ? initial : 'all');
});

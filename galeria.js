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

  const galleries = window.HITECH_GALLERIES || {};
  const params = new URLSearchParams(window.location.search);
  const catKey = galleries[params.get('cat')] ? params.get('cat') : 'equipos';
  const cat = galleries[catKey];

  // Encabezado y breadcrumbs
  document.title = `${cat.title} | Grupo Hi-Tech Ingeniería`;
  const isRetail = cat.area === 'Equipamiento Retail';
  const navRef = document.getElementById('navRefrigeracion');
  const navRet = document.getElementById('navRetail');
  if (navRef && navRet) {
    navRef.classList.toggle('active-page', !isRetail);
    navRet.classList.toggle('active-page', isRetail);
  }
  const backUrl = isRetail ? 'index.html?tab=shoproll#productos' : 'index.html?tab=refrigeracion#productos';
  const bcArea = document.getElementById('bcArea');
  bcArea.textContent = cat.area;
  bcArea.href = backUrl;
  const backBtn = document.getElementById('backToCatalog');
  if (backBtn) {
    backBtn.href = backUrl;
    backBtn.textContent = `← Volver a ${cat.area}`;
  }
  document.getElementById('bcTitle').textContent = cat.title;
  document.getElementById('galKicker').textContent = cat.kicker;
  document.getElementById('galTitle').textContent = cat.title;
  document.getElementById('galDesc').textContent = cat.desc;

  // Marcar categoría activa en la barra superior
  document.querySelectorAll('[data-switch]').forEach(a => {
    a.classList.toggle('active', a.dataset.switch === catKey);
  });

  const subfilterWrap = document.getElementById('subfilterWrap');
  const subfilterBtns = document.getElementById('subfilterBtns');
  const photoGrid = document.getElementById('photoGrid');

  // Lightbox
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbMainImg');
  const lbArea = document.getElementById('lbArea');
  const lbTitle = document.getElementById('lbTitle');
  const lbDesc = document.getElementById('lbDesc');
  const lbCounter = document.getElementById('lbCounter');
  const lbThumbs = document.getElementById('lbThumbs');
  const lbWa = document.getElementById('lbWhatsapp');

  let currentList = [];
  let activeIdx = 0;

  function buildWa(itemTitle) {
    const msg = `Hola Grupo Hi-Tech, deseo solicitar información y cotización sobre: ${cat.title} (${itemTitle}).`;
    return `https://wa.me/584122026845?text=${encodeURIComponent(msg)}`;
  }

  function renderGrid(groupId = 'all') {
    photoGrid.innerHTML = '';
    currentList = [];

    cat.groups.forEach(g => {
      if (groupId === 'all' || g.id === groupId) {
        g.items.forEach(item => currentList.push(item));
      }
    });

    currentList.forEach((item, idx) => {
      const card = document.createElement('article');
      card.className = 'photo-card';
      card.innerHTML = `
        <div class="photo-thumb" style="background-image:url('${item.img}');">
          <span class="photo-zoom">🔍 Ampliar</span>
        </div>
        <div class="photo-meta">
          <span class="photo-sub">${item.sub}</span>
          <h3>${item.title}</h3>
        </div>
      `;
      card.addEventListener('click', () => openLightbox(idx));
      photoGrid.appendChild(card);
    });
  }

  // Si hay más de 1 subgrupo (ej. Exhibidoras Remotas), mostrar barra de subfiltros
  if (cat.groups.length > 1) {
    subfilterWrap.hidden = false;
    const allCount = cat.groups.reduce((acc, g) => acc + g.items.length, 0);

    const allBtn = document.createElement('button');
    allBtn.className = 'cat-filter-btn active';
    allBtn.textContent = `Todos (${allCount})`;
    allBtn.addEventListener('click', () => selectGroup('all', allBtn));
    subfilterBtns.appendChild(allBtn);

    cat.groups.forEach(g => {
      const b = document.createElement('button');
      b.className = 'cat-filter-btn';
      b.textContent = `${g.name} (${g.items.length})`;
      b.addEventListener('click', () => selectGroup(g.id, b));
      subfilterBtns.appendChild(b);
    });
  }

  function selectGroup(id, clickedBtn) {
    subfilterBtns.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
    clickedBtn.classList.add('active');
    renderGrid(id);
  }

  function updateLightbox(idx) {
    const total = currentList.length;
    if (!total) return;
    activeIdx = (idx + total) % total;
    const item = currentList[activeIdx];

    lbImg.src = item.img;
    lbImg.alt = item.title;
    lbArea.textContent = `${cat.area} · ${item.sub}`;
    lbTitle.textContent = item.title;
    lbDesc.textContent = cat.desc;
    lbCounter.textContent = `${activeIdx + 1} / ${total}`;
    lbWa.href = buildWa(item.title);

    lbThumbs.querySelectorAll('.lb-thumb').forEach((t, n) => t.classList.toggle('active', n === activeIdx));
  }

  function openLightbox(idx) {
    lbThumbs.innerHTML = '';
    currentList.slice(0, 12).forEach((item, n) => {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'lb-thumb';
      t.innerHTML = `<img src="${item.img}" alt="${item.title}" />`;
      t.addEventListener('click', () => updateLightbox(n));
      lbThumbs.appendChild(t);
    });

    updateLightbox(idx);
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
  document.getElementById('lbPrev').addEventListener('click', () => updateLightbox(activeIdx - 1));
  document.getElementById('lbNext').addEventListener('click', () => updateLightbox(activeIdx + 1));

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') updateLightbox(activeIdx - 1);
    if (e.key === 'ArrowRight') updateLightbox(activeIdx + 1);
  });

  renderGrid('all');
});

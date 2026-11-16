(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- nav + menu ---------- */
  const nav = $('#nav'), menu = $('#menu'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.textContent = open ? 'Close' : 'Menu';
    menuBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); menuBtn.textContent = 'Menu';
    menuBtn.setAttribute('aria-expanded', false); document.body.style.overflow = '';
  }));

  /* ---------- smooth anchor scroll ---------- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    scrollTo({ top: a.getAttribute('href') === '#top' ? 0 : t.getBoundingClientRect().top + scrollY, behavior: reduced ? 'auto' : 'smooth' });
  }));

  /* ---------- photos ----------
     A cover that isn't in its folder yet shows the monogram arch; a gallery photo that
     fails to load is dropped; a gallery with no photos hides its whole section. */
  const onFail = (img, fn) => {
    if (img.complete && !img.naturalWidth) fn(); else img.addEventListener('error', fn, { once: true });
  };
  $$('.c-cover img').forEach(img => onFail(img, () => img.closest('.ir').classList.add('empty')));
  const gal = $('#gal');
  const hideEmptyGallery = () => { if (gal && !$('.g', gal)) gal.closest('section').hidden = true; };
  $$('.g img').forEach(img => onFail(img, () => { img.closest('.g').remove(); hideEmptyGallery(); }));
  hideEmptyGallery();

  /* ---------- reveal on view ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -5% 0px' });
  $$('.rv, .ir').forEach(el => io.observe(el));

  /* ---------- nav hides on scroll down; WhatsApp button appears ---------- */
  const wa = $('#wa');
  let lastY = scrollY, navHidden = false;
  const onScroll = () => {
    const y = scrollY, dy = y - lastY;
    if (Math.abs(dy) > 4 && !menu.classList.contains('open')) {
      const hide = dy > 0 && y > innerHeight * .5;
      if (hide !== navHidden) { navHidden = hide; nav.classList.toggle('hide', hide); }
    }
    wa.classList.toggle('on', y > innerHeight * .5);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- cursor ---------- */
  const cur = $('#cursor'), ring = $('#cursorRing'), label = $('#cursorLabel');
  let mx = 0, my = 0, rx = 0, ry = 0, cursorLive = false;
  if (finePointer && !reduced) {
    document.documentElement.classList.add('has-cursor');
    addEventListener('mousemove', e => {
      if (!cursorLive) { cursorLive = true; rx = e.clientX; ry = e.clientY; document.documentElement.classList.add('cursor-live'); }
      mx = e.clientX; my = e.clientY;
      cur.style.transform = `translate(${mx}px,${my}px)`;
    });
    // gallery photos are added to the page as markup, so delegate rather than bind each one
    document.addEventListener('mouseover', e => {
      const el = e.target.closest('[data-cursor]');
      if (el) { label.textContent = el.dataset.cursor; ring.classList.add('big'); } else ring.classList.remove('big');
    });
    const cursorLoop = () => {
      rx = lerp(rx, mx, .16); ry = lerp(ry, my, .16);
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(cursorLoop);
    };
    cursorLoop();

    /* magnetic CTA */
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .3}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  /* ---------- lightbox ---------- */
  const lb = $('#lb'), lbImg = $('#lbImg');
  let items = [], idx = 0;
  const show = i => {
    idx = (i + items.length) % items.length;
    const img = $('img', items[idx]);
    lbImg.style.opacity = 0;
    setTimeout(() => { lbImg.src = items[idx].getAttribute('href'); lbImg.alt = img.alt; lbImg.style.opacity = 1; }, 150);
    $('#lbCount').textContent = `${String(idx + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
  };
  const open = el => {
    items = $$('#gal .g');  // read fresh: photos that failed to load have been removed
    show(items.indexOf(el)); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('#lbX').focus();
  };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; items[idx].focus(); };
  if (gal) gal.addEventListener('click', e => {
    const g = e.target.closest('.g');
    if (g) { e.preventDefault(); open(g); }
  });
  $('#lbX').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => show(idx - 1));
  $('#lbNext').addEventListener('click', () => show(idx + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
  let tx = 0;
  lb.addEventListener('touchstart', e => tx = e.touches[0].clientX, { passive: true });
  lb.addEventListener('touchend', e => {
    const d = e.changedTouches[0].clientX - tx;
    if (Math.abs(d) > 50) show(idx + (d < 0 ? 1 : -1));
  });
})();

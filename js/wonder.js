/* 레이아웃 B (복원본) — 헤더 숨김, 히어로 슬라이드쇼, 제품 탭 필터, 가로 스크롤 */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. 헤더: 내리면 숨고 올리면 나타남
  var header = document.querySelector('.w-header');
  if (header) {
    var lastY = window.scrollY;
    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      header.classList.toggle('is-hidden', y > lastY && y > 200);
      lastY = y;
    }, { passive: true });
  }

  // 2. 히어로 슬라이드쇼
  var hero = document.querySelector('.w-hero');
  if (hero) {
    var slides = hero.querySelectorAll('.w-slide');
    var bars = hero.querySelectorAll('.w-hero__bar');
    var SLIDE_MS = 6000;
    var current = 0, timer = null;
    hero.style.setProperty('--slide-ms', SLIDE_MS + 'ms');

    function show(i) {
      current = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        var on = n === current;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      bars.forEach(function (b, n) {
        b.setAttribute('aria-current', 'false');
        void b.offsetWidth; // 진행 바 애니메이션 재시작
        if (n === current) b.setAttribute('aria-current', 'true');
      });
      restart();
    }
    function restart() {
      clearTimeout(timer);
      if (reduce || hero.classList.contains('is-paused')) return;
      timer = setTimeout(function () { show(current + 1); }, SLIDE_MS);
    }
    hero.querySelectorAll('.w-hero__arrow').forEach(function (btn) {
      btn.addEventListener('click', function () { show(current + (btn.dataset.dir === 'next' ? 1 : -1)); });
    });
    bars.forEach(function (b, n) { b.addEventListener('click', function () { show(n); }); });
    function pause(on) { hero.classList.toggle('is-paused', on); if (on) clearTimeout(timer); else restart(); }
    hero.addEventListener('mouseenter', function () { pause(true); });
    hero.addEventListener('mouseleave', function () { pause(false); });
    hero.addEventListener('focusin', function () { pause(true); });
    hero.addEventListener('focusout', function () { pause(false); });
    document.addEventListener('keydown', function (e) {
      if (!hero.contains(document.activeElement)) return;
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
    show(0);
  }

  // 3. 제품 탭 필터
  var tabs = document.querySelectorAll('.w-tab');
  var grid = document.querySelector('.w-products');
  if (tabs.length && grid) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        if (tab.getAttribute('aria-selected') === 'true') return;
        tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
        var filter = tab.dataset.filter;
        grid.classList.add('is-switching');
        setTimeout(function () {
          grid.querySelectorAll('.w-product').forEach(function (p) {
            var tags = (p.dataset.tags || '').split(' ');
            p.hidden = !(filter === 'all' || tags.indexOf(filter) > -1);
          });
          grid.classList.remove('is-switching');
        }, reduce ? 0 : 300);
      });
    });
  }

  // 4. 가로 스크롤 (버튼 + 마우스 드래그)
  document.querySelectorAll('[data-scroller]').forEach(function (section) {
    var track = section.querySelector('.w-scroller');
    var prev = section.querySelector('.w-scroll-btn[data-dir="prev"]');
    var next = section.querySelector('.w-scroll-btn[data-dir="next"]');
    if (!track) return;
    function step() { var card = track.firstElementChild; return card ? card.getBoundingClientRect().width + 24 : 300; }
    function sync() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step() }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step() }); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();

    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add('is-dragging'); }
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; track.classList.remove('is-dragging'); });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });
})();

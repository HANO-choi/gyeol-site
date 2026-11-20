/* GYEOL — 공통 움직임 (복원본): 스크롤 등장 + 패럴랙스 */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. 스크롤 등장 — 섹션 머리와 카드
  if (!reduce && 'IntersectionObserver' in window) {
    var targets = document.querySelectorAll('.section .row-between, .w-dept, .w-product, .w-quote, .w-feature, .w-band__copy > *, .w-atelier > *');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = (i % 4) * 0.08 + 's';
      io.observe(el);
    });
  }

  // 2. 패럴랙스 — data-parallax="16" → 화면 높이 대비 최대 16% 이동
  var layers = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  if (reduce || !layers.length) return;
  var ticking = false;
  function update() {
    var vh = window.innerHeight;
    layers.forEach(function (img) {
      var box = img.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      var progress = (box.top + box.height / 2 - vh / 2) / (vh / 2 + box.height / 2); // -1 ~ 1
      var amount = parseFloat(img.getAttribute('data-parallax')) || 10;
      img.style.transform = 'translate3d(0,' + (-progress * amount / 2) + '%,0)';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

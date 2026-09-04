/* Static-clone fixups for the Virtus Lissone site */
(function () {
  // Ensure Elementor counters show their final value even if the animation observer never fires.
  function fillCounters() {
    document.querySelectorAll('.elementor-counter-number[data-to-value]').forEach(function (el) {
      if (el.textContent.trim() === '' || el.textContent.trim() === '0') {
        el.textContent = el.getAttribute('data-to-value');
      }
    });
  }
  // Let the contact form submit natively to FormSubmit instead of Elementor's WordPress AJAX.
  function freeContactForm() {
    var form = document.querySelector('form.elementor-form[action*="formsubmit"]');
    if (!form) return;
    // Capture-phase listener runs first and stops Elementor's own submit handler,
    // leaving the browser's native submit (to the action URL) intact.
    form.addEventListener('submit', function (e) { e.stopImmediatePropagation(); }, true);
  }

  // Responsive header: toggle the mobile menu.
  function initHeader() {
    var inner = document.querySelector('.vl-header__inner');
    var burger = inner && inner.querySelector('.vl-burger');
    if (!inner || !burger) return;
    burger.addEventListener('click', function () {
      var open = inner.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // Close the menu when a link is tapped or when clicking outside.
    inner.querySelectorAll('.vl-nav__link').forEach(function (a) {
      a.addEventListener('click', function () { inner.classList.remove('is-open'); });
    });
    document.addEventListener('click', function (e) {
      if (!inner.contains(e.target)) inner.classList.remove('is-open');
    });
  }

  // Copy-to-clipboard buttons (pagina Iscrizioni: intestatario e IBAN).
  function initCopyButtons() {
    var checkIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    document.querySelectorAll('.isc-copy').forEach(function (btn) {
      var original = btn.innerHTML;
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.getAttribute('data-copy-target'));
        if (!target) return;
        var text = target.textContent.trim();
        var done = function () {
          btn.classList.add('copied');
          btn.innerHTML = checkIcon;
          btn.setAttribute('title', 'Copiato!');
          setTimeout(function () {
            btn.classList.remove('copied');
            btn.innerHTML = original;
            btn.removeAttribute('title');
          }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
        } else {
          fallbackCopy(text, done);
        }
      });
    });
  }
  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  // Carosello hero della home (rimpiazza lo slideshow Elementor che non si avvia nell'export statico).
  var HERO_IMAGES = [
    'assets/c77e5b_3bb24db4-8d19-4bb4-a856-f653ef26c89d.jpeg',
    'assets/e15703_449850d8-83b8-4c48-9738-5793e1b5fe6b.jpeg',
    'assets/1103ab_bc99316f-66d9-4adb-b56f-cfd446c34ac0.jpeg'
  ];
  function initHeroSlideshow() {
    var hero = document.querySelector('.elementor-element-49b8b301');
    if (!hero || hero.querySelector('.vl-hero-slides')) return;
    var wrap = document.createElement('div');
    wrap.className = 'vl-hero-slides';
    var slides = HERO_IMAGES.map(function (src, i) {
      var s = document.createElement('div');
      s.className = 'vl-hero-slide' + (i === 0 ? ' is-active' : '');
      s.style.backgroundImage = 'url("' + src + '")';
      wrap.appendChild(s);
      return s;
    });
    var overlay = document.createElement('div');
    overlay.className = 'vl-hero-overlay';
    wrap.appendChild(overlay);
    hero.insertBefore(wrap, hero.firstChild);
    if (slides.length < 2) return;
    var idx = 0;
    setInterval(function () {
      slides[idx].classList.remove('is-active');
      idx = (idx + 1) % slides.length;
      slides[idx].classList.add('is-active');
    }, 5000);
  }

  function init() { setTimeout(fillCounters, 1500); freeContactForm(); initHeader(); initCopyButtons(); initHeroSlideshow(); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

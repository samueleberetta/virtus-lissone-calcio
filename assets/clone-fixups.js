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

  function init() { setTimeout(fillCounters, 1500); freeContactForm(); initHeader(); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

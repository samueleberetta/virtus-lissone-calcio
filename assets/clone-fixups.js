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

  function init() { setTimeout(fillCounters, 1500); freeContactForm(); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

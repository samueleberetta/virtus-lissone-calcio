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
  if (document.readyState !== 'loading') setTimeout(fillCounters, 1500);
  else document.addEventListener('DOMContentLoaded', function () { setTimeout(fillCounters, 1500); });
})();

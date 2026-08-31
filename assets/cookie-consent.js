/* Cookie consent GDPR — Virtus Lissone
   - Nessun cookie/tracciamento di terze parti viene attivato prima del consenso.
   - L'unico embed di terze parti (mappa Google in home) resta bloccato finché
     l'utente non accetta. Scelta salvata in localStorage. */
(function () {
  var KEY = 'vl_cookie_consent'; // valori: 'all' | 'necessary'

  function getConsent() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(KEY, v); } catch (e) {} applyConsent(v); hideBanner(); }

  function applyConsent(level) {
    if (level !== 'all') return;
    document.querySelectorAll('iframe[data-consent-src]').forEach(function (f) {
      if (!f.src || f.src === 'about:blank' || f.src === location.href) {
        f.src = f.getAttribute('data-consent-src');
      }
      f.style.display = '';
      var block = f.parentNode && f.parentNode.querySelector('.vl-embed-block');
      if (block) block.remove();
    });
  }

  // Crea un placeholder al posto di ogni embed bloccato
  function blockEmbeds() {
    if (getConsent() === 'all') { applyConsent('all'); return; }
    document.querySelectorAll('iframe[data-consent-src]').forEach(function (f) {
      if (f.parentNode.querySelector('.vl-embed-block')) return;
      f.style.display = 'none';
      var ph = document.createElement('div');
      ph.className = 'vl-embed-block';
      ph.innerHTML = '<p>Per vedere la mappa di Google accetta i cookie di terze parti.</p>' +
                     '<button type="button">Attiva la mappa</button>';
      ph.querySelector('button').addEventListener('click', function () { setConsent('all'); });
      f.parentNode.insertBefore(ph, f);
    });
  }

  function buildBanner() {
    if (document.querySelector('.vl-cc')) return;
    var bar = document.createElement('div');
    bar.className = 'vl-cc';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Informativa cookie');
    bar.innerHTML =
      '<div class="vl-cc__inner">' +
        '<div class="vl-cc__text"><strong>Questo sito utilizza i cookie</strong>' +
        'Usiamo solo cookie tecnici necessari al funzionamento. Con il tuo consenso ' +
        'attiviamo la mappa di Google (cookie di terze parti). Leggi la ' +
        '<a href="cookie-policy.html">Cookie Policy</a> e la ' +
        '<a href="privacy-policy.html">Privacy Policy</a>.</div>' +
        '<div class="vl-cc__actions">' +
          '<button class="vl-cc__btn vl-cc__btn--reject" type="button">Solo necessari</button>' +
          '<button class="vl-cc__btn vl-cc__btn--accept" type="button">Accetta tutti</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(bar);
    bar.querySelector('.vl-cc__btn--accept').addEventListener('click', function () { setConsent('all'); });
    bar.querySelector('.vl-cc__btn--reject').addEventListener('click', function () { setConsent('necessary'); });
  }
  function showBanner() { buildBanner(); var b = document.querySelector('.vl-cc'); if (b) b.classList.add('is-visible'); }
  function hideBanner() { var b = document.querySelector('.vl-cc'); if (b) b.classList.remove('is-visible'); }

  // Riapertura preferenze (link "Preferenze cookie" nel footer)
  window.vlOpenCookiePrefs = function () { buildBanner(); showBanner(); };

  function init() {
    blockEmbeds();
    if (!getConsent()) showBanner();
    document.querySelectorAll('[data-cookie-prefs]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); window.vlOpenCookiePrefs(); });
    });
  }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();

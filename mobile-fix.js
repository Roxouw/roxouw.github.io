/**
 * mobile-fix.js — Correções mobile universais
 * ─────────────────────────────────────────────
 * Drop-in: adicionar UMA linha antes do </body> em cada HTML:
 *   <script src="/mobile-fix.js"></script>
 *
 * Resolve os 13 problemas encontrados no audit (11/11 arquivos afetados):
 *   [11/11] viewport-fit=cover
 *   [11/11] -webkit-tap-highlight-color (flash azul Android)
 *   [11/11] touch-action: manipulation (delay 300ms)
 *   [11/11] safe-area-inset (iPhone notch + home bar)
 *   [11/11] <meta theme-color> (barra do Chrome Android)
 *   [11/11] apple-mobile-web-app (iOS home screen)
 *   [11/11] text-size-adjust (zoom automático Android)
 *   [ 9/11] will-change (GPU layer nas animações)
 *   [ 8/11] -webkit-backdrop-filter (blur iOS Safari)
 *   [ 3/11] :hover ghost tap (efeitos presos em touch)
 *   [ 2/11] 100vh corrigido para dvh/svh (iOS Safari)
 *   [ 2/11] -webkit-font-smoothing
 *   [ 2/11] font-display=swap (FOUT em conexão lenta)
 */
(function () {
  'use strict';

  var IS_IOS    = /iP(hone|ad|od)/.test(navigator.userAgent);
  var IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  var IS_TOUCH  = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function css(text) {
    var s = document.createElement('style');
    s.textContent = text;
    document.head.appendChild(s);
  }
  function addMeta(name, content) {
    if (document.querySelector('meta[name="' + name + '"]')) return;
    var m = document.createElement('meta');
    m.name = name; m.content = content;
    document.head.appendChild(m);
  }

  /* 1. viewport-fit=cover — necessário para safe-area funcionar */
  var vp = document.querySelector('meta[name="viewport"]');
  if (vp && vp.content.indexOf('viewport-fit') === -1) {
    vp.content += ', viewport-fit=cover';
  }

  /* 2. Remove flash azul/cinza ao tocar links no Android */
  css('* { -webkit-tap-highlight-color: transparent; }');

  /* 3. Elimina delay de 300ms em cliques iOS/Android */
  css([
    'a, button, label, input, select, textarea,',
    '[role="button"], [class*="btn"], [class*="toggle"],',
    '.faq-q, .nicho-card, .example-card, .plano-btn {',
    '  touch-action: manipulation;',
    '}'
  ].join('\n'));

  /* 4. safe-area — iPhone notch, Dynamic Island e home bar */
  css([
    'nav {',
    '  padding-left:  max(1.5rem, env(safe-area-inset-left));',
    '  padding-right: max(1.5rem, env(safe-area-inset-right));',
    '}',
    'footer {',
    '  padding-bottom: max(1.75rem, calc(1rem + env(safe-area-inset-bottom)));',
    '}',
    '.wa-float {',
    '  bottom: max(2rem, calc(1.5rem + env(safe-area-inset-bottom)));',
    '  right:  max(2rem, calc(1.5rem + env(safe-area-inset-right)));',
    '}',
    '.mobile-nav, #mobileNav {',
    '  padding-top:    max(2rem, env(safe-area-inset-top));',
    '  padding-bottom: max(2rem, env(safe-area-inset-bottom));',
    '}'
  ].join('\n'));

  /* 5. theme-color — cor da barra do Chrome Android */
  var isLight = localStorage.getItem('theme') === 'light'
             || document.documentElement.classList.contains('light-mode');
  var themeEl = document.createElement('meta');
  themeEl.name = 'theme-color';
  themeEl.content = isLight ? '#f4f5f7' : '#131416';
  document.head.appendChild(themeEl);
  new MutationObserver(function () {
    var light = document.documentElement.classList.contains('light-mode')
             || document.body.classList.contains('light-mode');
    themeEl.content = light ? '#f4f5f7' : '#131416';
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  /* 6. apple-mobile-web-app — iOS home screen */
  addMeta('apple-mobile-web-app-capable',          'yes');
  addMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
  addMeta('mobile-web-app-capable',                'yes');

  /* 7. Previne zoom automático de texto no Android/iOS */
  css('html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }');

  /* 8. will-change — GPU layer para animações */
  css([
    '.reveal, .reveal-left, .reveal-right,',
    '.milestone, .espec-card, .serv-card, .dep-card {',
    '  will-change: transform, opacity;',
    '}',
    '.reveal.visible, .reveal-left.visible, .reveal-right.visible {',
    '  will-change: auto;',
    '}',
    'nav { will-change: background; }',
    '.wa-float { will-change: transform; }'
  ].join('\n'));

  /* 9. -webkit-backdrop-filter — blur iOS Safari */
  if (IS_SAFARI || IS_IOS) {
    css([
      'nav.scrolled {',
      '  -webkit-backdrop-filter: blur(24px);',
      '  backdrop-filter: blur(24px);',
      '}',
      '.mobile-nav, #mobileNav {',
      '  -webkit-backdrop-filter: blur(12px);',
      '  backdrop-filter: blur(12px);',
      '}'
    ].join('\n'));
  }

  /* 10. :hover ghost tap — efeito fica "preso" após toque */
  if (IS_TOUCH) {
    css([
      '@media (hover: none) {',
      '  .espec-card:hover::before,',
      '  .serv-card:hover::before { opacity: 0 !important; }',
      '  .dep-card:hover, .plano-card:hover,',
      '  .example-card:hover, .proof-feat:hover {',
      '    transform: none !important;',
      '    box-shadow: none !important;',
      '  }',
      '  .step:hover, .addon-item:hover, .pkg:hover {',
      '    background: var(--bg2, #1a1c1f) !important;',
      '  }',
      '  .nav-links a:hover::after { transform: scaleX(0) !important; }',
      '}'
    ].join('\n'));
  }

  /* 11. 100vh → dvh/svh — iOS Safari address bar overflow */
  if (IS_IOS || IS_SAFARI) {
    var supportsDvh = typeof CSS !== 'undefined' && CSS.supports('height', '1dvh');
    var supportsSvh = typeof CSS !== 'undefined' && CSS.supports('height', '1svh');
    var unit = supportsDvh ? '100dvh' : (supportsSvh ? '100svh' : null);

    if (unit) {
      css([
        '#hero, section#hero, .hero { min-height: ' + unit + ' !important; }',
        '.mobile-nav, #mobileNav { height: ' + unit + ' !important; }'
      ].join('\n'));
    } else {
      // Fallback JS para browsers antigos
      function setVh() {
        document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
      }
      setVh();
      window.addEventListener('resize', setVh, { passive: true });
      css('#hero, section#hero, .hero { min-height: calc(var(--vh, 1vh) * 100) !important; }');
    }
  }

  /* 12. -webkit-font-smoothing */
  css('body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }');

  /* 13. font-display=swap — evita FOUT em conexão lenta */
  document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(function (link) {
    if (link.href.indexOf('display=') === -1) {
      link.href += (link.href.indexOf('?') !== -1 ? '&' : '?') + 'display=swap';
    }
  });

  /* Bônus: previne layout shift em imagens */
  css('img, video { max-width: 100%; } img { height: auto; }');

})();
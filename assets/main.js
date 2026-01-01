(function () {
  // current path -> active nav
  const path = (location.pathname || "/").toLowerCase();
  const normalize = (p) => (p.endsWith("/") ? p : p);

  function setActiveLinks() {
    const links = document.querySelectorAll('[data-nav-link]');
    links.forEach(a => {
      const href = (a.getAttribute('href') || '').toLowerCase();
      // Treat "/" and "/index.html" as same
      const isHome = (path === "/" || path.endsWith("/index.html"));
      const match =
        (isHome && (href === "/" || href.endsWith("/index.html"))) ||
        (!isHome && href && path.endsWith(href.replace(/^.*\//, '/')));

      if (match) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  // hamburger
  const burger = document.querySelector('[data-burger]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('show');
    });
  }

  // Safariでも指導者画像がグレー→カラー：hover依存ではなくclick/tapで切り替え
  // （PCは hover でもカラーに）
  document.querySelectorAll('[data-coach-card]').forEach(card => {
    const toggle = () => card.classList.toggle('is-active');

    // iOS Safariの「最初のタップがhover扱い」問題を避けるため click で確実に切り替え
    card.addEventListener('click', (e) => {
      // リンクがあればリンク優先したいので、リンククリック時はtoggleしない
      const target = e.target;
      if (target && target.closest && target.closest('a')) return;
      toggle();
    }, {passive: true});
  });

  // results accordion
  document.querySelectorAll('[data-accordion]').forEach(acc => {
    const head = acc.querySelector('[data-acc-head]');
    if (!head) return;
    head.addEventListener('click', () => {
      acc.classList.toggle('is-open');
    });
  });

  // Ensure active links
  setActiveLinks();

  // close mobile menu on navigation
  document.querySelectorAll('[data-mobile-menu] a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu?.classList.remove('show');
    });
  });
})();


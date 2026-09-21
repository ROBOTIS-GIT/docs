/**
 * Mega-menu sticky behaviour.
 *
 *   - On mouseenter for a left-side category (.mega-menu__category):
 *     - Apply the --active class to the category and its matching panel.
 *     - Remove --active from the other categories and panels.
 *   - There is no mouseleave handler. The active panel persists until another
 *     category is hovered, including while the pointer moves into the panel.
 *
 *   Docusaurus uses client-side routing, so the navbar DOM can be rebuilt
 *   during navigation. A MutationObserver initializes newly added mega-menus.
 */

if (typeof window !== 'undefined') {
  const initialized = new WeakSet();

  function isKoreanLocale() {
    return (
      window.location.pathname === '/ko' ||
      window.location.pathname.startsWith('/ko/')
    );
  }

  function localizeMenuLinks(menu) {
    menu
      .querySelectorAll('a[href^="/docs/"], a[href^="/ko/docs/"]')
      .forEach((link) => {
        const href = link.getAttribute('href');
        if (!href) return;

        if (isKoreanLocale() && href.startsWith('/docs/')) {
          link.setAttribute('href', `/ko${href}`);
          return;
        }

        if (!isKoreanLocale() && href.startsWith('/ko/docs/')) {
          link.setAttribute('href', href.slice(3));
        }
      });
  }

  function localizeHrefForCurrentLocale(href) {
    if (isKoreanLocale() && href.startsWith('/docs/')) {
      return `/ko${href}`;
    }

    if (!isKoreanLocale() && href.startsWith('/ko/docs/')) {
      return href.slice(3);
    }

    return href;
  }

  document.addEventListener(
    'click',
    (event) => {
      if (!(event.target instanceof Element)) return;

      const link = event.target.closest('.mega-menu a[href]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (
        !href ||
        (!href.startsWith('/docs/') && !href.startsWith('/ko/docs/'))
      ) {
        return;
      }

      const localizedHref = localizeHrefForCurrentLocale(href);
      if (localizedHref === href) return;

      event.preventDefault();
      window.location.assign(localizedHref);
    },
    true,
  );

  function init(menu) {
    localizeMenuLinks(menu);

    if (initialized.has(menu)) return;
    initialized.add(menu);

    const categories = menu.querySelectorAll('.mega-menu__category');
    const panels = menu.querySelectorAll('.mega-menu__panel');
    if (!categories.length || !panels.length) return;

    const isNavbarSidebar = Boolean(menu.closest('.navbar-sidebar'));

    function activateCategory(cat) {
      const target = cat.dataset.cat;
      if (isNavbarSidebar) {
        menu.classList.add('mega-menu--panel-open');
      }
      categories.forEach((c) =>
        c.classList.toggle('mega-menu__category--active', c === cat),
      );
      panels.forEach((p) =>
        p.classList.toggle(
          'mega-menu__panel--active',
          p.dataset.panel === target,
        ),
      );
    }

    if (isNavbarSidebar) {
      menu.classList.remove('mega-menu--panel-open');
      categories.forEach((c) =>
        c.classList.remove('mega-menu__category--active'),
      );
      panels.forEach((p) => p.classList.remove('mega-menu__panel--active'));
    } else {
      // Default to the first category and its panel.
      activateCategory(categories[0]);
    }

    categories.forEach((cat) => {
      const handleSidebarActivate = (event) => {
        if (!isNavbarSidebar) return;
        event.preventDefault();
        event.stopPropagation();
        activateCategory(cat);
      };

      cat.addEventListener('mouseenter', () => activateCategory(cat));
      cat.addEventListener('focus', () => activateCategory(cat));
      cat.addEventListener('pointerdown', handleSidebarActivate);
      cat.addEventListener('click', handleSidebarActivate);
    });
  }

  function setupAll() {
    document.querySelectorAll('.mega-menu').forEach(init);
  }

  // Initial page load.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAll);
  } else {
    setupAll();
  }

  // Initialize mega-menus added after SPA navigation.
  const observer = new MutationObserver(() => setupAll());
  observer.observe(document.body, {childList: true, subtree: true});
}

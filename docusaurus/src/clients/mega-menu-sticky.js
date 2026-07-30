/**
 * Mega-menu sticky behaviour.
 *
 *   - 좌측 카테고리(.mega-menu__category) 에 mouseenter 시
 *     - 자기 자신 + 대응 .mega-menu__panel 에 --active class 부여
 *     - 다른 카테고리/패널의 --active 제거
 *   - mouseleave 핸들러는 두지 않음 → 한 번 활성화된 panel 은 다른 카테고리를
 *     hover 하기 전까지 유지 (마우스가 우측 panel 영역으로 이동해도 sticky)
 *
 *   Docusaurus 는 client-side routing 이라 navbar DOM 이 페이지 전환 시
 *   재구축될 수 있음. MutationObserver 로 새 mega-menu 가 붙으면 자동 init.
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
      // 기본 활성: 첫 번째 카테고리 + 첫 번째 패널
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

  // 첫 페이지 로드
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAll);
  } else {
    setupAll();
  }

  // SPA 라우팅 후에도 새로 추가된 mega-menu 자동 초기화
  const observer = new MutationObserver(() => setupAll());
  observer.observe(document.body, {childList: true, subtree: true});
}

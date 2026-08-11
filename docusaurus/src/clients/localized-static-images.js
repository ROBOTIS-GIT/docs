/**
 * Keep root-relative static image paths working when a non-default locale is
 * served by itself in development (for example, `docusaurus start --locale ko`).
 *
 * The localized development server exposes static assets under its locale
 * base URL (`/ko/img/...`), while much of the existing documentation uses
 * root-relative `/img/...` paths.
 */

if (typeof window !== 'undefined') {
  function isKoreanLocale() {
    return (
      window.location.pathname === '/ko' ||
      window.location.pathname.startsWith('/ko/')
    );
  }

  function localizeImage(image) {
    const src = image.getAttribute('src');
    if (!src) return;

    if (isKoreanLocale() && src.startsWith('/img/')) {
      image.setAttribute('src', `/ko${src}`);
      return;
    }

    if (!isKoreanLocale() && src.startsWith('/ko/img/')) {
      image.setAttribute('src', src.slice(3));
    }
  }

  function localizeImages(root) {
    if (root instanceof HTMLImageElement) {
      localizeImage(root);
    }

    if (root instanceof Element || root instanceof Document) {
      root
        .querySelectorAll('img[src^="/img/"], img[src^="/ko/img/"]')
        .forEach(localizeImage);
    }
  }

  function setup() {
    localizeImages(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          localizeImages(node);
        }
      });
    });
  });

  observer.observe(document.body, {childList: true, subtree: true});
}

/**
 * Navbar search compact mode.
 *
 * The local-search navbar input is rendered as a normal search field. CSS keeps
 * it visually compact; this script marks its root so clicking the icon can
 * expand the actual input without targeting broad generated class names.
 */

if (typeof window !== 'undefined') {
  const EXPANDED_CLASS = 'navbar-search-icon-shell--expanded';
  const ROOT_CLASS = 'navbar-search-icon-shell';
  const SEARCH_INPUT_SELECTOR = '.navbar input, .navbar .navbar__search-input';
  const SEARCH_ROOT_SELECTOR =
    '[class*="navbarSearchContainer"], [class*="searchBarContainer"], .navbar__search';

  const roots = new Set();
  const initialized = new WeakSet();
  let listenersBound = false;

  function findSearchRoot(input) {
    return input.closest(SEARCH_ROOT_SELECTOR) || input.parentElement;
  }

  function setExpanded(root, expanded) {
    root.classList.toggle(EXPANDED_CLASS, expanded);
  }

  function isExpanded(root) {
    return root.classList.contains(EXPANDED_CLASS);
  }

  function updatePosition(root) {
    const rect = root.getBoundingClientRect();
    const right = Math.max(8, window.innerWidth - rect.right);
    const top = Math.round(rect.bottom + 8);
    const width = Math.round(Math.min(280, Math.max(220, rect.right - 16)));

    root.style.setProperty('--navbar-search-panel-right', `${right}px`);
    root.style.setProperty('--navbar-search-panel-top', `${top}px`);
    root.style.setProperty('--navbar-search-dropdown-top', `${top + 44}px`);
    root.style.setProperty('--navbar-search-panel-width', `${width}px`);
  }

  function expand(root) {
    updatePosition(root);
    setExpanded(root, true);
  }

  function collapseAll(except = null) {
    roots.forEach((root) => {
      if (root !== except) setExpanded(root, false);
    });
  }

  function updateExpandedPositions() {
    roots.forEach((root) => {
      if (isExpanded(root)) updatePosition(root);
    });
  }

  function bindSharedListeners() {
    if (listenersBound) return;
    listenersBound = true;

    document.addEventListener('pointerdown', (event) => {
      if (!(event.target instanceof Node)) {
        collapseAll();
        return;
      }

      for (const root of roots) {
        if (root.contains(event.target)) return;
      }
      collapseAll();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') collapseAll();
    });

    window.addEventListener('resize', updateExpandedPositions);
    window.addEventListener('scroll', updateExpandedPositions, true);
  }

  function initSearch(input) {
    const root = findSearchRoot(input);
    if (!root || initialized.has(root)) return;

    initialized.add(root);
    roots.add(root);
    root.classList.add(ROOT_CLASS);
    bindSharedListeners();

    root.addEventListener('pointerdown', () => {
      collapseAll(root);
      expand(root);
      window.setTimeout(() => input.focus(), 0);
    });

    input.addEventListener('focus', () => {
      collapseAll(root);
      expand(root);
    });
  }

  function setupAll() {
    document.querySelectorAll(SEARCH_INPUT_SELECTOR).forEach(initSearch);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAll);
  } else {
    setupAll();
  }

  const observer = new MutationObserver(setupAll);
  observer.observe(document.body, {childList: true, subtree: true});
}

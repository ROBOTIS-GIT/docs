/**
 * Navbar search compact mode.
 *
 * The local-search navbar input is rendered as a normal search field. CSS keeps
 * it visually compact; this script marks its root so clicking the icon can
 * expand the actual input without targeting broad generated class names.
 */

if (typeof window !== 'undefined') {
  const EXPANDED_CLASS = 'navbar-search-icon-shell--expanded';
  const DROPDOWN_CLASS = 'navbar-search-dropdown';
  const INNER_CLASS = 'navbar-search-icon-inner';
  const LOADING_CLASS = 'navbar-search-loading';
  const ROOT_CLASS = 'navbar-search-icon-shell';
  const SEARCH_INPUT_SELECTOR = '.navbar input, .navbar .navbar__search-input';
  const SEARCH_ROOT_SELECTOR =
    '[class*="navbarSearchContainer"], [class*="searchBarContainer"], .navbar__search';
  const DROPDOWN_SELECTOR =
    '[class*="dropdownMenu"], [class*="DropdownMenu"], [class*="dropdown-menu"], .aa-dropdown-menu, .ds-dropdown-menu';
  const INNER_SELECTOR =
    '[class*="searchBar"], [class*="SearchBar"], [class*="navbarSearch"], [class*="NavbarSearch"], [class*="searchContainer"], [class*="SearchContainer"], .algolia-autocomplete';
  const LOADING_SELECTOR = '[class*="loading"], [class*="Loading"]';

  const roots = new Set();
  const initialized = new WeakSet();
  let listenersBound = false;

  function findSearchRoot(input) {
    const navbarItems = input.closest('.navbar__items');
    let root = input.closest(SEARCH_ROOT_SELECTOR) || input.parentElement;

    if (!navbarItems || !root) return root;

    while (
      root.parentElement &&
      root.parentElement !== navbarItems &&
      navbarItems.contains(root.parentElement)
    ) {
      root = root.parentElement;
    }

    return root;
  }

  function setExpanded(root, expanded) {
    root.classList.toggle(EXPANDED_CLASS, expanded);
  }

  function collapse(root) {
    setExpanded(root, false);

    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && root.contains(activeElement)) {
      activeElement.blur();
    }
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
      if (root !== except) collapse(root);
    });
  }

  function updateExpandedPositions() {
    roots.forEach((root) => {
      if (isExpanded(root)) updatePosition(root);
    });
  }

  function markSearchElements(root) {
    root.querySelectorAll(INNER_SELECTOR).forEach((element) => {
      if (element !== root) element.classList.add(INNER_CLASS);
    });

    root.querySelectorAll(DROPDOWN_SELECTOR).forEach((element) => {
      element.classList.add(DROPDOWN_CLASS);
    });

    root.querySelectorAll(LOADING_SELECTOR).forEach((element) => {
      element.classList.add(LOADING_CLASS);
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
    markSearchElements(root);
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
    roots.forEach(markSearchElements);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupAll);
  } else {
    setupAll();
  }

  const observer = new MutationObserver(setupAll);
  observer.observe(document.body, {childList: true, subtree: true});
}

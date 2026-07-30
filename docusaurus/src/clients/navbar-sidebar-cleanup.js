/**
 * Hide duplicated utility controls inside Docusaurus' mobile sidebar.
 * The top-right navbar language and theme controls stay visible.
 */

if (typeof window !== 'undefined') {
  const SIDEBAR_ITEM_SELECTOR = '.menu__list-item, .navbar__item, .dropdown';
  const LOCALE_ICON_SELECTOR =
    'svg[class*="iconLanguage"], svg.iconLanguage, [class*="iconLanguage"]';
  const THEME_CONTROL_SELECTOR =
    '[class*="colorModeToggle"], [class*="toggleButton"]';

  function markClosestItem(element, className) {
    element.closest(SIDEBAR_ITEM_SELECTOR)?.classList.add(className);
  }

  function markSidebarUtilityItems() {
    document.querySelectorAll('.navbar-sidebar').forEach((sidebar) => {
      sidebar
        .querySelectorAll(LOCALE_ICON_SELECTOR)
        .forEach((icon) => markClosestItem(icon, 'navbar-sidebar__locale-item'));

      sidebar
        .querySelectorAll(THEME_CONTROL_SELECTOR)
        .forEach((control) =>
          markClosestItem(control, 'navbar-sidebar__theme-item'),
        );
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markSidebarUtilityItems);
  } else {
    markSidebarUtilityItems();
  }

  const observer = new MutationObserver(markSidebarUtilityItems);
  observer.observe(document.body, {childList: true, subtree: true});
}

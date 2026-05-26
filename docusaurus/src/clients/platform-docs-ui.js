/**
 * Platform docs UI enhancements.
 *
 * Restores lightweight client-side behaviour that previously lived inside
 * migrated markdown documents:
 * - colorize control-table rows by their "Area" column value
 * - re-apply after SPA navigation / DOM updates
 */

if (typeof window !== 'undefined') {
  let timer = null;

  function applyControlTableAreaClasses() {
    document.querySelectorAll('.control-table-page table').forEach((table) => {
      const headerCells = Array.from(table.querySelectorAll('th'));
      const areaColumnIndex = headerCells.findIndex(
        (cell) => cell.textContent.trim().toLowerCase() === 'area',
      );

      table.querySelectorAll('tr').forEach((row) => {
        row.classList.remove('area-ram', 'area-eeprom');
      });
      table.querySelectorAll('td').forEach((cell) => {
        cell.classList.remove('area-ram', 'area-eeprom');
      });

      if (areaColumnIndex < 0) return;

      table.querySelectorAll('tr').forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (!cells.length || cells.length <= areaColumnIndex) return;

        const areaCell = cells[areaColumnIndex];
        const value = areaCell.textContent.trim().toUpperCase();

        if (value === 'RAM') {
          row.classList.add('area-ram');
          areaCell.classList.add('area-ram');
        } else if (value === 'EEPROM' || value === 'ROM') {
          row.classList.add('area-eeprom');
          areaCell.classList.add('area-eeprom');
        }
      });
    });
  }

  function scheduleApply() {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(applyControlTableAreaClasses, 60);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleApply);
  } else {
    scheduleApply();
  }

  window.addEventListener('load', scheduleApply);
  window.addEventListener('click', scheduleApply);

  const observer = new MutationObserver(() => scheduleApply());
  observer.observe(document.body, {childList: true, subtree: true});
}

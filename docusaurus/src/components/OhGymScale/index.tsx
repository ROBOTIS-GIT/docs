import {useEffect} from 'react';

const DESIGN_WIDTH = 1240;
const INDEX_GAP = 25.6;
const INDEX_PANEL_WIDTH = 156;
const PAGE_GUTTER = 32;

function updateOhGymScale(page: HTMLElement) {
  const frame = page.closest<HTMLElement>('.ohgym-scale-frame');
  const frameRect = frame?.getBoundingClientRect();
  const availableWidth = Math.max(frameRect?.width ?? window.innerWidth - PAGE_GUTTER, 1);
  const scale = Math.min(1, availableWidth / DESIGN_WIDTH);
  const availableRightSpace = Math.max(
    window.innerWidth - (frameRect?.right ?? availableWidth) - PAGE_GUTTER / 2,
    0,
  );
  const maxIndexOffset = availableRightSpace / scale - INDEX_PANEL_WIDTH;
  const indexOffset = Math.min(INDEX_GAP, Math.max(-INDEX_PANEL_WIDTH, maxIndexOffset));

  page.style.setProperty('--ohgym-page-scale', scale.toFixed(4));
  page.style.setProperty('--ohgym-index-offset', `${indexOffset.toFixed(2)}px`);
  frame?.style.setProperty('--ohgym-frame-height', `${(page.scrollHeight * scale).toFixed(2)}px`);
}

export default function OhGymScale() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>('.ohgym-page');
    const frame = page?.closest<HTMLElement>('.ohgym-scale-frame');

    if (!page || !frame) {
      return undefined;
    }

    const update = () => updateOhGymScale(page);

    let frameId = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(update);
    };

    update();
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(page);
    resizeObserver.observe(frame);

    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('orientationchange', scheduleUpdate);
    window.addEventListener('load', scheduleUpdate);
    window.visualViewport?.addEventListener('resize', scheduleUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('orientationchange', scheduleUpdate);
      window.removeEventListener('load', scheduleUpdate);
      window.visualViewport?.removeEventListener('resize', scheduleUpdate);
    };
  }, []);

  return null;
}

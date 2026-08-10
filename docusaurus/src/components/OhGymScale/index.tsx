import {useEffect} from 'react';

const DESIGN_WIDTH = 1240;
const PAGE_GUTTER = 32;

function updateOhGymScale(page: HTMLElement) {
  const availableWidth = Math.max(window.innerWidth - PAGE_GUTTER, 1);
  const scale = Math.min(1, availableWidth / DESIGN_WIDTH);

  page.style.setProperty('--ohgym-page-scale', scale.toFixed(4));
}

export default function OhGymScale() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>('.ohgym-page');

    if (!page) {
      return undefined;
    }

    const update = () => updateOhGymScale(page);

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return null;
}

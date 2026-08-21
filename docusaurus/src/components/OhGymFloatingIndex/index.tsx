import {useEffect} from 'react';

const SECTION_IDS = [
  'introduction',
  'oh-gym',
  'oh-seminar',
  'oh-challenge',
  'oh-showcase',
];

function setActiveIndex(activeId: string) {
  document.querySelectorAll<HTMLAnchorElement>('.ohgym-floating-index a').forEach((link) => {
    const isActive = link.hash === `#${activeId}`;

    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function getCurrentSectionId(sections: HTMLElement[]) {
  const anchorY = window.innerHeight * 0.38;
  let currentId = sections[0]?.id ?? SECTION_IDS[0];

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();

    if (rect.top <= anchorY) {
      currentId = section.id;
    }
  });

  return currentId;
}

export default function OhGymFloatingIndex() {
  useEffect(() => {
    if (window.matchMedia('(max-width: 1019px)').matches) {
      return undefined;
    }

    const page = document.querySelector<HTMLElement>('.ohgym-page');
    const index = document.querySelector<HTMLElement>('.ohgym-floating-index');
    const panel = document.querySelector<HTMLElement>('.ohgym-floating-index__panel');
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (section): section is HTMLElement => section !== null,
    );

    if (!page || !index || !panel || sections.length === 0) {
      return undefined;
    }

    let activeFrameId = 0;
    let motionFrameId = 0;
    let currentY = 0;
    let targetY = 0;

    const getTargetY = () => {
      const pageRect = page.getBoundingClientRect();
      const pageHeight = page.offsetHeight;
      const panelHeight = panel.offsetHeight;
      const pageTop = pageRect.top + window.scrollY;
      const viewportOffset = window.innerHeight / 2 - panelHeight / 2;
      const rawY = window.scrollY - pageTop + viewportOffset;
      const maxY = Math.max(pageHeight - panelHeight, 0);

      return Math.min(Math.max(rawY, 0), maxY);
    };

    const animateIndex = () => {
      currentY += (targetY - currentY) * 0.14;
      index.style.setProperty('--ohgym-index-y', `${currentY.toFixed(2)}px`);

      if (Math.abs(targetY - currentY) > 0.5) {
        motionFrameId = requestAnimationFrame(animateIndex);
        return;
      }

      currentY = targetY;
      index.style.setProperty('--ohgym-index-y', `${currentY.toFixed(2)}px`);
      motionFrameId = 0;
    };

    const updateIndexPosition = () => {
      targetY = getTargetY();

      if (motionFrameId === 0) {
        motionFrameId = requestAnimationFrame(animateIndex);
      }
    };

    const updateActiveIndex = () => {
      cancelAnimationFrame(activeFrameId);
      activeFrameId = requestAnimationFrame(() => setActiveIndex(getCurrentSectionId(sections)));
    };

    const updateIndex = () => {
      updateActiveIndex();
      updateIndexPosition();
    };

    const applyLink = index.querySelector<HTMLAnchorElement>('a[href="#ohgym-apply"]');
    const applyTarget = document.getElementById('ohgym-apply');
    const handleApplyLinkClick = (event: MouseEvent) => {
      if (!applyTarget) {
        return;
      }

      event.preventDefault();
      applyTarget.scrollIntoView({behavior: 'smooth', block: 'center'});
      window.history.replaceState(null, '', '#ohgym-apply');
    };

    currentY = getTargetY();
    targetY = currentY;
    index.style.setProperty('--ohgym-index-y', `${currentY.toFixed(2)}px`);
    updateActiveIndex();

    window.addEventListener('scroll', updateIndex, {passive: true});
    window.addEventListener('orientationchange', updateIndex);
    applyLink?.addEventListener('click', handleApplyLinkClick);

    return () => {
      cancelAnimationFrame(activeFrameId);
      cancelAnimationFrame(motionFrameId);
      window.removeEventListener('scroll', updateIndex);
      window.removeEventListener('orientationchange', updateIndex);
      applyLink?.removeEventListener('click', handleApplyLinkClick);
    };
  }, []);

  return null;
}

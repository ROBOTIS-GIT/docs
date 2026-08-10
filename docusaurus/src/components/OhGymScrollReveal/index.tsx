import {useEffect} from 'react';

const REVEAL_SELECTORS = [
  '.ohgym-open-logo',
  '.ohgym-open-copy',
  '.ohgym-banner',
  '.ohgym-copy-block',
  '.ohgym-statement',
  '.ohgym-card',
  '.ohgym-motion-wall img',
  '.ohgym-gear-system',
  '.ohgym-generation > h2',
  '.ohgym-section-lead',
  '.ohgym-trainer > h3',
  '.ohgym-stat-panel',
  '.ohgym-media-section',
  '.ohgym-training-card',
  '.ohgym-seminar > h2',
  '.ohgym-section-logo',
  '.ohgym-section-copy',
  '.ohgym-seminar-image-card',
  '.ohgym-challenge-callout',
  '.ohgym-challenge-image-card',
  '.ohgym-shorts-section > h2',
  '.ohgym-shorts-card',
  '.ohgym-closing > img',
  '.ohgym-closing > h2',
  '.ohgym-contact-card',
].join(',');

function setRevealDelay(element: HTMLElement) {
  const parent = element.parentElement;

  if (!parent) {
    return;
  }

  const siblings = Array.from(parent.children).filter((child) =>
    child.matches(
      '.ohgym-card, .ohgym-stat-card, .ohgym-motion-wall img, .ohgym-school, .ohgym-seminar-image-card, .ohgym-challenge-image-card, .ohgym-contact-card',
    ),
  );
  const index = siblings.indexOf(element);

  if (index >= 0) {
    element.style.setProperty('--ohgym-reveal-delay', `${Math.min(index * 70, 280)}ms`);
  }
}

function resetRouletteNumbers(element: Element) {
  element.querySelectorAll<HTMLElement>('.ohgym-roulette-number').forEach((numberElement) => {
    numberElement.textContent = '0';
  });
}

function setFinalRouletteNumbers(element: Element) {
  element.querySelectorAll<HTMLElement>('.ohgym-roulette-number').forEach((numberElement) => {
    numberElement.textContent = numberElement.dataset.target ?? '0';
  });
}

export default function OhGymScrollReveal() {
  useEffect(() => {
    const page = document.querySelector<HTMLElement>('.ohgym-page');

    if (!page) {
      return undefined;
    }

    const elements = Array.from(
      new Set(Array.from(page.querySelectorAll<HTMLElement>(REVEAL_SELECTORS))),
    );

    elements.forEach((element) => {
      element.classList.add('ohgym-reveal');
      setRevealDelay(element);
    });

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rouletteFrameIds = new Map<Element, number>();

    const stopRoulette = (element: Element) => {
      const frameId = rouletteFrameIds.get(element);

      if (frameId !== undefined) {
        cancelAnimationFrame(frameId);
        rouletteFrameIds.delete(element);
      }
    };

    const runRoulette = (element: Element) => {
      const numberElements = Array.from(
        element.querySelectorAll<HTMLElement>('.ohgym-roulette-number'),
      );

      if (numberElements.length === 0) {
        return;
      }

      stopRoulette(element);

      const duration = 960;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const settleProgress = Math.max((progress - 0.55) / 0.45, 0);
        const easedSettle = 1 - Math.pow(1 - settleProgress, 3);

        numberElements.forEach((numberElement) => {
          const target = Number(numberElement.dataset.target ?? 0);
          const spinValue = Math.floor(Math.random() * (target + 12));
          const settleValue = Math.round(target * easedSettle);

          numberElement.textContent = String(progress < 0.55 ? spinValue : settleValue);
        });

        if (progress < 1) {
          rouletteFrameIds.set(element, requestAnimationFrame(tick));
          return;
        }

        setFinalRouletteNumbers(element);
        rouletteFrameIds.delete(element);
      };

      resetRouletteNumbers(element);
      rouletteFrameIds.set(element, requestAnimationFrame(tick));
    };

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      elements.forEach(setFinalRouletteNumbers);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            runRoulette(entry.target);
          } else {
            entry.target.classList.remove('is-visible');
            stopRoulette(entry.target);
            resetRouletteNumbers(entry.target);
          }
        });
      },
      {
        threshold: 0.14,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      rouletteFrameIds.forEach((frameId) => cancelAnimationFrame(frameId));
      rouletteFrameIds.clear();
    };
  }, []);

  return null;
}

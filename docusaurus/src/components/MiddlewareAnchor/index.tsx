import {useEffect} from 'react';
import {useLocation} from '@docusaurus/router';

export default function MiddlewareAnchor() {
  const {hash} = useLocation();

  useEffect(() => {
    if (hash !== '#middleware') return;

    const target = document.getElementById('middleware');
    const content = document.querySelector('.theme-doc-markdown');
    if (!target || !content) return;

    let frame = 0;
    const align = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => target.scrollIntoView());
    };
    const observer = new ResizeObserver(align);
    const stop = () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, stop));
    };
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    events.forEach(event => window.addEventListener(event, stop, {once: true, passive: true}));
    const timeout = window.setTimeout(stop, 10000);
    observer.observe(content);
    align();
    return stop;
  }, [hash]);

  return null;
}

import React, {useEffect, useRef, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

export default function CycloStudioWorkflow() {
  const artwork = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const logoUrl = useBaseUrl('/img/common/cyclo/cyclo_studio.png');

  useEffect(() => {
    const element = artwork.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;

    let inView = false;
    const update = () => setVisible(inView && document.visibilityState === 'visible');
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener('visibilitychange', update);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return (
    <figure className={styles.figure} data-moving={visible && !paused}>
      <div className={styles.artwork} ref={artwork}>
        <img
          className={styles.logo}
          src={logoUrl}
          alt="Cyclo Studio"
          width={805}
          height={100}
        />
        <span className={styles.dot} aria-hidden="true" />
        <ul className={styles.orbit} role="list" aria-label="Cyclo Studio workflow">
          <li className={styles.data}>Data</li>
          <li className={styles.train}>Train</li>
          <li className={styles.deploy}>Deploy</li>
          <li className={styles.share}>Share</li>
        </ul>
      </div>
      <figcaption className={styles.caption}>
        <button className={styles.control} type="button" onClick={() => setPaused((value) => !value)}>
          {paused ? 'Resume animation' : 'Pause animation'}
        </button>
      </figcaption>
    </figure>
  );
}

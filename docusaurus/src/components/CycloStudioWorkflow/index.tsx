import React, {useEffect, useRef, useState} from 'react';
import Translate, {translate} from '@docusaurus/Translate';
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
        <ul
          className={styles.orbit}
          role="list"
          aria-label={translate({id: 'cycloStudio.workflow.label', message: 'Cyclo Studio workflow'})}
        >
          <li className={styles.data}><Translate id="cycloStudio.workflow.data">Data</Translate></li>
          <li className={styles.train}><Translate id="cycloStudio.workflow.train">Train</Translate></li>
          <li className={styles.deploy}><Translate id="cycloStudio.workflow.deploy">Deploy</Translate></li>
          <li className={styles.share}><Translate id="cycloStudio.workflow.share">Share</Translate></li>
        </ul>
      </div>
      <figcaption className={styles.caption}>
        <button className={styles.control} type="button" onClick={() => setPaused((value) => !value)}>
          {paused
            ? <Translate id="cycloStudio.workflow.resume">Resume animation</Translate>
            : <Translate id="cycloStudio.workflow.pause">Pause animation</Translate>}
        </button>
      </figcaption>
    </figure>
  );
}

import React, {useId, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import packages from './steps.json';
import styles from './styles.module.css';

export default function AiWorkerUnboxing() {
  const [selection, setSelection] = useState({packageIndex: 0, stepIndex: 0, playback: 0});
  const headingId = useId();
  const baseUrl = useBaseUrl('/img/systems/aiworker/quick_start_guide/setup_hardware/unboxing/');
  const packaging = packages[selection.packageIndex];
  const step = packaging.steps[selection.stepIndex];
  const mediaPath = `${baseUrl}${packaging.id}/${step.id}`;

  function selectStep(packageIndex: number, stepIndex: number) {
    setSelection(previous => ({packageIndex, stepIndex, playback: previous.playback + 1}));
  }

  return (
    <div className={styles.guide} role="group" aria-label="Unboxing guide">
      <div className={styles.packages} role="group" aria-label="Packaging type">
        {packages.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={item.label}
            aria-pressed={index === selection.packageIndex}
            className={styles.packageCard}
            onClick={() => selectStep(index, 0)}>
            <span className={styles.packageName}>{item.label}</span>
            <span className={styles.packageDescription}>{item.description}</span>
            <span className={styles.packageCount}>{item.steps.length} steps</span>
          </button>
        ))}
      </div>
      <div className={styles.layout}>
        <nav aria-label="Unboxing steps">
          <ol className={styles.steps}>
            {packaging.steps.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={index === selection.stepIndex ? 'step' : undefined}
                  className={styles.stepButton}
                  onClick={() => selectStep(selection.packageIndex, index)}>
                  <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
                  <span>{item.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <div className={styles.detail}>
          <video
            key={`${mediaPath}-${selection.playback}`}
            className={styles.video}
            src={`${mediaPath}.mp4`}
            poster={`${mediaPath}.jpg`}
            aria-labelledby={headingId}
            controls
            playsInline
            muted
            loop
            autoPlay={selection.playback > 0}
            preload="none">
            Your browser does not support embedded video. <a href={`${mediaPath}.mp4`}>Open this step&apos;s video.</a>
          </video>
          <div className={styles.instruction} aria-live="polite" aria-atomic="true">
            <p className={styles.progress}>{packaging.label} · Step {selection.stepIndex + 1} of {packaging.steps.length}</p>
            <h3 id={headingId} className={styles.title}>{step.title}</h3>
            <p className={styles.description}>{step.description}</p>
          </div>
          <div className={styles.navigation}>
            <button
              type="button"
              className="button button--secondary button--outline"
              disabled={selection.stepIndex === 0}
              onClick={() => selectStep(selection.packageIndex, selection.stepIndex - 1)}>
              Previous
            </button>
            <button
              type="button"
              className="button button--primary button--outline"
              disabled={selection.stepIndex === packaging.steps.length - 1}
              onClick={() => selectStep(selection.packageIndex, selection.stepIndex + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

function Router() {
  return (
    <svg className={styles.deviceIcon} viewBox="0 0 120 100" fill="none" aria-hidden="true">
      <path d="M27 62V30M93 62V30" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <rect x="15" y="60" width="90" height="26" rx="8" className={styles.deviceBody} stroke="currentColor" strokeWidth="2.5" />
      <path d="M72 73h6m6 0h6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="73" r="3" className={styles.statusLight} />
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M43 25a25 25 0 0 1 34 0M50 34a15 15 0 0 1 20 0" />
        <circle cx="60" cy="43" r="2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

function UserPc() {
  return (
    <div className={styles.device}>
      <svg className={styles.deviceIcon} viewBox="0 0 120 100" fill="none" aria-hidden="true">
        <rect x="20" y="22" width="80" height="53" rx="5" className={styles.deviceBody} stroke="currentColor" strokeWidth="2.5" />
        <path d="m47 40-9 8 9 8m26-16 9 8-9 8m-9-19-8 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 75 9 85h102l-11-10M48 85h24" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
      <strong>User PC</strong>
    </div>
  );
}

function Connection({label, wireless = false}: {label: string; wireless?: boolean}) {
  return (
    <div className={`${styles.connection} ${wireless ? styles.wireless : ''}`}>
      <span>{label}</span>
      <div className={styles.connectionLine} />
    </div>
  );
}

export default function AiWorkerNetworkDiagram({router}: {router: 'external' | 'built-in'}) {
  const builtIn = router === 'built-in';
  const robotImage = useBaseUrl('/img/systems/aiworker/quick_start_guide/aiworker_network_icon.png');
  const description = builtIn
    ? 'F2 and SG2: the router is inside AI WORKER. User PC connects to that built-in router over Wi-Fi.'
    : 'F1 and BG2: AI WORKER connects from its LAN port to an external router with a LAN cable. User PC connects to the same router over Wi-Fi or LAN.';

  return (
    <figure className={styles.diagram} role="img" aria-label={description}>
      <div className={`${styles.topology} ${builtIn ? styles.builtIn : ''}`} aria-hidden="true">
        <div className={styles.robot}>
          <strong className={styles.robotTitle}>AI WORKER</strong>
          <div className={styles.robotContents}>
            <img className={styles.robotImage} src={robotImage} alt="" loading="lazy" width="204" height="297" />
            {builtIn && (
              <div className={styles.internalRouter}>
                <Router />
                <strong>Built-in router</strong>
              </div>
            )}
          </div>
          {!builtIn && <span className={styles.port}>LAN port</span>}
        </div>

        {!builtIn && (
          <>
            <Connection label="LAN cable" />
            <div className={styles.device}>
              <Router />
              <strong>External router</strong>
            </div>
          </>
        )}

        <Connection label={builtIn ? 'Wi-Fi' : 'Wi-Fi / LAN'} wireless />
        <UserPc />
      </div>
    </figure>
  );
}

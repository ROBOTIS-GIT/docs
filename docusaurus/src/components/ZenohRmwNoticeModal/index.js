import React, {useEffect, useState} from 'react';
import {useLocation} from '@docusaurus/router';
import Link from '@docusaurus/Link';
import './styles.css';

const STORAGE_PREFIX = 'robotis-docs:zenoh-rmw-notice:v1';

const PLATFORM_NOTICES = [
  {
    id: 'aiworker',
    pathPrefix: '/docs/systems/aiworker',
    productName: 'AI Worker',
    sinceLabel: 'AI Worker 2.0.0',
    zenohDocPath: '/docs/systems/aiworker/quick_start_guide/setup_overview/zenoh_communication',
  },
  {
    id: 'omy',
    pathPrefix: '/docs/systems/omy',
    productName: 'OMY',
    sinceLabel: 'OPENMANIPULATOR package 5.0.0',
    zenohDocPath: '/docs/systems/omy/quick_start_guide/zenoh_communication',
  },
  {
    id: 'omx',
    pathPrefix: '/docs/systems/omx',
    productName: 'OMX',
    sinceLabel: 'OPENMANIPULATOR package 5.0.0',
    zenohDocPath: '/docs/systems/omx/specifications/zenoh_communication',
  },
  {
    id: 'hx5_d20',
    pathPrefix: '/docs/systems/hx5_d20',
    productName: 'ROBOTIS Hand',
    sinceLabel: 'ROBOTIS Hand 1.0.0',
    zenohDocPath: '/docs/systems/hx5_d20/quick_start_guide/zenoh_communication',
  },
];

function normalizePath(pathname) {
  return pathname.replace(/\/$/, '').replace(/^\/ko(?=\/docs)/, '');
}

function getNoticeForPath(pathname) {
  const normalized = normalizePath(pathname);

  if (normalized.endsWith('/zenoh_communication')) {
    return null;
  }

  return PLATFORM_NOTICES.find(({pathPrefix}) => normalized.startsWith(pathPrefix)) ?? null;
}

function isDismissed(noticeId) {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.localStorage.getItem(`${STORAGE_PREFIX}:${noticeId}`) === '1';
}

export default function ZenohRmwNoticeModal() {
  const location = useLocation();
  const notice = getNoticeForPath(location.pathname);
  const [open, setOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!notice || isDismissed(notice.id)) {
      setOpen(false);
      return;
    }

    setOpen(true);
    setDontShowAgain(false);
  }, [location.pathname, notice]);

  if (!open || !notice) {
    return null;
  }

  function closeModal() {
    if (dontShowAgain) {
      window.localStorage.setItem(`${STORAGE_PREFIX}:${notice.id}`, '1');
    }

    setOpen(false);
  }

  return (
    <div className="zenoh-rmw-notice">
      <div
        className="zenoh-rmw-notice__dialog"
        role="dialog"
        aria-labelledby="zenoh-rmw-notice-title"
        aria-modal="false">
        <button
          type="button"
          className="zenoh-rmw-notice__close"
          aria-label="Close"
          onClick={closeModal}>
          ×
        </button>
        <p className="zenoh-rmw-notice__label">RMW update</p>
        <h2 id="zenoh-rmw-notice-title">Zenoh is now the default RMW</h2>
        <p>
          Starting from <strong>{notice.sinceLabel}</strong>, {notice.productName} uses{' '}
          <strong>Zenoh RMW</strong> instead of Fast DDS.
        </p>
        <ul>
          <li>
            Start the <strong>Zenoh daemon</strong> before robot bringup. See the operation guides
            for <code>zenohd</code> or Cyclo Manager bringup steps.
          </li>
          <li>
            For external PC connection, network setup, and troubleshooting, see{' '}
            <Link to={notice.zenohDocPath}>Zenoh Communication</Link>.
          </li>
        </ul>
        <label className="zenoh-rmw-notice__checkbox">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(event) => setDontShowAgain(event.target.checked)}
          />
          <span>Do not show this again for {notice.productName}</span>
        </label>
        <div className="zenoh-rmw-notice__actions">
          <Link className="button button--primary" to={notice.zenohDocPath} onClick={closeModal}>
            Open Zenoh Communication
          </Link>
          <button type="button" className="button button--secondary" onClick={closeModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

import React, {useState} from 'react';
import './CycloDataArchitecture.css';

type Step = {
  id: string;
  name: string;
  caption: string;
  details: string[];
};

const steps: Step[] = [
  {
    id: 'ui',
    name: 'Web UI',
    caption: 'Pick the robot type',
    details: [
      'Set the robot type before recording or reviewing.',
      'Record and Data Tools share the same UI.',
    ],
  },
  {
    id: 'record',
    name: 'Record',
    caption: 'Capture episodes',
    details: [
      'Camera streams are saved as MP4 files with frame timestamps.',
      'Other ROS 2 topics are saved in MCAP format.',
      'Each save creates one episode.',
    ],
  },
  {
    id: 'tools',
    name: 'Data Tools',
    caption: 'Review, delete, merge',
    details: [
      'Replay camera streams alongside synchronized robot data.',
      'Delete failed or unwanted episodes.',
      'Merge datasets that were recorded separately.',
    ],
  },
  {
    id: 'output',
    name: 'Output',
    caption: 'Convert and share',
    details: [
      'Convert recorded rosbag2 datasets to LeRobot v2.1 or v3.0.',
      'Sensor, action, and video timelines are aligned during conversion.',
      'Upload datasets and download trained models through Hugging Face.',
    ],
  },
];

export default function CycloDataArchitecture(): React.JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = steps.find((s) => s.id === openId) ?? null;

  return (
    <div className="cdw">
      <ol className="cdw-steps">
        {steps.map((step, i) => (
          <li key={step.id} className="cdw-item">
            {i > 0 && <span className="cdw-arrow" aria-hidden="true" />}
            <button
              type="button"
              className={`cdw-step${openId === step.id ? ' cdw-step--open' : ''}`}
              aria-expanded={openId === step.id}
              aria-controls="cdw-panel"
              onClick={() => setOpenId(openId === step.id ? null : step.id)}
            >
              <span className="cdw-name">{step.name}</span>
              <span className="cdw-caption">{step.caption}</span>
            </button>
          </li>
        ))}
      </ol>

      <div id="cdw-panel" className="cdw-panel" role="region" aria-live="polite">
        {open ? (
          <ul>
            {open.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        ) : (
          <p className="cdw-hint">Select a step for details.</p>
        )}
      </div>
    </div>
  );
}

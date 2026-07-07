import React, {useState} from 'react';
import './CycloDataArchitecture.css';

type StepId = 'ui' | 'record' | 'tools' | 'outputs';

type FlowStep = {
  id: StepId;
  tag: string;
  title: string;
  summary: string;
  detailTag: string;
  details: string[];
  className: string;
  tagClassName: string;
  arrowClassName: string;
};

const flowSteps: FlowStep[] = [
  {
    id: 'ui',
    tag: 'Web UI',
    title: 'Operate Everything from UI',
    summary: 'Select the robot, open Record, and use Data Tools without leaving Cyclo Intelligence.',
    detailTag: 'UI Operation',
    details: [
      'Set the robot type before recording or reviewing data.',
      'Open Record and Data Tools from the same Cyclo Intelligence UI.',
      'Keep dataset collection, review, conversion, and transfer in one workflow.',
    ],
    className: 'ui-card',
    tagClassName: 'ui-tag',
    arrowClassName: 'ui-flow',
  },
  {
    id: 'record',
    tag: 'Record Page',
    title: 'Acquire Dataset',
    summary: 'Capture ROS 2 robot topics, camera streams, task metadata, and episode information.',
    detailTag: 'Dataset Acquisition',
    details: [
      'Camera streams are stored as MP4 files with frame timestamps.',
      'Non-camera ROS 2 topics are stored in MCAP format.',
      'Each save creates an episode dataset.',
    ],
    className: 'record-card',
    tagClassName: 'record-tag',
    arrowClassName: 'record-flow',
  },
  {
    id: 'tools',
    tag: 'Data Tools',
    title: 'Review and Prepare Dataset',
    summary: 'Review Episodes, delete bad episodes, merge datasets, or prepare the dataset for LeRobot conversion.',
    detailTag: 'Dataset Review and Editing',
    details: [
      'Use Review Episodes to visualize camera streams and synchronized robot data.',
      'Check whether each episode was captured correctly before training.',
      'Delete unnecessary or failed episodes.',
      'Merge multiple collected datasets.',
    ],
    className: 'tools-card',
    tagClassName: 'tools-tag',
    arrowClassName: 'tools-flow',
  },
  {
    id: 'outputs',
    tag: 'Outputs',
    title: 'LeRobot / Hugging Face',
    summary: 'Create LeRobot datasets and move datasets or models through Hugging Face.',
    detailTag: 'Dataset Output',
    details: [
      'Convert recorded rosbag2 datasets to LeRobot v2.1 and/or v3.0.',
      'Align sensor/action timelines and video frames during conversion.',
      'Upload or download datasets and models through Hugging Face.',
    ],
    className: 'output-card',
    tagClassName: 'convert-tag',
    arrowClassName: '',
  },
];

export default function CycloDataArchitecture(): React.JSX.Element {
  const [openStep, setOpenStep] = useState<StepId | null>(null);

  return (
    <section className="cyclo-data-architecture" aria-labelledby="cyclo-data-architecture-title">
      <div className="architecture-header">
        <div>
          <p id="cyclo-data-architecture-title" className="architecture-title">
            Cyclo Data System Architecture
          </p>
          <p className="architecture-summary">
            Cyclo Data is operated from the Web UI. The user records robot demonstrations,
            reviews the collected episodes, edits the dataset with Data Tools, converts it to
            LeRobot format, and uploads or downloads datasets and models through Hugging Face.
          </p>
        </div>
        <div className="legend" aria-label="Flow legend">
          <span><i className="dot ui-dot"></i>UI</span>
          <span><i className="dot record-dot"></i>record</span>
          <span><i className="dot tools-dot"></i>data tools</span>
          <span><i className="dot convert-dot"></i>convert</span>
          <span><i className="dot hub-dot"></i>Hub</span>
        </div>
      </div>

      <div className="primary-flow" aria-label="Cyclo Data primary workflow">
        {flowSteps.map((step, index) => {
          const isOpen = openStep === step.id;
          const detailId = `cyclo-data-detail-${step.id}`;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                className={`flow-card ${step.className}${isOpen ? ' is-open' : ''}`}
                aria-expanded={isOpen}
                aria-controls={detailId}
                onClick={() => setOpenStep(isOpen ? null : step.id)}
              >
                <span className="lane-tag-row">
                  <span className={`lane-tag ${step.tagClassName}`}>{step.tag}</span>
                  <span className="detail-toggle" aria-hidden="true">{isOpen ? '-' : '+'}</span>
                </span>
                <strong>{step.title}</strong>
                <span>{step.summary}</span>
              </button>

              {isOpen && (
                <div id={detailId} className={`step-detail-panel ${step.className}`}>
                  <span className={`lane-tag ${step.tagClassName}`}>{step.detailTag}</span>
                  <ul>
                    {step.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </div>
              )}

              {index < flowSteps.length - 1 && (
                <div className={`flow-arrow ${step.arrowClassName}`} aria-hidden="true">v</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
}

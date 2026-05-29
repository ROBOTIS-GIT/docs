import React from 'react';
import './CycloDataArchitecture.css';

export default function CycloDataArchitecture(): React.JSX.Element {
  return (
    <section className="cyclo-data-architecture" aria-labelledby="cyclo-data-architecture-title">
      <div className="architecture-header">
        <div>
          <p id="cyclo-data-architecture-title" className="architecture-title">
            Cyclo Data System Architecture
          </p>
          <p className="architecture-summary">
            Cyclo Data is operated from the Web UI. The user records robot demonstrations,
            edits the collected dataset with Data Tools, converts it to LeRobot format, and
            uploads or downloads datasets and models through Hugging Face.
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
        <article className="flow-card ui-card">
          <span className="lane-tag ui-tag">Web UI</span>
          <strong>Operate Everything from UI</strong>
          <span>Select the robot, open Record, and use Data Tools without leaving Cyclo Intelligence.</span>
        </article>

        <div className="flow-arrow ui-flow" aria-hidden="true">v</div>

        <article className="flow-card record-card">
          <span className="lane-tag record-tag">Record Page</span>
          <strong>Acquire Dataset</strong>
          <span>Capture ROS 2 robot topics, camera streams, task metadata, and episode information.</span>
        </article>

        <div className="flow-arrow record-flow" aria-hidden="true">v</div>

        <article className="flow-card tools-card">
          <span className="lane-tag tools-tag">Data Tools</span>
          <strong>Edit and Prepare Dataset</strong>
          <span>Delete episodes, merge datasets, or prepare the dataset for LeRobot conversion.</span>
        </article>

        <div className="flow-arrow tools-flow" aria-hidden="true">v</div>

        <article className="flow-card output-card">
          <span className="lane-tag convert-tag">Outputs</span>
          <strong>LeRobot / Hugging Face</strong>
          <span>Create LeRobot datasets and move datasets or models through Hugging Face.</span>
        </article>
      </div>

      <div className="details-grid" aria-label="Cyclo Data detailed operations">
        <article className="detail-card record-detail">
          <span className="lane-tag record-tag">Dataset Acquisition</span>
          <strong>Record</strong>
          <ul>
            <li>Camera streams are stored as MP4 files with frame timestamps.</li>
            <li>Non-camera ROS 2 topics are stored in MCAP format.</li>
            <li>Camera rotation is saved according to the robot config file.</li>
            <li>Each save creates an episode dataset.</li>
          </ul>
        </article>

        <article className="detail-card edit-detail">
          <span className="lane-tag tools-tag">Dataset Editing</span>
          <strong>Delete / Merge</strong>
          <ul>
            <li>Delete unnecessary or failed episodes.</li>
            <li>Merge multiple collected datasets.</li>
            <li>Keep the dataset organized before conversion.</li>
          </ul>
        </article>

        <article className="detail-card convert-detail">
          <span className="lane-tag convert-tag">Dataset Conversion</span>
          <strong>LeRobot Convert</strong>
          <ul>
            <li>Select the target FPS for LeRobot conversion.</li>
            <li>Align sensor/action timelines and video frames.</li>
            <li>Write LeRobot v2.1 and/or v3.0 output.</li>
          </ul>
        </article>

        <article className="detail-card hub-detail">
          <span className="lane-tag hub-tag">Repository Operation</span>
          <strong>Hugging Face</strong>
          <ul>
            <li>Upload collected or converted datasets.</li>
            <li>Download datasets for editing or conversion.</li>
            <li>Download models for later deployment.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}

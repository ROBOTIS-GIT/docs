import React from 'react';
import './CycloBrainArchitecture.css';

export default function CycloBrainArchitecture(): React.JSX.Element {
  return (
    <section className="cyclo-brain-architecture" aria-labelledby="cyclo-brain-architecture-title">
      <div className="architecture-header">
        <div>
          <p id="cyclo-brain-architecture-title" className="architecture-title">
            Cyclo Brain System Architecture
          </p>
          <p className="architecture-summary">
            Cyclo Brain separates command handling, model inference, open-source policy backends, and
            robot I/O into distinct runtime areas. The diagram below shows the system blocks first;
            detailed data flow is summarized after the diagram.
          </p>
        </div>
        <div className="legend" aria-label="Flow legend">
          <span><i className="dot command-dot"></i>external command</span>
          <span><i className="dot engine-dot"></i>engine request / action_list</span>
          <span><i className="dot robot-dot"></i>sensor / state read</span>
          <span><i className="dot action-dot"></i>robot command publish</span>
          <span><i className="dot backend-dot"></i>open-source backend</span>
        </div>
      </div>

      <div className="diagram-stage" aria-label="Cyclo Brain architecture map">
        <svg className="flow-overlay desktop-flow" viewBox="0 0 1000 1120" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id="arch-arrow-command" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker id="arch-arrow-main" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker id="arch-arrow-engine" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker id="arch-arrow-robot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker id="arch-arrow-action" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker id="arch-arrow-backend" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>

          <path className="flow-line command-line dashed" d="M 790 112 C 720 160 390 152 172 226" markerEnd="url(#arch-arrow-command)" />
          <path className="flow-line main-line" d="M 215 318 L 231 318" markerEnd="url(#arch-arrow-main)" />
          <path className="flow-line main-line" d="M 321 356 C 320 388 250 382 240 404" markerEnd="url(#arch-arrow-main)" />
          <path className="flow-line engine-line dashed" d="M 412 448 C 500 430 500 330 588 329" markerEnd="url(#arch-arrow-engine)" />
          <path className="flow-line engine-line dashed" d="M 588 546 C 520 546 500 598 412 598" markerEnd="url(#arch-arrow-engine)" />
          <path className="flow-line main-line" d="M 223 645 C 223 700 124 690 124 740" markerEnd="url(#arch-arrow-main)" />
          <path className="flow-line action-line" d="M 215 779 L 231 779" markerEnd="url(#arch-arrow-action)" />
          <path className="flow-line backend-line" d="M 425 880 C 440 780 600 720 650 656" markerEnd="url(#arch-arrow-backend)" />
          <path className="flow-line backend-line" d="M 650 880 C 650 780 720 720 740 656" markerEnd="url(#arch-arrow-backend)" />
          <path className="flow-line backend-line" d="M 875 880 C 850 780 815 720 830 656" markerEnd="url(#arch-arrow-backend)" />
          <path className="flow-line robot-line" d="M 790 740 C 870 690 880 625 845 585" markerEnd="url(#arch-arrow-robot)" />
          <path className="flow-line robot-line dashed" d="M 250 1049 C 360 980 610 940 790 818" markerEnd="url(#arch-arrow-robot)" />
          <path className="flow-line action-line dashed" d="M 321 818 C 445 920 610 1010 750 1049" markerEnd="url(#arch-arrow-action)" />
        </svg>

        <svg className="flow-overlay mobile-flow" viewBox="0 0 1000 1750" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <marker id="arch-mobile-command" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker id="arch-mobile-engine" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker id="arch-mobile-robot" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker id="arch-mobile-action" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
            <marker id="arch-mobile-backend" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" />
            </marker>
          </defs>

          <path className="flow-line command-line dashed" d="M 500 250 C 500 292 500 312 500 350" markerEnd="url(#arch-mobile-command)" />
          <path className="flow-line engine-line dashed" d="M 500 587 C 500 735 500 835 500 948" markerEnd="url(#arch-mobile-engine)" />
          <path className="flow-line engine-line dashed" d="M 500 1110 C 245 1030 245 705 500 620" markerEnd="url(#arch-mobile-engine)" />
          <path className="flow-line robot-line" d="M 500 1230 C 500 1210 500 1200 500 1186" markerEnd="url(#arch-mobile-robot)" />
          <path className="flow-line backend-line" d="M 500 1304 C 500 1268 500 1240 500 1214" markerEnd="url(#arch-mobile-backend)" />
          <path className="flow-line robot-line dashed" d="M 260 1574 C 650 1500 780 1320 500 1260" markerEnd="url(#arch-mobile-robot)" />
          <path className="flow-line action-line dashed" d="M 500 820 C 780 980 780 1400 740 1574" markerEnd="url(#arch-mobile-action)" />
        </svg>

        <article className="zone host-zone">
          <p className="zone-label">Host</p>
          <div className="node host-source">
            <span className="lane-tag host-tag">Command Source</span>
            <strong>UI / Orchestrator</strong>
            <span>Standalone CLI args</span>
            <em>same command shape</em>
          </div>
          <div className="node host-command">
            <span className="lane-tag host-tag">InferenceCommand</span>
            <strong>LOAD / START / PAUSE</strong>
            <span>RESUME / STOP / UNLOAD</span>
            <em>external service</em>
          </div>
        </article>

        <section className="zone policy-zone">
          <p className="zone-label container-label">Policy Container: &lt;backend&gt;_server</p>

          <article className="process-panel main-panel">
            <p className="process-title">Main Runtime</p>
            <div className="node main-service">
              <span className="lane-tag main-tag">main-runtime</span>
              <strong>ServiceHandler</strong>
              <span>command entry</span>
            </div>
            <div className="node main-session">
              <span className="lane-tag main-tag">main-runtime</span>
              <strong>SessionState</strong>
              <span>runtime gate</span>
            </div>
            <div className="node main-requester">
              <span className="lane-tag main-tag">main-runtime</span>
              <strong>InferenceRequester</strong>
              <span>one GET_ACTION at a time</span>
              <span>timeout + seq_id stale guard</span>
            </div>
            <div className="node main-actions">
              <span className="lane-tag main-tag">main-runtime</span>
              <strong>ActionChunkProcessor</strong>
              <span>buffer + optional match / RTC</span>
              <span>interpolate / blend / smooth</span>
            </div>
            <div className="node main-loop">
              <span className="lane-tag main-tag">main-runtime</span>
              <strong>ControlLoop</strong>
              <span>self-running tick</span>
            </div>
            <div className="node main-robot-client">
              <span className="lane-tag main-tag">main-runtime</span>
              <strong>RobotClient</strong>
              <span>command output</span>
            </div>
          </article>

          <article className="process-panel engine-panel">
            <p className="process-title">Engine Process</p>
            <div className="node engine-worker">
              <span className="lane-tag engine-tag">engine-process</span>
              <strong>EngineWorker</strong>
              <span>hosts internal EngineCommand service</span>
              <span>using Zenoh ROS2 SDK</span>
            </div>
            <div className="node engine-backend">
              <span className="lane-tag engine-tag">engine-process</span>
              <strong>Backend InferenceEngine</strong>
              <span>model-specific implementation</span>
              <span>behind stable contract</span>
              <div className="subnode-grid" aria-label="Backend inference stages">
                <span>Policy Load</span>
                <span>Preprocess</span>
                <span>Predict</span>
                <span>Optional Optimize</span>
              </div>
            </div>
            <div className="node engine-robot-client">
              <span className="lane-tag engine-tag">engine-process</span>
              <strong>RobotClient</strong>
              <span>observation only</span>
            </div>
          </article>

          <div className="backend-island" aria-label="Open-source backend island">
            <span className="backend-label">Open-source backend island</span>
            <span>LeRobot</span>
            <span>GR00T</span>
            <span>Future model</span>
          </div>
        </section>

        <article className="zone robot-zone">
          <p className="zone-label">Robot</p>
          <div className="node robot-sensors">
            <span className="lane-tag robot-tag">Sensors / State</span>
            <strong>Observation input</strong>
            <span>camera, joints, base state</span>
          </div>
          <div className="node robot-command">
            <span className="lane-tag robot-tag">Command Topics</span>
            <strong>Command output</strong>
            <span>cmd_vel, trajectory, etc.</span>
          </div>
        </article>

        <span className="flow-label label-service command-flow">service call</span>
        <span className="flow-label label-engine engine-flow">EngineCommand</span>
        <span className="flow-label label-action-list engine-flow">action_list</span>
        <span className="flow-label label-processed main-flow">processed actions</span>
        <span className="flow-label label-tick action-flow">one action / tick</span>
        <span className="flow-label label-observation robot-flow">sensor / state read</span>
        <span className="flow-label label-observation-policy robot-flow">observation to inference</span>
        <span className="flow-label label-command-out action-flow">command out</span>
        <span className="flow-label label-backend backend-flow">backend contract</span>
        <span className="flow-marker marker-1 command-marker">1</span>
        <span className="flow-marker marker-2 engine-marker">2</span>
        <span className="flow-marker marker-3 robot-marker">3</span>
        <span className="flow-marker marker-4 engine-marker">4</span>
        <span className="flow-marker marker-5 action-marker">5</span>
      </div>

      <ol className="flow-list" aria-label="Runtime data flow">
        <li><strong>UI/CLI command enters Main.</strong> The command reaches <code>main-runtime</code> through the external service.</li>
        <li><strong>Main requests Engine action.</strong> <code>InferenceRequester</code> sends one <code>EngineCommand</code> at a time.</li>
        <li><strong>Engine reads Robot observation.</strong> The engine-side <code>RobotClient</code> reads camera, joint, and base state.</li>
        <li><strong>Engine returns action_list.</strong> The backend policy loads the model, preprocesses observations, predicts, and optionally optimizes.</li>
        <li><strong>Main buffers/processes/publishes.</strong> <code>ActionChunkProcessor</code> can turn 16 actions into a 100 Hz buffer, and <code>ControlLoop</code> publishes one action per tick.</li>
      </ol>

      <p className="architecture-footer">
        Source of truth: Cyclo Brain runtime structure. When runtime shape changes, update this diagram with it.
      </p>
    </section>
  );
}

import React from 'react';
import './SubtaskFigure.css';

const SUBTASKS = ['Reach for the cup', 'Pick up the cup', 'Drop it in the bin'];

export default function SubtaskFigure(): React.JSX.Element {
  return (
    <div className="sf">
      <div className="sf-row">
        <code className="sf-count">0</code>
        <div className="sf-episode">
          <div className="sf-task">
            <span className="sf-label">Task Instruction</span>
            Put the cup in the bin
          </div>
          <div className="sf-whole">one continuous recording</div>
        </div>
      </div>

      <div className="sf-row">
        <code className="sf-count">3</code>
        <div className="sf-episode">
          <div className="sf-task">
            <span className="sf-label">Task Instruction</span>
            Put the cup in the bin
          </div>
          <div className="sf-segments">
            {SUBTASKS.map((text, i) => (
              <div className="sf-segment" key={text}>
                <span className="sf-label">Sub Task {i + 1}</span>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

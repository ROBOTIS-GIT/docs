import React, {useState} from 'react';
import './RecordPageAreas.css';

type Area = {
  id: string;
  name: string;
  checkFirst?: boolean;
  description: string;
  image: string;
  alt: string;
};

const BASE = '/img/systems/_partials/cyclo_intelligence';

const areas: Area[] = [
  {
    id: 'cameras',
    name: 'Camera Views',
    checkFirst: true,
    description:
      'Check the scene and the selected image topics before recording. This is how you confirm the robot can see the task scene.',
    image: `${BASE}/record_area_camera_views.png`,
    alt: 'Record page with the camera views area highlighted',
  },
  {
    id: 'recorder',
    name: 'Rosbag Recorder',
    description:
      'Enter the task information, choose single-task or subtask recording, and start recording.',
    image: `${BASE}/record_area_rosbag_recorder.png`,
    alt: 'Record page with the Rosbag Recorder panel highlighted',
  },
  {
    id: 'topics',
    name: 'Topic Monitor',
    checkFirst: true,
    description:
      'Check that the required robot and camera topics are alive and being received. A red status means the topic needs attention before you collect data.',
    image: `${BASE}/record_area_topic_monitor.png`,
    alt: 'Record page with the Topic Monitor panel highlighted',
  },
  {
    id: 'viewer',
    name: '3D Viewer',
    description: 'Confirm the selected robot model and the general robot state.',
    image: `${BASE}/record_area_3d_viewer.png`,
    alt: 'Record page with the 3D viewer highlighted',
  },
];

export default function RecordPageAreas(): React.JSX.Element {
  const [activeId, setActiveId] = useState(areas[0].id);
  const active = areas.find((a) => a.id === activeId) ?? areas[0];

  return (
    <div className="rpa">
      <div className="rpa-tabs" role="tablist" aria-label="Record page areas">
        {areas.map((area) => (
          <button
            key={area.id}
            type="button"
            role="tab"
            id={`rpa-tab-${area.id}`}
            aria-selected={area.id === activeId}
            aria-controls="rpa-panel"
            className={`rpa-tab${area.id === activeId ? ' rpa-tab--active' : ''}`}
            onClick={() => setActiveId(area.id)}
          >
            <span className="rpa-name">{area.name}</span>
            {area.checkFirst && <span className="rpa-badge">check before recording</span>}
          </button>
        ))}
      </div>

      <div
        id="rpa-panel"
        role="tabpanel"
        aria-labelledby={`rpa-tab-${active.id}`}
        className="rpa-panel"
      >
        <p className="rpa-desc">{active.description}</p>
        <a href={active.image} target="_blank" rel="noopener noreferrer" className="rpa-figure">
          <img src={active.image} alt={active.alt} />
        </a>
      </div>
    </div>
  );
}

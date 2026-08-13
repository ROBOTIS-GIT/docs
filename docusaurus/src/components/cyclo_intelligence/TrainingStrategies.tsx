import React from 'react';
import './TrainingStrategies.css';

type Layer = {name: string; trained: boolean};
type Strategy = {title: string; when: string; layers: Layer[]};

const LAYERS = ['Vision encoder', 'Language model', 'Action expert / head'];

const strategies: Strategy[] = [
  {
    title: 'Full fine-tune',
    when: 'Large dataset, plenty of GPU memory, task far from the base model.',
    layers: LAYERS.map((name) => ({name, trained: true})),
  },
  {
    title: 'Freeze the vision encoder',
    when: 'Middle ground. Keeps general visual features, adapts the rest.',
    layers: LAYERS.map((name) => ({name, trained: name !== 'Vision encoder'})),
  },
  {
    title: 'Action head only',
    when: 'Small dataset or limited GPU memory. Fastest, least likely to overfit.',
    layers: LAYERS.map((name) => ({name, trained: name === 'Action expert / head'})),
  },
];

export default function TrainingStrategies(): React.JSX.Element {
  return (
    <div className="ts">
      {strategies.map((s) => (
        <div className="ts-card" key={s.title}>
          <p className="ts-title">{s.title}</p>
          <div className="ts-stack">
            {s.layers.map((l) => (
              <div className={`ts-layer${l.trained ? ' ts-layer--trained' : ''}`} key={l.name}>
                <span className="ts-layer-name">{l.name}</span>
                <span className="ts-layer-state">{l.trained ? 'trained' : 'frozen'}</span>
              </div>
            ))}
          </div>
          <p className="ts-when">{s.when}</p>
        </div>
      ))}
    </div>
  );
}

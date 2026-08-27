import React, {useState} from 'react';
import './ModelPicker.css';

type Question = {
  kind: 'question';
  text: string;
  hint?: string;
  options: {label: string; next: string}[];
};

type Result = {
  kind: 'result';
  models: string;
  body: string;
  href?: string;
};

type Node = Question | Result;

const TREE: Record<string, Node> = {
  start: {
    kind: 'question',
    text: 'Will you tell the robot what to do in words at run time?',
    hint: 'Only the VLA policies accept a task instruction.',
    options: [
      {label: 'No', next: 'scratch'},
      {label: 'Yes', next: 'gpu'},
    ],
  },
  gpu: {
    kind: 'question',
    text: 'What will you train on?',
    options: [
      {label: 'One consumer GPU', next: 'smolvla'},
      {label: 'A data-center GPU', next: 'trt'},
    ],
  },
  trt: {
    kind: 'question',
    text: 'Do you want TensorRT-accelerated inference on the robot?',
    options: [
      {label: 'Yes', next: 'groot'},
      {label: 'Not needed', next: 'bigvla'},
    ],
  },
  scratch: {
    kind: 'result',
    models: 'ACT or Diffusion',
    body: 'Both train from scratch on your dataset and fit on a single consumer GPU. ACT is the quicker run of the two.',
    href: 'https://huggingface.co/docs/lerobot/en/act',
  },
  smolvla: {
    kind: 'result',
    models: 'SmolVLA',
    body: 'The smallest VLA here. It trains only the action expert by default, which is what keeps it within a single consumer GPU.',
    href: 'https://huggingface.co/docs/lerobot/en/smolvla',
  },
  groot: {
    kind: 'result',
    models: 'GR00T N1.7',
    body: 'Fine-tunes from nvidia/GR00T-N1.7-3B and is the one policy whose inference backend supports TensorRT. It trains the projector and diffusion head by default.',
    href: 'https://huggingface.co/docs/lerobot/en/groot',
  },
  bigvla: {
    kind: 'question',
    text: 'What matters most for your task?',
    options: [
      {label: 'Adapting to this robot from a small dataset', next: 'xvla'},
      {label: 'Generalizing to new environments and objects', next: 'pi05'},
      {label: 'Matching published \u03c0\u2080 results', next: 'pi0'},
      {label: 'Something newer to experiment with', next: 'newer'},
    ],
  },
  newer: {
    kind: 'question',
    text: 'Which direction do you want to try?',
    options: [
      {label: 'Predict future video during training', next: 'fastwam'},
      {label: 'Tune the vision, connector and action parts separately', next: 'molmoact2'},
      {label: 'Freeze a language backbone and train only the head', next: 'vlajepa'},
    ],
  },
  fastwam: {
    kind: 'result',
    models: 'FastWAM',
    body: 'A world action model. It keeps video modelling during training but predicts actions directly at inference, and it concatenates your cameras into one image, so mixed camera resolutions are handled for you.',
    href: 'https://huggingface.co/docs/lerobot/en/fastwam',
  },
  molmoact2: {
    kind: 'result',
    models: 'MolmoAct2',
    body: 'The only policy here with a separate learning rate for the vision tower, the connector and the action expert, so you can tune each part at its own speed.',
    href: 'https://huggingface.co/docs/lerobot/en/molmoact2',
  },
  vlajepa: {
    kind: 'result',
    models: 'VLA-JEPA',
    body: 'Fine-tunes from lerobot/VLA-JEPA-Pretrain. freeze_qwen trains only the action head, and resize_images_to puts every camera at one resolution.',
    href: 'https://huggingface.co/docs/lerobot/en/vla_jepa',
  },
  xvla: {
    kind: 'result',
    models: 'XVLA',
    body: 'The smallest of the three at 0.9B parameters. It learns soft prompts for your robot while keeping the backbone frozen, which is what makes adapting to a new embodiment cheap.',
    href: 'https://huggingface.co/docs/lerobot/en/xvla',
  },
  pi05: {
    kind: 'result',
    models: 'Pi0.5',
    body: "Physical Intelligence's evolution of \u03c0\u2080, co-trained on heterogeneous data specifically for open-world generalization to environments and objects it never saw in training.",
    href: 'https://huggingface.co/docs/lerobot/en/pi05',
  },
  pi0: {
    kind: 'result',
    models: 'Pi0',
    body: 'The original general-purpose flow-matching VLA from Physical Intelligence. Choose it to reproduce or compare against published \u03c0\u2080 results; otherwise Pi0.5 supersedes it.',
    href: 'https://huggingface.co/docs/lerobot/en/pi0',
  },
};

export default function ModelPicker(): React.JSX.Element {
  const [path, setPath] = useState<string[]>(['start']);
  const currentId = path[path.length - 1];
  const current = TREE[currentId];

  const answered = path.slice(0, -1);

  return (
    <div className="mp">
      {answered.length > 0 && (
        <ol className="mp-trail">
          {answered.map((id) => {
            const node = TREE[id];
            return node.kind === 'question' ? <li key={id}>{node.text}</li> : null;
          })}
        </ol>
      )}

      {current.kind === 'question' ? (
        <div className="mp-question">
          <p className="mp-text">{current.text}</p>
          {current.hint && <p className="mp-hint">{current.hint}</p>}
          <div className="mp-options">
            {current.options.map((o) => (
              <button
                type="button"
                className="mp-option"
                key={o.label}
                onClick={() => setPath([...path, o.next])}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mp-result">
          <p className="mp-models">{current.models}</p>
          <p className="mp-body">{current.body}</p>
          {current.href && (
            <a className="mp-doc" href={current.href} target="_blank" rel="noopener noreferrer">
              LeRobot documentation for this policy
            </a>
          )}
        </div>
      )}

      {path.length > 1 && (
        <div className="mp-controls">
          <button type="button" className="mp-link" onClick={() => setPath(path.slice(0, -1))}>
            Back
          </button>
          <button type="button" className="mp-link" onClick={() => setPath(['start'])}>
            Start over
          </button>
        </div>
      )}
    </div>
  );
}

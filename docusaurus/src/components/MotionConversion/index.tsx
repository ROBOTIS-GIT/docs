import React from 'react';
import CodeBlock from '@theme/CodeBlock';

type Props = {
  platform: 'cyclo-lab' | 'cyclo-mjlab';
  source: 'soma' | 'umr';
  motionName?: string;
  folderName?: string;
  otherMotions?: string[];
};

export default function MotionConversion({platform, source, motionName = 'your_motion_01', folderName = motionName, otherMotions = []}: Props) {
  const isLab = platform === 'cyclo-lab';
  const repository = isLab ? 'cyclo_lab' : 'cyclo_mjlab';
  const label = isLab ? 'Cyclo Lab' : 'Cyclo MJLab';
  const motionRoot = `${isLab ? 'source/cyclo_lab/data' : 'source/assets'}/motions/K1_rev2`;
  const directory = `${motionRoot}/${folderName}`;
  const sourceCsv = `${motionName}_${source}.csv`;
  const sourceFiles = [motionName, ...otherMotions].map(name => `${name}_${source}.csv`);
  const script = source === 'soma' ? 'soma_retargeter_csv_converter.py' : 'csv_to_npz.py';
  const isLabSoma = isLab && source === 'soma';
  const options = [
    `  -f ${directory}/${sourceCsv}`,
    ...isLabSoma ? ['  --robot k1_rev2'] : [
      '  --input_fps 30 --output_fps 50',
      isLab ? '  --robot k1_rev2'
        : '  --model third_party/ai_sapiens/ai_sapiens_description/mujoco/k1_rev2/k1.xml',
    ],
    `  --output_name ${directory}/${motionName}.npz`,
  ];
  if (isLab) options.push('  --viz none');
  const continuation = ' \\\n';
  const commandPrefix = isLabSoma ? 'python3' : `cd /workspace/${repository}\npython`;
  const convertCommand = `${commandPrefix} scripts/tools/motion/${script}${continuation}${options.join(continuation)}`;

  const revisionTree = (
    <li>
      <strong>K1_rev2/</strong>
      <ul>
        <li><span className="docs-folder-tree__folder">dance1/</span></li>
        <li><span className="docs-folder-tree__folder">dance2/</span></li>
        <li>
          <strong>{folderName}/</strong>
          <ul>
            {sourceFiles.map(file => (
              <li key={file}><code><strong className="docs-folder-tree__file">{file}</strong></code></li>
            ))}
          </ul>
        </li>
      </ul>
    </li>
  );

  return (
    <>
      <p>
        First, create <code>{folderName}/</code> under the K1 Rev.2 motion directory in your host repository
        and place your {source === 'soma' ? 'Soma-retargeter' : 'UMR'} CSV files there as shown below:
      </p>
      <div className="docs-folder-tree" role="img" aria-label={`Source CSV files in the ${folderName} motion directory`}>
        <div className="docs-folder-tree__root">
          <code>{isLab ? 'source/cyclo_lab/data/' : 'source/assets/motions/'}</code>
        </div>
        <ul>
          {isLab ? (
            <li>
              <span className="docs-folder-tree__folder">motions/</span>
              <ul>{revisionTree}</ul>
            </li>
          ) : revisionTree}
        </ul>
      </div>
      {otherMotions.length > 0 && (
        <p>
          The command below converts the first clip, <code>{sourceCsv}</code>.
          Repeat it for the remaining clips, changing the input and output filenames.
        </p>
      )}
      <p>
        Next, <strong>inside the {label} container</strong>, run from the repository root to convert the CSV.
        This example converts <strong>30 FPS to 50 FPS</strong>; set <code>--input_fps</code> to your source motion's FPS.
      </p>
      <CodeBlock language="bash">{convertCommand}</CodeBlock>
    </>
  );
}

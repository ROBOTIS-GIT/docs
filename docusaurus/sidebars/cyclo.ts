import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const cycloSidebar: SidebarsConfig[string] = [
  doc('software/cyclo/cyclo', 'What is CYCLO?'),
  {
    type: 'category',
    label: 'Modules',
    collapsed: false,
    items: [
      doc('software/cyclo/cyclo_studio', 'Cyclo Studio'),
      doc('software/cyclo/cyclo_marketplace', 'Cyclo Marketplace'),
      {
        type: 'category',
        label: 'Cyclo Intelligence',
        link: {type: 'doc', id: 'software/cyclo/cyclo_intelligence'},
        collapsed: false,
        items: [
          {
            type: 'category',
            label: 'Legacy: Physical AI Tools',
            link: {type: 'doc', id: 'software/cyclo/intelligence/legacy/physical_ai_tools/imitation_learning'},
            collapsed: true,
            items: [
              {
                type: 'category',
                label: 'Dataset Preparation',
                link: {type: 'doc', id: 'software/cyclo/intelligence/legacy/physical_ai_tools/dataset_preparation/dataset_preparation'},
                items: [
                  doc('software/cyclo/intelligence/legacy/physical_ai_tools/dataset_preparation/prerequisites', 'Prerequisites'),
                  doc('software/cyclo/intelligence/legacy/physical_ai_tools/dataset_preparation/recording', 'Recording'),
                  doc('software/cyclo/intelligence/legacy/physical_ai_tools/dataset_preparation/visualization', 'Visualization'),
                ],
              },
              doc('software/cyclo/intelligence/legacy/physical_ai_tools/model_training', 'Model Training'),
              doc('software/cyclo/intelligence/legacy/physical_ai_tools/model_inference', 'Model Inference'),
              doc('software/cyclo/intelligence/legacy/physical_ai_tools/data_tools', 'Data Tools'),
            ],
          },
        ],
      },
      doc('software/cyclo/cyclo_lab', 'Cyclo Lab'),
      {
        type: 'category',
        label: 'Cyclo Control',
        link: {type: 'doc', id: 'software/cyclo/cyclo_control'},
        items: [doc('software/cyclo/control/aiworker', 'AI Worker Guide')],
      },
      doc('software/cyclo/cyclo_app', 'Cyclo App'),
      {
        type: 'category',
        label: 'Cyclo Manager',
        link: {type: 'doc', id: 'software/cyclo/cyclo_manager'},
        items: [
          doc('software/cyclo/manager/install', 'Install'),
          doc('software/cyclo/manager/system', 'System'),
          doc('software/cyclo/manager/manage_container', 'Manage Containers'),
          doc('software/cyclo/manager/version_update', 'Version Update'),
          doc('software/cyclo/manager/novnc', 'noVNC'),
          doc('software/cyclo/manager/jog', 'Jog'),
        ],
      },
      {
        type: 'category',
        label: 'Cyclo Flow',
        link: {type: 'doc', id: 'software/cyclo/cyclo_flow'},
        items: [
          {
            type: 'category',
            label: 'Autonomy Studio',
            link: {type: 'doc', id: 'software/cyclo/flow/autonomy_studio/overview'},
            items: [
              doc('software/cyclo/flow/autonomy_studio/action_canvas', 'Action Canvas'),
              {
                type: 'category',
                label: 'Mission Canvas',
                items: [
                  doc('software/cyclo/flow/autonomy_studio/mission_canvas/navigation', 'Navigation'),
                  doc('software/cyclo/flow/autonomy_studio/mission_canvas/mission', 'Mission'),
                ],
              },
            ],
          },
        ],
      },
      doc('software/cyclo/cyclo_os', 'Cyclo OS'),
    ],
  },
];

export default cycloSidebar;

import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const cycloSidebar: SidebarsConfig[string] = [
  doc('software/cyclo/cyclo', 'What is CYCLO?'),
  {
    type: 'category',
    label: 'Modules',
    collapsed: false,
    items: [
      {
        type: 'category',
        label: 'Cyclo Studio',
        link: {type: 'doc', id: 'software/cyclo/cyclo_studio'},
        collapsed: false,
        items: [
          doc('software/cyclo/studio/marketplace', 'Cyclo Marketplace'),
        ],
      },
      doc('software/cyclo/cyclo_ai', 'Cyclo AI'),
      {
        type: 'category',
        label: 'Cyclo Intelligence',
        link: {type: 'doc', id: 'software/cyclo/cyclo_intelligence'},
        collapsed: true,
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
      doc('software/cyclo/cyclo_control', 'Cyclo Control'),
      doc('software/cyclo/cyclo_app', 'Cyclo App'),
      {
        type: 'category',
        label: 'Cyclo Manager',
        link: {type: 'doc', id: 'software/cyclo/cyclo_manager'},
        items: [
          doc('software/cyclo/cyclo_manager', 'Overview'),
          doc('software/cyclo/manager/install', 'Install'),
          doc('software/cyclo/manager/dashboard', 'Dashboard'),
          doc('software/cyclo/manager/system', 'System'),
          doc('software/cyclo/manager/jog', 'Jog'),
          doc('software/cyclo/manager/record_play', 'Record & Play'),
          doc('software/cyclo/manager/terminal', 'Terminal'),
          doc('software/cyclo/manager/novnc', 'noVNC'),
          doc('software/cyclo/manager/files', 'Files'),
        ],
      },
      doc('software/cyclo/cyclo_flow', 'Cyclo Flow'),
      doc('software/cyclo/cyclo_os', 'Cyclo OS'),
    ],
  },
];

export default cycloSidebar;

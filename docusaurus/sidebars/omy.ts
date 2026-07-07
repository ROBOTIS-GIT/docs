import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const omySidebar: SidebarsConfig[string] = [
  {type: 'doc', id: 'systems/omy/introduction', label: 'Introduction'},
  {type: 'doc', id: 'systems/omy/video_gallery', label: 'Video Gallery'},
  {
    type: 'category',
    label: 'Specifications',
    collapsed: true,
    items: [
      {
        type: 'category',
        label: 'Hardware',
        link: {type: 'doc', id: 'systems/omy/specifications/hardware'},
        collapsed: true,
        items: [
          {type: 'doc', id: 'systems/omy/specifications/control_table', label: 'Control Table'},
        ],
      },
      {type: 'doc', id: 'systems/omy/specifications/software', label: 'Software'},
    ],
  },
  {
    type: 'category',
    label: 'Quick Start Guide',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omy/quick_start_guide/setup_guide', label: 'Setup Guide'},
      {type: 'doc', id: 'systems/omy/quick_start_guide/zenoh_communication', label: 'Zenoh Communication'},
      {
        type: 'category',
        label: 'Operation Guide',
        link: {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide'},
        collapsed: true,
        items: [
          {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide/teleoperation', label: 'Teleoperation'},
          {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide/robot_control', label: 'Robot Control'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Imitation Learning',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omy/imitation_learning/imitation_learning', label: 'Overview', key: 'cyclo-intelligence-overview'},
      {type: 'doc', id: 'systems/omy/imitation_learning/setup', label: 'Setup', key: 'cyclo-intelligence-setup'},
      {type: 'doc', id: 'systems/omy/imitation_learning/data_recording', label: 'Data Recording', key: 'cyclo-intelligence-data-recording'},
      {type: 'doc', id: 'systems/omy/imitation_learning/data_tools', label: 'Data Tools', key: 'cyclo-intelligence-data-tools'},
      {type: 'doc', id: 'systems/omy/imitation_learning/model_training', label: 'Model Training Guide', key: 'cyclo-intelligence-model-training'},
      {type: 'doc', id: 'systems/omy/imitation_learning/model_inference', label: 'Model Inference', key: 'cyclo-intelligence-model-inference'},
    ],
  },
  {
    type: 'category',
    label: 'Simulation',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omy/simulation/simulation', label: 'Overview', key: 'simulation-overview'},
      {type: 'doc', id: 'systems/omy/simulation/gazebo', label: 'Gazebo'},
      {type: 'doc', id: 'systems/omy/simulation/isaac_sim_lab', label: 'Isaac Sim/Lab'},
    ],
  },
  {
    type: 'category',
    label: 'Advanced Features',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omy/advanced_features/advanced_features', label: 'Overview', key: 'advanced-features-overview'},
      {type: 'doc', id: 'systems/omy/advanced_features/cyclo_control', label: 'Cyclo Control'},
    ],
  },
  {
    type: 'category',
    label: 'Resources',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omy/resources/open_source', label: 'Open Source'},
      {type: 'doc', id: 'systems/omy/resources/release_notes', label: 'Release Notes'},
      {
        type: 'category',
        label: 'Legacy',
        link: {
          type: 'generated-index',
          slug: '/systems/omy/resources/legacy',
          title: 'Legacy',
          description: 'Archived OMY documentation kept for reference.',
        },
        collapsed: true,
        items: [
          {
            type: 'category',
            label: 'Physical AI Tools',
            link: {
              type: 'generated-index',
              slug: '/systems/omy/resources/legacy/physical_ai_tools',
              title: 'Physical AI Tools',
              description: 'Legacy Physical AI Tools documentation for OMY.',
            },
            collapsed: true,
            items: [
              {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/imitation_learning', label: 'Overview', key: 'imitation-learning-overview'},
              {
                type: 'category',
                label: 'Dataset Preparation',
                link: {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/dataset_preparation/dataset_preparation'},
                collapsed: true,
                items: [
                  {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/dataset_preparation/prerequisites', label: 'Prerequisites'},
                  {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/dataset_preparation/recording', label: 'Recording'},
                  {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/dataset_preparation/visualization', label: 'Visualization'},
                ],
              },
              {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/model_training', label: 'Model Training', key: 'legacy-physical-ai-tools-model-training'},
              {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/model_inference', label: 'Model Inference', key: 'legacy-physical-ai-tools-model-inference'},
              {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/data_tools', label: 'Data Tools', key: 'legacy-physical-ai-tools-data-tools'},
            ],
          },
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Support',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omy/support/os_update', label: 'OS Update'},
      {type: 'doc', id: 'systems/omy/support/troubleshooting_guide', label: 'Troubleshooting Guide'},
      {type: 'doc', id: 'systems/omy/support/manual_packing_procedure', label: 'Manual Packing Procedure'},
      {type: 'link', label: 'Discord Server', href: 'https://discord.gg/robotis'},
      {type: 'doc', id: 'systems/omy/support/issues', label: 'Issues'},
      {type: 'doc', id: 'systems/omy/support/faq', label: 'FAQ'},
      {type: 'doc', id: 'systems/omy/support/contact_us', label: 'Contact Us'},
    ],
  },
];

export default omySidebar;

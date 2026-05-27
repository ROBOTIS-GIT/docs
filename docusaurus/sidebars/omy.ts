import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const omySidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    label: 'OMY',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omy/omy/introduction', label: 'Introduction'},
      {type: 'doc', id: 'systems/omy/omy/video_gallery', label: 'Video Gallery'},
    ],
  },
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
      {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide', label: 'Operation Guide'},
    ],
  },
  {
    type: 'category',
    label: 'Imitation Learning',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omy/imitation_learning/imitation_learning', label: 'Overview', key: 'imitation-learning-overview'},
      {
        type: 'category',
        label: 'Dataset Preparation',
        link: {type: 'doc', id: 'systems/omy/imitation_learning/dataset_preparation/dataset_preparation'},
        collapsed: true,
        items: [
          {type: 'doc', id: 'systems/omy/imitation_learning/dataset_preparation/prerequisites', label: 'Prerequisites'},
          {type: 'doc', id: 'systems/omy/imitation_learning/dataset_preparation/recording', label: 'Recording'},
          {type: 'doc', id: 'systems/omy/imitation_learning/dataset_preparation/visualization', label: 'Visualization'},
        ],
      },
      {type: 'doc', id: 'systems/omy/imitation_learning/model_training', label: 'Model Training'},
      {type: 'doc', id: 'systems/omy/imitation_learning/model_inference', label: 'Model Inference'},
      {type: 'doc', id: 'systems/omy/imitation_learning/data_tools', label: 'Data Tools'},
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
    ],
  },
  {
    type: 'category',
    label: 'Support',
    collapsed: true,
    items: [
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

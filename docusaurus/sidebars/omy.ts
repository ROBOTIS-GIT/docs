import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const omySidebar: SidebarsConfig[string] = [
  {type: 'doc', id: 'systems/omy/introduction', label: 'Introduction'},
  {type: 'doc', id: 'systems/omy/video_gallery', label: 'Video Gallery'},
  {
    type: 'category',
    label: 'Specifications',
    collapsed: false,
    items: [
      {
        type: 'category',
        label: 'Hardware',
        link: {type: 'doc', id: 'systems/omy/specifications/hardware'},
        collapsed: false,
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
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omy/quick_start_guide/setup_guide', label: 'Setup Guide'},
      {type: 'doc', id: 'systems/omy/quick_start_guide/zenoh_communication', label: 'Zenoh Communication'},
      {
        type: 'category',
        label: 'Operation Guide',
        link: {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide'},
        collapsed: false,
        items: [
          {
            type: 'category',
            label: 'Cyclo Manager',
            link: {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide/cyclo_manager/cyclo_manager'},
            collapsed: false,
            items: [
              {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide/cyclo_manager/install', label: 'Install'},
              {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide/cyclo_manager/bringup', label: 'Bringup'},
              {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide/cyclo_manager/manage_container', label: 'Manage Containers'},
              {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide/cyclo_manager/version_update', label: 'Version Update'},
              {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide/cyclo_manager/novnc', label: 'noVNC'},
            ],
          },
          {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide/teleoperation', label: 'Teleoperation'},
          {type: 'doc', id: 'systems/omy/quick_start_guide/operation_guide/robot_control', label: 'Robot Control'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Imitation Learning',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omy/imitation_learning/overview', label: 'Overview', key: 'imitation-learning-overview'},
      {
        type: 'category',
        label: 'Cyclo Intelligence',
        link: {type: 'doc', id: 'systems/omy/imitation_learning/imitation_learning'},
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/omy/imitation_learning/setup', label: 'Setup', key: 'cyclo-intelligence-setup'},
          {type: 'doc', id: 'systems/omy/imitation_learning/data_recording', label: 'Data Recording', key: 'cyclo-intelligence-data-recording'},
          {type: 'doc', id: 'systems/omy/imitation_learning/data_tools', label: 'Data Tools', key: 'cyclo-intelligence-data-tools'},
          {type: 'doc', id: 'systems/omy/imitation_learning/model_training', label: 'Model Training Guide', key: 'cyclo-intelligence-model-training'},
          {type: 'doc', id: 'systems/omy/imitation_learning/model_inference', label: 'Model Inference', key: 'cyclo-intelligence-model-inference'},
        ],
      },
      {
        type: 'category',
        label: 'Physical AI Tools(Legacy)',
        link: {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/imitation_learning'},
        collapsed: true,
        items: [
          {
            type: 'category',
            label: 'Dataset Preparation',
            link: {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/dataset_preparation/dataset_preparation'},
            collapsed: false,
            items: [
              {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/dataset_preparation/prerequisites', label: 'Prerequisites'},
              {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/dataset_preparation/recording', label: 'Recording'},
              {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/dataset_preparation/visualization', label: 'Visualization'},
            ],
          },
          {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/model_training', label: 'Model Training', key: 'physical-ai-tools-model-training'},
          {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/model_inference', label: 'Model Inference', key: 'physical-ai-tools-model-inference'},
          {type: 'doc', id: 'systems/omy/resources/legacy/physical_ai_tools/data_tools', label: 'Data Tools', key: 'physical-ai-tools-data-tools'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Simulation',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omy/simulation/simulation', label: 'Overview', key: 'simulation-overview'},
      {type: 'doc', id: 'systems/omy/simulation/gazebo', label: 'Gazebo'},
      {type: 'doc', id: 'systems/omy/simulation/isaac_sim_lab', label: 'Isaac Sim/Lab'},
    ],
  },
  {
    type: 'category',
    label: 'Advanced Features',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omy/advanced_features/advanced_features', label: 'Overview', key: 'advanced-features-overview'},
      {type: 'doc', id: 'systems/omy/advanced_features/cyclo_control', label: 'Cyclo Control'},
    ],
  },
  {
    type: 'category',
    label: 'Resources',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omy/resources/open_source', label: 'Open Source'},
      {type: 'doc', id: 'systems/omy/resources/release_notes', label: 'Release Notes'},
      {
        type: 'category',
        label: 'Technical Story',
        collapsed: false,
        link: {type: 'doc', id: 'systems/omy/resources/technical_story/technical_story'},
        items: [
          {type: 'doc', id: 'systems/omy/resources/technical_story/vla_lerobotnative', label: 'LeRobot Policies'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Support',
    collapsed: false,
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

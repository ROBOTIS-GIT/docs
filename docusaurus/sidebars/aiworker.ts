import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const aiworkerSidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    label: 'AI Worker',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aiworker/ai_worker/introduction', label: 'Introduction'},
      {type: 'doc', id: 'systems/aiworker/ai_worker/video_gallery', label: 'Video Gallery'},
    ],
  },
  {
    type: 'category',
    label: 'Specifications',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aiworker/specifications/hardware', label: 'Hardware'},
      {type: 'doc', id: 'systems/aiworker/specifications/software', label: 'Software'},
    ],
  },
  {
    type: 'category',
    label: 'Quick Start Guide',
    collapsed: false,
    items: [
      {
        type: 'category',
        label: 'Setup Overview',
        link: {type: 'doc', id: 'systems/aiworker/quick_start_guide/setup_overview/setup_overview'},
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/setup_overview/hardware', label: 'Hardware'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/setup_overview/software', label: 'Software'},
        ],
      },
      {
        type: 'category',
        label: 'Operation Guide',
        link: {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/operation_guide'},
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/teleoperation', label: 'Teleoperation'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/vr_teleoperation', label: 'VR Teleoperation'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/navigation', label: 'Navigation'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Imitation Learning',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aiworker/imitation_learning/imitation_learning', label: 'Overview'},
      {
        type: 'category',
        label: 'Dataset Preparation',
        link: {type: 'doc', id: 'systems/aiworker/imitation_learning/dataset_preparation/dataset_preparation'},
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/aiworker/imitation_learning/dataset_preparation/prerequisites', label: 'Prerequisites'},
          {type: 'doc', id: 'systems/aiworker/imitation_learning/dataset_preparation/recording', label: 'Recording'},
          {type: 'doc', id: 'systems/aiworker/imitation_learning/dataset_preparation/visualization', label: 'Visualization'},
        ],
      },
      {type: 'doc', id: 'systems/aiworker/imitation_learning/model_training', label: 'Model Training'},
      {type: 'doc', id: 'systems/aiworker/imitation_learning/model_inference', label: 'Model Inference'},
      {type: 'doc', id: 'systems/aiworker/imitation_learning/data_tools', label: 'Data Tools'},
    ],
  },
  {
    type: 'category',
    label: 'Simulation',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aiworker/simulation/simulation', label: 'Overview'},
      {type: 'doc', id: 'systems/aiworker/simulation/gazebo', label: 'Gazebo'},
      {type: 'doc', id: 'systems/aiworker/simulation/isaac_sim_lab', label: 'Isaac Sim/Lab'},
    ],
  },
  {
    type: 'category',
    label: 'Advanced Features',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aiworker/advanced_features/advanced_features', label: 'Overview'},
      {type: 'doc', id: 'systems/aiworker/advanced_features/cyclo_manager', label: 'Cyclo Manager'},
      {type: 'doc', id: 'systems/aiworker/advanced_features/cyclo_control', label: 'Cyclo Control'},
      {type: 'doc', id: 'systems/aiworker/advanced_features/behavior_trees', label: 'Behavior Trees'},
      {type: 'doc', id: 'systems/aiworker/advanced_features/robotis_vuer', label: 'ROBOTIS Vuer'},
    ],
  },
  {
    type: 'category',
    label: 'Resources',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aiworker/resources/open_source', label: 'Open Source'},
      {type: 'doc', id: 'systems/aiworker/resources/release_notes', label: 'Release Notes'},
      {
        type: 'category',
        label: 'Technical Story',
        link: {type: 'doc', id: 'systems/aiworker/resources/technical_story/technical_story'},
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/aiworker/resources/technical_story/isaac_gr00t', label: 'Isaac GR00T'},
          {type: 'doc', id: 'systems/aiworker/resources/technical_story/nav2', label: 'Nav2'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Support',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aiworker/support/troubleshooting_guide', label: 'Troubleshooting Guide'},
      {type: 'link', label: 'Discord Server', href: 'https://discord.gg/robotis'},
      {type: 'doc', id: 'systems/aiworker/support/issues', label: 'Issues'},
      {type: 'doc', id: 'systems/aiworker/support/faq', label: 'FAQ'},
      {type: 'doc', id: 'systems/aiworker/support/contact_us', label: 'Contact Us'},
    ],
  },
];

export default aiworkerSidebar;

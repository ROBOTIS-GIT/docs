import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const aiworkerSidebar: SidebarsConfig[string] = [
  {type: 'doc', id: 'systems/aiworker/introduction', label: 'Introduction'},
  {type: 'doc', id: 'systems/aiworker/video_gallery', label: 'Video Gallery'},
  {
    type: 'category',
    label: 'Specifications',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aiworker/specifications/hardware', label: 'Hardware', key: 'specifications-hardware'},
      {type: 'doc', id: 'systems/aiworker/specifications/software', label: 'Software', key: 'specifications-software'},
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
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/setup_overview/hardware', label: 'Hardware', key: 'setup-overview-hardware'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/setup_overview/software', label: 'Software', key: 'setup-overview-software'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/setup_overview/zenoh_communication', label: 'Zenoh Communication', key: 'setup-overview-zenoh-communication'},
        ],
      },
      {
        type: 'category',
        label: 'Operation Guide',
        link: {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/operation_guide'},
        collapsed: false,
        items: [
          {
            type: 'category',
            label: 'Cyclo Manager',
            link: {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/cyclo_manager/cyclo_manager'},
            collapsed: false,
            items: [
              {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/cyclo_manager/install', label: 'Install'},
              {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/cyclo_manager/bringup', label: 'Bringup'},
              {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/cyclo_manager/manage_container', label: 'Manage Containers'},
              {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/cyclo_manager/version_update', label: 'Version Update'},
              {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/cyclo_manager/novnc', label: 'noVNC'},
              {type: 'doc', id: 'systems/aiworker/quick_start_guide/operation_guide/cyclo_manager/jog', label: 'Jog'},
            ],
          },
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
      {type: 'doc', id: 'systems/aiworker/imitation_learning/overview', label: 'Overview', key: 'imitation-learning-overview'},
      {
        type: 'category',
        label: 'Cyclo Intelligence',
        link: {type: 'doc', id: 'systems/aiworker/imitation_learning/imitation_learning'},
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/aiworker/imitation_learning/setup', label: 'Setup', key: 'cyclo-intelligence-setup'},
          {type: 'doc', id: 'systems/aiworker/imitation_learning/data_recording', label: 'Data Recording', key: 'cyclo-intelligence-data-recording'},
          {type: 'doc', id: 'systems/aiworker/imitation_learning/data_tools', label: 'Data Tools', key: 'cyclo-intelligence-data-tools'},
          {type: 'doc', id: 'systems/aiworker/imitation_learning/model_training', label: 'Model Training Guide', key: 'cyclo-intelligence-model-training'},
          {type: 'doc', id: 'systems/aiworker/imitation_learning/model_inference', label: 'Model Inference', key: 'cyclo-intelligence-model-inference'},
        ],
      },
      {
        type: 'category',
        label: 'Physical AI Tools(Legacy)',
        link: {type: 'doc', id: 'systems/aiworker/resources/legacy/physical_ai_tools/imitation_learning'},
        collapsed: true,
        items: [
          {
            type: 'category',
            label: 'Dataset Preparation',
            link: {type: 'doc', id: 'systems/aiworker/resources/legacy/physical_ai_tools/dataset_preparation/dataset_preparation'},
            collapsed: false,
            items: [
              {type: 'doc', id: 'systems/aiworker/resources/legacy/physical_ai_tools/dataset_preparation/prerequisites', label: 'Prerequisites'},
              {type: 'doc', id: 'systems/aiworker/resources/legacy/physical_ai_tools/dataset_preparation/recording', label: 'Recording'},
              {type: 'doc', id: 'systems/aiworker/resources/legacy/physical_ai_tools/dataset_preparation/visualization', label: 'Visualization'},
            ],
          },
          {type: 'doc', id: 'systems/aiworker/resources/legacy/physical_ai_tools/model_training', label: 'Model Training', key: 'physical-ai-tools-model-training'},
          {type: 'doc', id: 'systems/aiworker/resources/legacy/physical_ai_tools/model_inference', label: 'Model Inference', key: 'physical-ai-tools-model-inference'},
          {type: 'doc', id: 'systems/aiworker/resources/legacy/physical_ai_tools/data_tools', label: 'Data Tools', key: 'physical-ai-tools-data-tools'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Simulation',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aiworker/simulation/simulation', label: 'Overview', key: 'simulation-overview'},
      {type: 'doc', id: 'systems/aiworker/simulation/gazebo', label: 'Gazebo'},
      {type: 'doc', id: 'systems/aiworker/simulation/isaac_sim_lab', label: 'Isaac Sim/Lab'},
    ],
  },
  {
    type: 'category',
    label: 'Advanced Features',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aiworker/advanced_features/advanced_features', label: 'Overview', key: 'advanced-features-overview'},
      {type: 'doc', id: 'systems/aiworker/advanced_features/cyclo_control', label: 'Cyclo Control'},
      {type: 'doc', id: 'systems/aiworker/advanced_features/behavior_trees', label: 'Behavior Trees'},
      {type: 'doc', id: 'systems/aiworker/advanced_features/robotis_vuer', label: 'ROBOTIS Vuer'},
      {type: 'doc', id: 'systems/aiworker/advanced_features/eazy_navi', label: 'Easy Navi'},
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
          {type: 'doc', id: 'systems/aiworker/resources/technical_story/isaac_vr_teleoperation', label: 'Isaac VR Teleoperation'},
          {type: 'doc', id: 'systems/aiworker/resources/technical_story/isaac_centerpose', label: 'Isaac CenterPose'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Support',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aiworker/support/multi_turn_troubleshooting_guide', label: 'Clearing Multi-turn Error'},
      {type: 'link', label: 'Discord Server', href: 'https://discord.gg/robotis'},
      {type: 'doc', id: 'systems/aiworker/support/issues', label: 'Issues'},
      {type: 'doc', id: 'systems/aiworker/support/faq', label: 'FAQ'},
      {type: 'doc', id: 'systems/aiworker/support/contact_us', label: 'Contact Us'},
    ],
  },
];

export default aiworkerSidebar;

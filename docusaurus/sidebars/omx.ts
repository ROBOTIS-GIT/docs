import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const omxSidebar: SidebarsConfig[string] = [
  {type: 'doc', id: 'systems/omx/introduction', label: 'Introduction'},
  {type: 'doc', id: 'systems/omx/video_gallery', label: 'Video Gallery'},
  {
    type: 'category',
    label: 'Specifications',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omx/specifications/hardware', label: 'Hardware'},
      {type: 'doc', id: 'systems/omx/specifications/software', label: 'Software'},
      {type: 'doc', id: 'systems/omx/specifications/zenoh_communication', label: 'Zenoh Communication'},
    ],
  },
  {
    type: 'category',
    label: 'Quick Start Guide',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omx/quick_start_guide/assembly_guide', label: 'Assembly Guide'},
      {
        type: 'category',
        label: 'Setup Guide',
        link: {type: 'doc', id: 'systems/omx/quick_start_guide/setup_guide/setup_guide'},
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/omx/quick_start_guide/setup_guide/ros2_setup', label: 'ROS 2 Setup'},
          {type: 'link', label: 'LeRobot', href: 'https://huggingface.co/docs/lerobot/omx'},
        ],
      },
      {
        type: 'category',
        label: 'Operation Guide - ROS 2',
        link: {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide'},
        collapsed: false,
        items: [
          {
            type: 'category',
            label: 'Cyclo Manager',
            link: {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/cyclo_manager'},
            collapsed: false,
            items: [
              {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/install', label: 'Install'},
              {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/bringup', label: 'Bringup'},
              {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/manage_container', label: 'Manage Containers'},
              {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/version_update', label: 'Version Update'},
              {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/novnc', label: 'noVNC'},
            ],
          },
          {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/teleoperation', label: 'Teleoperation'},
          {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/robot_control', label: 'Robot Control'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Imitation Learning',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omx/imitation_learning/overview', label: 'Overview', key: 'imitation-learning-overview'},
      {
        type: 'category',
        label: 'Cyclo Intelligence',
        link: {type: 'doc', id: 'systems/omx/imitation_learning/imitation_learning'},
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/omx/imitation_learning/setup', label: 'Setup', key: 'cyclo-intelligence-setup'},
          {type: 'doc', id: 'systems/omx/imitation_learning/data_recording', label: 'Data Recording', key: 'cyclo-intelligence-data-recording'},
          {type: 'doc', id: 'systems/omx/imitation_learning/data_tools', label: 'Data Tools', key: 'cyclo-intelligence-data-tools'},
          {type: 'doc', id: 'systems/omx/imitation_learning/model_training', label: 'Model Training Guide', key: 'cyclo-intelligence-model-training'},
          {type: 'doc', id: 'systems/omx/imitation_learning/model_inference', label: 'Model Inference', key: 'cyclo-intelligence-model-inference'},
        ],
      },
      {
        type: 'category',
        label: 'Physical AI Tools(Legacy)',
        link: {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/imitation_learning'},
        collapsed: true,
        items: [
          {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/setup_guide', label: 'Setup Guide'},
          {
            type: 'category',
            label: 'Dataset Preparation',
            link: {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/dataset_preparation/dataset_preparation'},
            collapsed: false,
            items: [
              {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/dataset_preparation/prerequisites', label: 'Prerequisites'},
              {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/dataset_preparation/recording', label: 'Recording'},
              {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/dataset_preparation/visualization', label: 'Visualization'},
            ],
          },
          {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/model_training', label: 'Model Training', key: 'physical-ai-tools-model-training'},
          {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/model_inference', label: 'Model Inference', key: 'physical-ai-tools-model-inference'},
          {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/data_tools', label: 'Data Tools', key: 'physical-ai-tools-data-tools'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Simulation',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omx/simulation/simulation', label: 'Overview', key: 'simulation-overview'},
      {type: 'doc', id: 'systems/omx/simulation/gazebo', label: 'Gazebo'},
    ],
  },
  {
    type: 'category',
    label: 'Advanced Features',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omx/advanced_features/advanced_features', label: 'Overview', key: 'advanced-features-overview'},
      {type: 'doc', id: 'systems/omx/advanced_features/cyclo_control', label: 'Cyclo Control'},
    ],
  },
  {
    type: 'category',
    label: 'Resources',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omx/resources/open_source', label: 'Open Source'},
      {type: 'doc', id: 'systems/omx/resources/release_notes', label: 'Release Notes'},
      {
        type: 'category',
        label: 'Technical Story',
        link: {type: 'doc', id: 'systems/omx/resources/technical_story/technical_story'},
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/omx/resources/technical_story/drawing_tutorial', label: 'Drawing Tutorial'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Support',
    collapsed: false,
    items: [
      {type: 'link', label: 'Discord Server', href: 'https://discord.gg/robotis'},
      {type: 'doc', id: 'systems/omx/support/issues', label: 'Issues'},
      {type: 'doc', id: 'systems/omx/support/faq', label: 'FAQ'},
      {type: 'doc', id: 'systems/omx/support/contact_us', label: 'Contact Us'},
    ],
  },
];

export default omxSidebar;

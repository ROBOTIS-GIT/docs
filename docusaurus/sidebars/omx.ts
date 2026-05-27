import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const omxSidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    label: 'OMX',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omx/omx/introduction', label: 'Introduction'},
      {type: 'doc', id: 'systems/omx/omx/video_gallery', label: 'Video Gallery'},
    ],
  },
  {
    type: 'category',
    label: 'Specifications',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omx/specifications/hardware', label: 'Hardware'},
      {type: 'doc', id: 'systems/omx/specifications/software', label: 'Software'},
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
          {type: 'doc', id: 'systems/omx/quick_start_guide/setup_guide/physical_ai_tools', label: 'ROS 2 (Physical AI Tools)'},
          {type: 'link', label: 'LeRobot', href: 'https://huggingface.co/docs/lerobot/omx'},
        ],
      },
      {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide', label: 'Operation Guide - ROS 2'},
    ],
  },
  {
    type: 'category',
    label: 'Imitation Learning',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/omx/imitation_learning/imitation_learning', label: 'Overview', key: 'imitation-learning-overview'},
      {
        type: 'category',
        label: 'ROS 2 (Physical AI Tools)',
        collapsed: false,
        items: [
          {
            type: 'category',
            label: 'Dataset Preparation',
            link: {type: 'doc', id: 'systems/omx/imitation_learning/physical_ai_tools/dataset_preparation/dataset_preparation'},
            collapsed: false,
            items: [
              {type: 'doc', id: 'systems/omx/imitation_learning/physical_ai_tools/dataset_preparation/prerequisites', label: 'Prerequisites'},
              {type: 'doc', id: 'systems/omx/imitation_learning/physical_ai_tools/dataset_preparation/recording', label: 'Recording'},
              {type: 'doc', id: 'systems/omx/imitation_learning/physical_ai_tools/dataset_preparation/visualization', label: 'Visualization'},
            ],
          },
          {type: 'doc', id: 'systems/omx/imitation_learning/physical_ai_tools/model_training', label: 'Model Training'},
          {type: 'doc', id: 'systems/omx/imitation_learning/physical_ai_tools/model_inference', label: 'Model Inference'},
          {type: 'doc', id: 'systems/omx/imitation_learning/physical_ai_tools/data_tools', label: 'Data Tools'},
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

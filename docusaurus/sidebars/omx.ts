import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const omxSidebar: SidebarsConfig[string] = [
  {type: 'doc', id: 'systems/omx/introduction', label: 'Introduction'},
  {type: 'doc', id: 'systems/omx/video_gallery', label: 'Video Gallery'},
  {
    type: 'category',
    label: 'Specifications',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omx/specifications/hardware', label: 'Hardware'},
      {type: 'doc', id: 'systems/omx/specifications/software', label: 'Software'},
      {type: 'doc', id: 'systems/omx/specifications/zenoh_communication', label: 'Zenoh Communication'},
    ],
  },
  {
    type: 'category',
    label: 'Quick Start Guide',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omx/quick_start_guide/assembly_guide', label: 'Assembly Guide'},
      {
        type: 'category',
        label: 'Setup Guide',
        link: {type: 'doc', id: 'systems/omx/quick_start_guide/setup_guide/setup_guide'},
        collapsed: true,
        items: [
          {type: 'link', label: 'LeRobot', href: 'https://huggingface.co/docs/lerobot/omx'},
        ],
      },
      {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide', label: 'Operation Guide - ROS 2'},
    ],
  },
  {
    type: 'category',
    label: 'Imitation Learning',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omx/imitation_learning/imitation_learning', label: 'Overview', key: 'cyclo-intelligence-overview'},
      {type: 'doc', id: 'systems/omx/imitation_learning/setup', label: 'Setup', key: 'cyclo-intelligence-setup'},
      {type: 'doc', id: 'systems/omx/imitation_learning/data_recording', label: 'Data Recording', key: 'cyclo-intelligence-data-recording'},
      {type: 'doc', id: 'systems/omx/imitation_learning/data_tools', label: 'Data Tools', key: 'cyclo-intelligence-data-tools'},
      {type: 'doc', id: 'systems/omx/imitation_learning/model_training', label: 'Model Training Guide', key: 'cyclo-intelligence-model-training'},
      {type: 'doc', id: 'systems/omx/imitation_learning/model_inference', label: 'Model Inference', key: 'cyclo-intelligence-model-inference'},
    ],
  },
  {
    type: 'category',
    label: 'Simulation',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omx/simulation/simulation', label: 'Overview', key: 'simulation-overview'},
      {type: 'doc', id: 'systems/omx/simulation/gazebo', label: 'Gazebo'},
    ],
  },
  {
    type: 'category',
    label: 'Advanced Features',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omx/advanced_features/advanced_features', label: 'Overview', key: 'advanced-features-overview'},
      {type: 'doc', id: 'systems/omx/advanced_features/cyclo_control', label: 'Cyclo Control'},
    ],
  },
  {
    type: 'category',
    label: 'Resources',
    collapsed: true,
    items: [
      {type: 'doc', id: 'systems/omx/resources/open_source', label: 'Open Source'},
      {type: 'doc', id: 'systems/omx/resources/release_notes', label: 'Release Notes'},
      {
        type: 'category',
        label: 'Legacy',
        link: {
          type: 'generated-index',
          slug: '/systems/omx/resources/legacy',
          title: 'Legacy',
          description: 'Archived OMX documentation kept for reference.',
        },
        collapsed: true,
        items: [
          {
            type: 'category',
            label: 'Physical AI Tools',
            link: {
              type: 'generated-index',
              slug: '/systems/omx/resources/legacy/physical_ai_tools',
              title: 'Physical AI Tools',
              description: 'Legacy Physical AI Tools documentation for OMX.',
            },
            collapsed: true,
            items: [
              {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/imitation_learning', label: 'Overview', key: 'imitation-learning-overview'},
              {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/setup_guide', label: 'Setup Guide'},
              {
                type: 'category',
                label: 'ROS 2 (Physical AI Tools)',
                collapsed: true,
                items: [
                  {
                    type: 'category',
                    label: 'Dataset Preparation',
                    link: {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/dataset_preparation/dataset_preparation'},
                    collapsed: true,
                    items: [
                      {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/dataset_preparation/prerequisites', label: 'Prerequisites'},
                      {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/dataset_preparation/recording', label: 'Recording'},
                      {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/dataset_preparation/visualization', label: 'Visualization'},
                    ],
                  },
                  {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/model_training', label: 'Model Training', key: 'legacy-physical-ai-tools-model-training'},
                  {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/model_inference', label: 'Model Inference', key: 'legacy-physical-ai-tools-model-inference'},
                  {type: 'doc', id: 'systems/omx/resources/legacy/physical_ai_tools/data_tools', label: 'Data Tools', key: 'legacy-physical-ai-tools-data-tools'},
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'category',
        label: 'Technical Story',
        link: {type: 'doc', id: 'systems/omx/resources/technical_story/technical_story'},
        collapsed: true,
        items: [
          {type: 'doc', id: 'systems/omx/resources/technical_story/drawing_tutorial', label: 'Drawing Tutorial'},
        ],
      },
    ],
  },
  {
    type: 'category',
    label: 'Support',
    collapsed: true,
    items: [
      {type: 'link', label: 'Discord Server', href: 'https://discord.gg/robotis'},
      {type: 'doc', id: 'systems/omx/support/issues', label: 'Issues'},
      {type: 'doc', id: 'systems/omx/support/faq', label: 'FAQ'},
      {type: 'doc', id: 'systems/omx/support/contact_us', label: 'Contact Us'},
    ],
  },
];

export default omxSidebar;

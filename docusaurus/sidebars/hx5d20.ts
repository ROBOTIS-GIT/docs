import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const hx5d20Sidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    label: 'HX5-D20',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/hx5_d20/hx5_d20/introduction', label: 'Introduction'},
      {type: 'doc', id: 'systems/hx5_d20/hx5_d20/video_gallery', label: 'Video Gallery'},
    ],
  },
  {
    type: 'category',
    label: 'Specifications',
    collapsed: false,
    items: [
      {
        type: 'category',
        label: 'Hardware',
        link: {type: 'doc', id: 'systems/hx5_d20/specifications/hardware'},
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/hx5_d20/specifications/control_table', label: 'Control Table'},
        ],
      },
      {type: 'doc', id: 'systems/hx5_d20/specifications/software', label: 'Software'},
    ],
  },
  {
    type: 'category',
    label: 'Quick Start Guide',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/hx5_d20/quick_start_guide/setup_guide', label: 'Setup Guide'},
      {type: 'doc', id: 'systems/hx5_d20/quick_start_guide/operation_guide', label: 'Operation Guide'},
      {type: 'doc', id: 'systems/hx5_d20/quick_start_guide/vr_teleoperation_guide', label: 'VR Teleoperation Guide'},
      {type: 'doc', id: 'systems/hx5_d20/quick_start_guide/dxl_wizard_guide', label: 'DXL Wizard Guide'},
    ],
  },
  {
    type: 'category',
    label: 'Simulation',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/hx5_d20/simulation/simulation', label: 'Overview'},
      {type: 'doc', id: 'systems/hx5_d20/simulation/gazebo', label: 'Gazebo'},
    ],
  },
  {
    type: 'category',
    label: 'Resources',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/hx5_d20/resources/open_source', label: 'Open Source'},
      {type: 'doc', id: 'systems/hx5_d20/resources/release_notes', label: 'Release Notes'},
      {
        type: 'category',
        label: 'Technical Story',
        link: {type: 'doc', id: 'systems/hx5_d20/resources/technical_story/technical_story'},
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/hx5_d20/resources/technical_story/tactile_feedback_grasping', label: 'Tactile Feedback Grasping'},
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
      {type: 'doc', id: 'systems/hx5_d20/support/issues', label: 'Issues'},
      {type: 'doc', id: 'systems/hx5_d20/support/faq', label: 'FAQ'},
      {type: 'doc', id: 'systems/hx5_d20/support/contact_us', label: 'Contact Us'},
    ],
  },
];

export default hx5d20Sidebar;

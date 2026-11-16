import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const aiworkerSidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    className: 'aiworker-top-category',
    collapsible: false,
    label: 'Overview',
    items: [
      {type: 'doc', id: 'systems/aiworker/introduction', label: 'Introduction'},
      {type: 'doc', id: 'systems/aiworker/specifications/hardware', label: 'Hardware Specification'},
      {type: 'doc', id: 'systems/aiworker/specifications/software', label: 'Software Architecture'},
      {type: 'doc', id: 'systems/aiworker/video_gallery', label: 'Video Gallery'},
    ],
  },
  {
    type: 'category',
    className: 'aiworker-top-category',
    collapsible: false,
    label: 'Quick Start Guide',
    items: [
      {type: 'doc', id: 'systems/aiworker/quick_start_guide/setup_hardware', label: 'Hardware Setup'},
      {type: 'doc', id: 'systems/aiworker/quick_start_guide/bringup', label: 'Bringup'},
      {type: 'doc', id: 'systems/aiworker/quick_start_guide/teleoperation', label: 'Teleoperation'},
      {type: 'doc', id: 'systems/aiworker/quick_start_guide/navigation', label: 'Navigation'},
      {
        type: 'category',
        label: 'Advanced',
        items: [
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/advanced/robot_pc_access', label: 'Robot PC Access'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/advanced/container_management', label: 'Container Management'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/advanced/software_update', label: 'Software Update'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/advanced/cli_bringup_teleoperation', label: 'CLI Bringup & Teleoperation'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/advanced/external_ros2_communication', label: 'External ROS 2 Communication'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/advanced/checking_battery_state', label: 'Checking Battery State'},
        ],
      },
    ],
  },
  {
    type: 'category',
    className: 'aiworker-top-category',
    collapsible: false,
    label: 'Imitation Learning',
    items: [
      {type: 'doc', id: 'systems/aiworker/imitation_learning/setup', label: 'Setup'},
      {type: 'doc', id: 'systems/aiworker/imitation_learning/data_recording', label: 'Data Recording'},
      {type: 'doc', id: 'systems/aiworker/imitation_learning/data_tools', label: 'Data Tools'},
      {type: 'doc', id: 'systems/aiworker/imitation_learning/model_training', label: 'Model Training Guide'},
      {type: 'doc', id: 'systems/aiworker/imitation_learning/model_inference', label: 'Model Inference'},
    ],
  },
  {
    type: 'category',
    className: 'aiworker-top-category',
    collapsible: false,
    label: 'Simulation',
    items: [
      {type: 'doc', id: 'systems/aiworker/simulation/simulation', label: 'Overview'},
      {type: 'doc', id: 'systems/aiworker/simulation/gazebo', label: 'Gazebo'},
      {type: 'doc', id: 'systems/aiworker/simulation/isaac_sim_lab', label: 'Isaac Sim/Lab'},
    ],
  },
  {
    type: 'category',
    className: 'aiworker-top-category',
    collapsible: false,
    label: 'Advanced Feature',
    items: [
      {type: 'doc', id: 'systems/aiworker/advanced_features/vr_teleoperation', label: 'VR Teleoperation'},
      {type: 'doc', id: 'systems/aiworker/advanced_features/robotis_hand_installation', label: 'ROBOTIS Hand Installation'},
    ],
  },
  {
    type: 'category',
    className: 'aiworker-top-category',
    collapsible: false,
    label: 'Support',
    items: [
      {type: 'doc', id: 'systems/aiworker/support/troubleshooting', label: 'Troubleshooting'},
      {type: 'doc', id: 'systems/aiworker/resources/open_source', label: 'Open Source'},
      {type: 'link', href: 'https://discord.gg/robotis', label: 'Discord Server'},
      {type: 'doc', id: 'systems/aiworker/support/issues', label: 'Issue'},
      {type: 'doc', id: 'systems/aiworker/support/contact_us', label: 'Contact Us'},
    ],
  },
];

export default aiworkerSidebar;

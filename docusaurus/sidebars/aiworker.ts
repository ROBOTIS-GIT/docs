import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const aiworkerSidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    className: 'aiworker-top-category',
    collapsible: false,
    label: 'Overview',
    items: [
      {type: 'doc', id: 'systems/aiworker/overview/introduction', label: 'Introduction'},
      {type: 'doc', id: 'systems/aiworker/overview/hardware_specification', label: 'Hardware Specification'},
      {type: 'doc', id: 'systems/aiworker/overview/software_architecture', label: 'Software Architecture'},
      {type: 'doc', id: 'systems/aiworker/overview/video_gallery', label: 'Video Gallery'},
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
      {
        type: 'category',
        label: 'In-depth Guide',
        link: {type: 'doc', id: 'systems/aiworker/quick_start_guide/in_depth_guide'},
        items: [
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/in_depth_guide/robot_pc_access', label: 'Robot PC Access'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/in_depth_guide/container_management', label: 'Container Management'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/in_depth_guide/software_update', label: 'Software Update'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/in_depth_guide/cli_bringup_teleoperation', label: 'CLI Bringup & Teleoperation'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/in_depth_guide/pack_position', label: 'Pack Position'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/in_depth_guide/rmw_domain_settings', label: 'RMW & ROS Domain ID'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/in_depth_guide/external_ros2_communication', label: 'External ROS 2 Communication'},
          {type: 'doc', id: 'systems/aiworker/quick_start_guide/in_depth_guide/checking_battery_state', label: 'Checking Battery State'},
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
      {type: 'doc', id: 'systems/aiworker/simulation/simulation', label: 'Overview', key: 'simulation-overview'},
      {type: 'doc', id: 'systems/aiworker/simulation/gazebo', label: 'Gazebo'},
      {type: 'doc', id: 'systems/aiworker/simulation/isaac_sim_lab', label: 'Isaac Sim/Lab'},
    ],
  },
  {
    type: 'category',
    className: 'aiworker-top-category',
    collapsible: false,
    label: 'Advanced Features',
    items: [
      {type: 'doc', id: 'systems/aiworker/advanced_features/navigation', label: 'Navigation', key: 'advanced-navigation'},
      {type: 'doc', id: 'systems/aiworker/advanced_features/cyclo_control', label: 'Cyclo Control'},
      {
        type: 'category',
        label: 'Autonomy Studio',
        items: [
          {type: 'doc', id: 'systems/aiworker/advanced_features/autonomy_studio/overview', label: 'Overview', key: 'autonomy-studio-overview'},
          {type: 'doc', id: 'systems/aiworker/advanced_features/autonomy_studio/action_canvas', label: 'Action Canvas'},
          {
            type: 'category',
            label: 'Mission Canvas',
            items: [
              {type: 'doc', id: 'systems/aiworker/advanced_features/autonomy_studio/mission_canvas/navigation', label: 'Navigation', key: 'mission-canvas-navigation'},
              {type: 'doc', id: 'systems/aiworker/advanced_features/autonomy_studio/mission_canvas/mission', label: 'Mission'},
            ],
          },
        ],
      },
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
      {type: 'doc', id: 'systems/aiworker/support/release_notes', label: 'Release Notes'},
      {type: 'doc', id: 'systems/aiworker/support/open_source', label: 'Open Source'},
      {type: 'link', href: 'https://discord.gg/robotis', label: 'Discord Server'},
      {type: 'doc', id: 'systems/aiworker/support/issues', label: 'Issue'},
      {type: 'doc', id: 'systems/aiworker/support/contact_us', label: 'Contact Us'},
    ],
  },
];

export default aiworkerSidebar;

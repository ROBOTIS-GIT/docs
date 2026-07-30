import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const aisapiensSidebar: SidebarsConfig[string] = [
  {type: 'doc', id: 'systems/aisapiens/introduction', label: 'Introduction'},
  {type: 'doc', id: 'systems/aisapiens/video_gallery', label: 'Video Gallery'},
  {type: 'doc', id: 'systems/aisapiens/specifications/hardware', label: 'Hardware'},
  {type: 'doc', id: 'systems/aisapiens/specifications/electrical_system', label: 'Electrical System'},
  {type: 'doc', id: 'systems/aisapiens/specifications/software', label: 'Software Architecture'},
  {
    type: 'category',
    label: 'Quick Start Guide',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aisapiens/quick_start_guide/operation_guide/operation_guide', label: 'Operation Guide'},
      {type: 'doc', id: 'systems/aisapiens/quick_start_guide/using_remote_controller/using_remote_controller', label: 'Using the Remote Controller'},
    ],
  },
  {
    type: 'category',
    label: 'Development Guide',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aisapiens/development_guide/networking', label: 'Networking'},
      {type: 'doc', id: 'systems/aisapiens/development_guide/ssh', label: 'How to SSH into the Robot'},
      {type: 'doc', id: 'systems/aisapiens/development_guide/cycloctl', label: 'Bringup with cycloctl'},
      {type: 'doc', id: 'systems/aisapiens/development_guide/dynamixel_q_impedance_control', label: 'DYNAMIXEL-Q and Impedance Control'},
      {type: 'doc', id: 'systems/aisapiens/development_guide/ros2_communication', label: 'ROS 2 Communication'},
      {type: 'doc', id: 'systems/aisapiens/development_guide/ros2_package_structure/ros2_package_structure', label: 'ROS 2 Package Structure and Topic Description'},
      {type: 'doc', id: 'systems/aisapiens/development_guide/zenoh_ros2_sdk', label: 'Control with Python SDK'},
      {type: 'doc', id: 'systems/aisapiens/development_guide/sim2real/sim2real', label: 'Sim2Real'},
    ],
  },
  {
    type: 'category',
    label: 'Reinforcement Learning',
    collapsed: false,
    items: [
      {
        type: 'category',
        label: 'Cyclo Lab',
        collapsed: false,
        items: [
          {type: 'doc', id: 'systems/aisapiens/reinforcement_learning/cyclo_lab/cyclo_lab', label: 'Overview', key: 'cyclo-lab-overview'},
          {type: 'doc', id: 'systems/aisapiens/reinforcement_learning/cyclo_lab/locomotion', label: 'Locomotion'},
          {type: 'doc', id: 'systems/aisapiens/reinforcement_learning/cyclo_lab/mimic', label: 'Mimic'},
        ],
      },
      {type: 'doc', id: 'systems/aisapiens/reinforcement_learning/cyclo_mjlab', label: 'Cyclo MJLab'},
    ],
  },
  {
    type: 'category',
    label: 'Motion Generation',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aisapiens/motion_generation/gem-x', label: 'GEM-X'},
      {type: 'doc', id: 'systems/aisapiens/motion_generation_retargeting/kimodo/kimodo', label: 'Kimodo'},
    ],
  },
  {
    type: 'category',
    label: 'Motion Retargeting',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aisapiens/motion_generation_retargeting/soma_retargeter/soma_retargeter', label: 'Soma-retargeter'},
      {type: 'doc', id: 'systems/aisapiens/motion_generation_retargeting/gmr', label: 'GMR'},
    ],
  },
  {
    type: 'category',
    label: 'Imitation Learning',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aisapiens/imitation_learning/overview', label: 'Overview', key: 'imitation-learning-overview'},
      {type: 'doc', id: 'systems/aisapiens/imitation_learning/lerobot', label: 'LeRobot'},
      {type: 'doc', id: 'systems/aisapiens/imitation_learning/cyclo_intelligence', label: 'Cyclo Intelligence'},
    ],
  },
  {
    type: 'category',
    label: 'Resources',
    collapsed: false,
    items: [
      {type: 'doc', id: 'systems/aisapiens/resources/open_source', label: 'Open Source'},
      {type: 'doc', id: 'systems/aisapiens/resources/release_notes', label: 'Release Notes'},
      {type: 'doc', id: 'systems/aisapiens/resources/support', label: 'Support'},
    ],
  },
];

export default aisapiensSidebar;

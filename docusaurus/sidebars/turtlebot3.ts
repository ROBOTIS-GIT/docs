import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label});

const turtlebot3Sidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    label: 'Overview',
    items: [
      doc('systems/turtlebot3/overview/overview', 'Overview'),
      doc('systems/turtlebot3/overview/common_notice', 'Common Notice'),
      doc('systems/turtlebot3/overview/events', 'Events'),
    ],
  },
  {
    type: 'category',
    label: 'Features',
    items: [
      doc('systems/turtlebot3/features/features', 'Features'),
    ],
  },
  {
    type: 'category',
    label: 'Quick Start Guide',
    items: [
      doc('systems/turtlebot3/quick_start_guide/pc_setup', 'PC Setup'),
      doc('systems/turtlebot3/quick_start_guide/sbc_setup', 'SBC Setup'),
      doc('systems/turtlebot3/quick_start_guide/opencr_setup', 'OpenCR Setup'),
      doc('systems/turtlebot3/quick_start_guide/hardware_assembly', 'Hardware Assembly'),
      doc('systems/turtlebot3/quick_start_guide/bringup', 'Bringup'),
      doc('systems/turtlebot3/quick_start_guide/basic_operation', 'Basic Operation'),
      doc('systems/turtlebot3/quick_start_guide/teleoperation', 'Teleoperation'),
      doc('systems/turtlebot3/quick_start_guide/docker_setup', 'Docker Setup'),
      doc('systems/turtlebot3/quick_start_guide/export_turtlebot3_model', 'Export TURTLEBOT3_MODEL'),
    ],
  },
  {
    type: 'category',
    label: 'SLAM',
    items: [
      doc('systems/turtlebot3/slam/slam', 'SLAM'),
    ],
  },
  {
    type: 'category',
    label: 'Navigation',
    items: [
      doc('systems/turtlebot3/navigation/navigation', 'Navigation'),
    ],
  },
  {
    type: 'category',
    label: 'Simulation',
    items: [
      doc('systems/turtlebot3/simulation/gazebo_simulation', 'Gazebo Simulation'),
      doc('systems/turtlebot3/simulation/slam_simulation', 'SLAM Simulation'),
      doc('systems/turtlebot3/simulation/navigation_simulation', 'Navigation Simulation'),
      doc('systems/turtlebot3/simulation/fake_node_simulation', 'Fake Node Simulation'),
      doc('systems/turtlebot3/simulation/standalone_gazebo_simulation', 'Standalone Gazebo Simulation'),
    ],
  },
  {
    type: 'category',
    label: 'Manipulation',
    items: [
      doc('systems/turtlebot3/manipulation/manipulation', 'Manipulation'),
      doc('systems/turtlebot3/manipulation/home_service_challenge', 'Home Service Challenge'),
    ],
  },
  {
    type: 'category',
    label: 'Autonomous Driving',
    items: [
      doc('systems/turtlebot3/autonomous_driving/autonomous_driving', 'Autonomous Driving'),
      doc('systems/turtlebot3/autonomous_driving/autorace', 'AutoRace'),
    ],
  },
  {
    type: 'category',
    label: 'Machine Learning',
    items: [
      doc('systems/turtlebot3/machine_learning/machine_learning', 'Machine Learning'),
      doc('systems/turtlebot3/machine_learning/tensorflow', 'TensorFlow'),
    ],
  },
  {
    type: 'category',
    label: 'Examples',
    items: [
      doc('systems/turtlebot3/examples/basic_examples', 'Basic Examples'),
      doc('systems/turtlebot3/examples/applications', 'Applications'),
    ],
  },
  {
    type: 'category',
    label: 'Friends',
    items: [
      doc('systems/turtlebot3/friends/friends', 'TurtleBot3 Friends'),
    ],
  },
  {
    type: 'category',
    label: 'Learn',
    items: [
      doc('systems/turtlebot3/learn/learn', 'Learn'),
      doc('systems/turtlebot3/learn/videos', 'Videos'),
      doc('systems/turtlebot3/learn/projects', 'Projects'),
    ],
  },
  {
    type: 'category',
    label: 'More Info',
    items: [
      doc('systems/turtlebot3/more_info/more_info', 'More Info'),
      doc('systems/turtlebot3/more_info/dynamixel', 'DYNAMIXEL'),
      doc('systems/turtlebot3/more_info/opencr_1_0', 'OpenCR 1.0'),
      doc('systems/turtlebot3/more_info/lds_01', 'LDS-01'),
      doc('systems/turtlebot3/more_info/lds_02', 'LDS-02'),
      doc('systems/turtlebot3/more_info/lds_03', 'LDS-03'),
      doc('systems/turtlebot3/more_info/realsense', 'RealSense'),
      doc('systems/turtlebot3/more_info/raspberry_pi_camera', 'Raspberry Pi Camera'),
      doc('systems/turtlebot3/more_info/compatible_devices', 'Compatible Devices'),
      doc('systems/turtlebot3/more_info/additional_sensors', 'Additional Sensors'),
      doc('systems/turtlebot3/more_info/open_source', 'OpenSource and Licenses'),
      doc('systems/turtlebot3/more_info/contact_us', 'Contact Us'),
      doc('systems/turtlebot3/more_info/other_ros_versions', 'Other ROS Versions'),
    ],
  },
  {
    type: 'category',
    label: 'FAQ',
    items: [
      doc('systems/turtlebot3/faq/faq', 'FAQ'),
    ],
  },
];

export default turtlebot3Sidebar;

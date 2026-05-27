import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label});

const turtlebot3Sidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    label: 'Overview',
    items: [
      doc('systems/turtlebot3/overview', 'Overview'),
      doc('systems/turtlebot3/common_notice', 'Common Notice'),
      doc('systems/turtlebot3/challenges', 'Events'),
    ],
  },
  {
    type: 'category',
    label: 'Features',
    items: [
      doc('systems/turtlebot3/features', 'Features'),
    ],
  },
  {
    type: 'category',
    label: 'Quick Start Guide',
    items: [
      doc('systems/turtlebot3/quick_start', 'PC Setup'),
      doc('systems/turtlebot3/sbc_setup', 'SBC Setup'),
      doc('systems/turtlebot3/opencr_setup', 'OpenCR Setup'),
      doc('systems/turtlebot3/hardware_setup', 'Hardware Assembly'),
      doc('systems/turtlebot3/bringup', 'Bringup'),
      doc('systems/turtlebot3/basic_operation', 'Basic Operation'),
      doc('systems/turtlebot3/teleoperation', 'Teleoperation'),
      doc('systems/turtlebot3/docker_setup', 'Docker Setup'),
      doc('systems/turtlebot3/export_turtlebot3_model', 'Export TURTLEBOT3_MODEL'),
    ],
  },
  {
    type: 'category',
    label: 'SLAM',
    items: [
      doc('systems/turtlebot3/slam', 'SLAM'),
    ],
  },
  {
    type: 'category',
    label: 'Navigation',
    items: [
      doc('systems/turtlebot3/navigation', 'Navigation'),
    ],
  },
  {
    type: 'category',
    label: 'Simulation',
    items: [
      doc('systems/turtlebot3/simulation', 'Gazebo Simulation'),
      doc('systems/turtlebot3/slam_simulation', 'SLAM Simulation'),
      doc('systems/turtlebot3/nav_simulation', 'Navigation Simulation'),
      doc('systems/turtlebot3/fakenode_simulation', 'Fake Node Simulation'),
      doc('systems/turtlebot3/standalone_gazebo_simulation', 'Standalone Gazebo Simulation'),
    ],
  },
  {
    type: 'category',
    label: 'Manipulation',
    items: [
      doc('systems/turtlebot3/manipulation', 'Manipulation'),
      doc('systems/turtlebot3/home_service_challenge', 'Home Service Challenge'),
    ],
  },
  {
    type: 'category',
    label: 'Autonomous Driving',
    items: [
      doc('systems/turtlebot3/autonomous_driving', 'Autonomous Driving'),
      doc('systems/turtlebot3/autonomous_driving_autorace', 'AutoRace'),
    ],
  },
  {
    type: 'category',
    label: 'Machine Learning',
    items: [
      doc('systems/turtlebot3/machine_learning', 'Machine Learning'),
      doc('systems/turtlebot3/tensorflow', 'TensorFlow'),
    ],
  },
  {
    type: 'category',
    label: 'Examples',
    items: [
      doc('systems/turtlebot3/basic_examples', 'Basic Examples'),
      doc('systems/turtlebot3/applications', 'Applications'),
    ],
  },
  {
    type: 'category',
    label: 'Friends(Locomotion)',
    items: [
      doc('systems/turtlebot3/locomotion', 'TurtleBot3 Friends'),
    ],
  },
  {
    type: 'category',
    label: 'Learn',
    items: [
      doc('systems/turtlebot3/learn', 'Learn'),
      doc('systems/turtlebot3/videos', 'Videos'),
      doc('systems/turtlebot3/projects', 'Projects'),
    ],
  },
  {
    type: 'category',
    label: 'More Info',
    items: [
      doc('systems/turtlebot3/appendixes', 'Appendixes'),
      doc('systems/turtlebot3/appendix_dynamixel', 'DYNAMIXEL'),
      doc('systems/turtlebot3/appendix_opencr1_0', 'OpenCR 1.0'),
      doc('systems/turtlebot3/appendix_lds_01', 'LDS-01'),
      doc('systems/turtlebot3/appendix_lds_02', 'LDS-02'),
      doc('systems/turtlebot3/appendix_lds_03', 'LDS-03'),
      doc('systems/turtlebot3/appendix_realsense', 'RealSense'),
      doc('systems/turtlebot3/appendix_raspi_cam', 'Raspberry Pi Camera'),
      doc('systems/turtlebot3/compatible_devices', 'Compatible Devices'),
      doc('systems/turtlebot3/additional_sensors', 'Additional Sensors'),
      doc('systems/turtlebot3/opensource', 'OpenSource and Licenses'),
      doc('systems/turtlebot3/contact_us', 'Contact Us'),
      doc('systems/turtlebot3/other_ros_versions', 'Other ROS Versions'),
    ],
  },
  {
    type: 'category',
    label: 'FAQ',
    items: [
      doc('systems/turtlebot3/faq', 'FAQ'),
    ],
  },
];

export default turtlebot3Sidebar;

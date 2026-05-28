import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label});

const openmanipulatorXSidebar: SidebarsConfig[string] = [
  doc('systems/openmanipulator_x/overview', 'Overview'),
  doc('systems/openmanipulator_x/specification', 'Specification'),
  doc('systems/openmanipulator_x/assembly', 'Assembly'),
  {
    type: 'category',
    label: 'Quick Start Guide',
    items: [
      doc('systems/openmanipulator_x/quick_start_guide/quick_start_guide', 'Quick Start Guide'),
      doc('systems/openmanipulator_x/quick_start_guide/basic_operation', 'Basic Operation'),
    ],
  },
  {
    type: 'category',
    label: 'ROS Controller',
    items: [
      doc('systems/openmanipulator_x/ros_controller/ros_controller_package', 'Controller Package'),
      doc('systems/openmanipulator_x/ros_controller/ros_controller_check_setting', 'Check Setting'),
      doc('systems/openmanipulator_x/ros_controller/ros_controller_msg', 'Messages'),
      doc('systems/openmanipulator_x/ros_controller/ros_controller_experiment', 'Experiment'),
    ],
  },
  {
    type: 'category',
    label: 'ROS',
    items: [
      doc('systems/openmanipulator_x/ros/ros_operation', 'Operation'),
      doc('systems/openmanipulator_x/ros/ros_simulation', 'Simulation'),
      doc('systems/openmanipulator_x/ros/ros_perceptions', 'Perceptions'),
      doc('systems/openmanipulator_x/ros/ros_applications', 'Applications'),
    ],
  },
  doc('systems/openmanipulator_x/tool_modification', 'Tool Modification'),
  doc('systems/openmanipulator_x/mobile_manipulation', 'Mobile Manipulation'),
  doc('systems/openmanipulator_x/friends', 'Friends'),
];

export default openmanipulatorXSidebar;

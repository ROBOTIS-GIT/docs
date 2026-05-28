import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label});

const openmanipulatorPSidebar: SidebarsConfig[string] = [
  doc('systems/openmanipulator_p/overview', 'Overview'),
  doc('systems/openmanipulator_p/specification', 'Specification'),
  doc('systems/openmanipulator_p/getting_started', 'Getting Started'),
  {
    type: 'category',
    label: 'ROS 1',
    items: [
      doc('systems/openmanipulator_p/ros/ros_setup', 'Setup'),
      doc('systems/openmanipulator_p/ros/ros_controller_package', 'Controller Package'),
      doc('systems/openmanipulator_p/ros/ros_operation', 'Operation'),
      doc('systems/openmanipulator_p/ros/ros_simulation', 'Simulation'),
      doc('systems/openmanipulator_p/ros/ros_tool', 'Tool'),
      doc('systems/openmanipulator_p/ros/ros_perceptions', 'Perceptions'),
      doc('systems/openmanipulator_p/ros/ros_controls', 'Controls'),
      doc('systems/openmanipulator_p/ros/ros_applications', 'Applications'),
      doc('systems/openmanipulator_p/ros/ros_manipulator_manager', 'Manipulator Manager'),
    ],
  },
  {
    type: 'category',
    label: 'ROS 2',
    items: [
      doc('systems/openmanipulator_p/ros2/ros2_setup', 'Setup'),
      doc('systems/openmanipulator_p/ros2/ros2_controller_package', 'Controller Package'),
      doc('systems/openmanipulator_p/ros2/ros2_operation', 'Operation'),
      doc('systems/openmanipulator_p/ros2/ros2_simulation', 'Simulation'),
      doc('systems/openmanipulator_p/ros2/ros2_tools', 'Tools'),
      doc('systems/openmanipulator_p/ros2/ros2_perceptions', 'Perceptions'),
      doc('systems/openmanipulator_p/ros2/ros2_controls', 'Controls'),
      doc('systems/openmanipulator_p/ros2/ros2_applications', 'Applications'),
      doc('systems/openmanipulator_p/ros2/ros2_manipulator_manager', 'Manipulator Manager'),
    ],
  },
];

export default openmanipulatorPSidebar;

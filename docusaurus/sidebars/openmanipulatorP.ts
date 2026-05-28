import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string, key: string) => ({
  type: 'doc' as const,
  id,
  label,
  key,
});

const openmanipulatorPSidebar: SidebarsConfig[string] = [
  doc('systems/openmanipulator_p/overview', 'Overview', 'omp-overview'),
  doc('systems/openmanipulator_p/specification', 'Specification', 'omp-specification'),
  doc('systems/openmanipulator_p/getting_started', 'Getting Started', 'omp-getting-started'),
  {
    type: 'category',
    label: 'ROS 1',
    items: [
      doc('systems/openmanipulator_p/ros/ros_setup', 'Setup', 'omp-ros1-setup'),
      doc('systems/openmanipulator_p/ros/ros_controller_package', 'Controller Package', 'omp-ros1-controller-package'),
      doc('systems/openmanipulator_p/ros/ros_operation', 'Operation', 'omp-ros1-operation'),
      doc('systems/openmanipulator_p/ros/ros_simulation', 'Simulation', 'omp-ros1-simulation'),
      doc('systems/openmanipulator_p/ros/ros_tool', 'Tool', 'omp-ros1-tool'),
      doc('systems/openmanipulator_p/ros/ros_perceptions', 'Perceptions', 'omp-ros1-perceptions'),
      doc('systems/openmanipulator_p/ros/ros_controls', 'Controls', 'omp-ros1-controls'),
      doc('systems/openmanipulator_p/ros/ros_applications', 'Applications', 'omp-ros1-applications'),
      doc('systems/openmanipulator_p/ros/ros_manipulator_manager', 'Manipulator Manager', 'omp-ros1-manipulator-manager'),
    ],
  },
  {
    type: 'category',
    label: 'ROS 2',
    items: [
      doc('systems/openmanipulator_p/ros2/ros2_setup', 'Setup', 'omp-ros2-setup'),
      doc('systems/openmanipulator_p/ros2/ros2_controller_package', 'Controller Package', 'omp-ros2-controller-package'),
      doc('systems/openmanipulator_p/ros2/ros2_operation', 'Operation', 'omp-ros2-operation'),
      doc('systems/openmanipulator_p/ros2/ros2_simulation', 'Simulation', 'omp-ros2-simulation'),
      doc('systems/openmanipulator_p/ros2/ros2_tools', 'Tools', 'omp-ros2-tools'),
      doc('systems/openmanipulator_p/ros2/ros2_perceptions', 'Perceptions', 'omp-ros2-perceptions'),
      doc('systems/openmanipulator_p/ros2/ros2_controls', 'Controls', 'omp-ros2-controls'),
      doc('systems/openmanipulator_p/ros2/ros2_applications', 'Applications', 'omp-ros2-applications'),
      doc('systems/openmanipulator_p/ros2/ros2_manipulator_manager', 'Manipulator Manager', 'omp-ros2-manipulator-manager'),
    ],
  },
];

export default openmanipulatorPSidebar;

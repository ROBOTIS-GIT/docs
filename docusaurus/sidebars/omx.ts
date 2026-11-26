import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

/*
 * The OMX menu is made of two kinds of groups.
 *
 * - A title, such as "Quick Start Guide", is a group that does not fold and is not a link
 *   (`collapsible: false`, class `omx-sidebar-title`). It is set in large letters, with a line down the left of its rows.
 * - A row that folds, such as "Cyclo Intelligence", is closed until it is clicked (`collapsed: true`).
 *   It also opens by itself while one of its pages is open.
 *
 * The classes are styled in src/css/custom.css.
 */
const omxSidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    label: 'Overview',
    collapsible: false,
    className: 'omx-sidebar-title',
    items: [
      {type: 'doc', id: 'systems/omx/introduction', label: 'Introduction'},
      {type: 'doc', id: 'systems/omx/specifications/hardware', label: 'Hardware Specification'},
      // Zenoh is explained in the last part of this page, Middleware.
      {type: 'doc', id: 'systems/omx/specifications/software', label: 'Software Architecture'},
      {type: 'doc', id: 'systems/omx/video_gallery', label: 'Video Gallery'},
    ],
  },
  {
    type: 'category',
    label: 'Quick Start Guide',
    collapsible: false,
    className: 'omx-sidebar-title',
    // The names of the AI Worker Quick Start Guide, after the Assembly Guide. OMX also has Software Setup: the
    // reader installs the robot software on their own PC. The old Setup Guide, ROS 2 Setup, Operation Guide and
    // Teleoperation addresses lead to these pages (src/data/docRedirects.json).
    items: [
      {type: 'doc', id: 'systems/omx/quick_start_guide/assembly_guide', label: 'Assembly Guide'},
      {type: 'doc', id: 'systems/omx/quick_start_guide/setup_hardware', label: 'Hardware Setup'},
      {type: 'doc', id: 'systems/omx/quick_start_guide/setup_software', label: 'Software Setup'},
      {type: 'doc', id: 'systems/omx/quick_start_guide/bringup', label: 'Bringup'},
      {type: 'doc', id: 'systems/omx/quick_start_guide/teleoperation', label: 'Teleoperation'},
    ],
  },
  {
    type: 'category',
    label: 'Imitation Learning',
    collapsible: false,
    className: 'omx-sidebar-title',
    // OMX has no Cyclo Intelligence pages of its own: Train and run AI is the OMX guide, and its last step points to
    // Cyclo Intelligence in the Cyclo manual. The old addresses lead to Train and run AI (src/data/docRedirects.json).
    items: [
      // The first try, right after Bringup. Its page stays in quick_start_guide/, so its address does not change.
      {type: 'doc', id: 'systems/omx/quick_start_guide/train_and_run_ai', label: 'Train and run AI'},
    ],
  },
  {
    // As the AI Worker Simulation group. The Overview lists the models, MuJoCo included: OMX has no MuJoCo launch
    // guide, so MuJoCo has no page of its own. Gazebo has its page.
    type: 'category',
    label: 'Simulation',
    collapsible: false,
    className: 'omx-sidebar-title',
    items: [
      {type: 'doc', id: 'systems/omx/simulation/simulation', label: 'Overview', key: 'simulation-overview'},
      {type: 'doc', id: 'systems/omx/simulation/gazebo', label: 'Gazebo'},
    ],
  },
  {
    // As the AI Worker Advanced Features group. The OMX Cyclo Manager pages are gone, as the AI Worker ones: their
    // addresses lead to the Cyclo Manager manual (src/data/docRedirects.json).
    type: 'category',
    label: 'Advanced Features',
    collapsible: false,
    className: 'omx-sidebar-title',
    items: [
      // One page: the bringup, MoveIt 2, the GUI (which runs on MoveIt 2) and, last, keyboard teleop (which needs
      // only the bringup).
      {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/robot_control', label: 'MoveIt 2'},
      // The old Advanced Features text is the first part of this page.
      {type: 'doc', id: 'systems/omx/advanced_features/cyclo_control', label: 'Cyclo Control'},
      // Another way to use OMX, with the LeRobot workflow; the Setup Guide had this link before. Software Setup also
      // points to it at its top.
      {type: 'link', label: 'LeRobot', href: 'https://huggingface.co/docs/lerobot/omx'},
    ],
  },
  {
    type: 'category',
    label: 'Support',
    collapsible: false,
    className: 'omx-sidebar-title',
    items: [
      // The release notes are on Discord. Their page only links there.
      // The FAQ page (questions often asked on Discord) and the pages under support/troubleshooting/ are not in the
      // menu: the Troubleshooting page links to them.
      {type: 'doc', id: 'systems/omx/support/troubleshooting', label: 'Troubleshooting'},
      {type: 'doc', id: 'systems/omx/resources/release_notes', label: 'Release Notes'},
      {type: 'doc', id: 'systems/omx/resources/open_source', label: 'Open Source'},
      {type: 'link', label: 'Discord Server', href: 'https://discord.gg/robotis'},
      {type: 'doc', id: 'systems/omx/support/issues', label: 'Issue'},
      {type: 'doc', id: 'systems/omx/support/contact_us', label: 'Contact Us'},
    ],
  },
];

export default omxSidebar;

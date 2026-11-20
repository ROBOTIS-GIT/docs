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
      {type: 'doc', id: 'systems/omx/specifications/hardware', label: 'Hardware Specifications'},
      // Zenoh is explained in the last part of this page, Middleware.
      {type: 'doc', id: 'systems/omx/specifications/software', label: 'Software Specifications'},
      {type: 'doc', id: 'systems/omx/video_gallery', label: 'Video Gallery'},
    ],
  },
  {
    type: 'category',
    label: 'Quick Start Guide',
    collapsible: false,
    className: 'omx-sidebar-title',
    items: [
      {type: 'doc', id: 'systems/omx/quick_start_guide/assembly_guide', label: 'Assemble OMX'},
      // Move OMX does what the Setup Guide, ROS 2 Setup, Operation Guide and Teleoperation pages did, so they are
      // not listed.
      {type: 'doc', id: 'systems/omx/quick_start_guide/move_omx', label: 'Move OMX'},
      // Keep these in the same order as the pages in quick_start_guide/_quick_start.ts.
      {type: 'doc', id: 'systems/omx/quick_start_guide/train_and_run_ai', label: 'Train and run AI'},
    ],
  },
  {
    type: 'category',
    label: 'Imitation Learning',
    collapsible: false,
    className: 'omx-sidebar-title',
    // The rows that fold are closed until they are clicked. The Imitation Learning Overview is not listed: it only
    // compared Cyclo Intelligence with Physical AI Tools, which OMX no longer uses.
    items: [
      {
        type: 'category',
        label: 'Cyclo Intelligence',
        link: {type: 'doc', id: 'systems/omx/imitation_learning/imitation_learning'},
        collapsed: true,
        items: [
          {type: 'doc', id: 'systems/omx/imitation_learning/setup', label: 'Setup', key: 'cyclo-intelligence-setup'},
          {type: 'doc', id: 'systems/omx/imitation_learning/data_recording', label: 'Data Recording', key: 'cyclo-intelligence-data-recording'},
          {type: 'doc', id: 'systems/omx/imitation_learning/data_tools', label: 'Data Tools', key: 'cyclo-intelligence-data-tools'},
          {type: 'doc', id: 'systems/omx/imitation_learning/model_training', label: 'Model Training Guide', key: 'cyclo-intelligence-model-training'},
          {type: 'doc', id: 'systems/omx/imitation_learning/model_inference', label: 'Model Inference', key: 'cyclo-intelligence-model-inference'},
        ],
      },
      // Physical AI Tools (Legacy) is left out of the OMX menu: the team decided OMX uses only Cyclo Intelligence.
    ],
  },
  {
    // Each row finishes the title as a sentence: "Control OMX with MoveIt 2, GUI or Keyboard".
    type: 'category',
    label: 'Control OMX',
    collapsible: false,
    className: 'omx-sidebar-title',
    items: [
      {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/robot_control', label: 'With MoveIt 2, GUI or Keyboard'},
      // The Advanced Features text is the first part of this page.
      {type: 'doc', id: 'systems/omx/advanced_features/cyclo_control', label: 'By Target Pose (Cyclo Control)'},
      {
        // The arrow leaves no room for one line, so "(Cyclo Manager)" goes on its own line.
        type: 'category',
        label: 'From a Browser\n(Cyclo Manager)',
        className: 'omx-sidebar-two-line',
        link: {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/cyclo_manager'},
        collapsed: true,
        items: [
          {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/install', label: 'Install'},
          {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/bringup', label: 'Bringup'},
          {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/manage_container', label: 'Manage Containers'},
          {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/version_update', label: 'Version Update'},
          {type: 'doc', id: 'systems/omx/quick_start_guide/operation_guide/cyclo_manager/novnc', label: 'noVNC'},
        ],
      },
      // The Gazebo steps are the last part of this page.
      {type: 'doc', id: 'systems/omx/simulation/simulation', label: 'In a Simulator'},
    ],
  },
  {
    type: 'category',
    label: 'Support',
    collapsible: false,
    className: 'omx-sidebar-title',
    items: [
      // The release notes are on Discord. Their page only links there. The FAQ page is not listed: the questions
      // often asked on Discord are cards on the Troubleshooting page.
      // The pages under support/troubleshooting/ are not in the menu: the Troubleshooting page lists them.
      {type: 'doc', id: 'systems/omx/support/troubleshooting', label: 'Troubleshooting'},
      {type: 'doc', id: 'systems/omx/resources/release_notes', label: 'Release Notes'},
      {type: 'doc', id: 'systems/omx/resources/open_source', label: 'Open Source'},
      {type: 'link', label: 'Discord', href: 'https://discord.gg/robotis'},
      {type: 'doc', id: 'systems/omx/support/issues', label: 'Issues'},
      {type: 'doc', id: 'systems/omx/support/contact_us', label: 'Contact Us'},
    ],
  },
];

export default omxSidebar;

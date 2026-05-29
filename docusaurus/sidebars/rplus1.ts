import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const rplus1Sidebar: SidebarsConfig[string] = [
  doc('software/rplus_1_0/rplus_1_0', 'R+ 1.0'),
  {
    type: 'category',
    label: 'R+ Task',
    link: {type: 'doc', id: 'software/rplus_1_0/rplus_task/getting_started'},
    items: [
      doc('software/rplus_1_0/rplus_task/programming_01', 'Programming 1'),
      doc('software/rplus_1_0/rplus_task/programming_02', 'Programming 2'),
      doc('software/rplus_1_0/rplus_task/task_misc', 'Miscellaneous'),
    ],
  },
  doc('software/rplus_1_0/rplus_manager', 'R+ Manager'),
  doc('software/rplus_1_0/rplus_motion', 'R+ Motion'),
  doc('software/rplus_1_0/dynamixel_wizard', 'Dynamixel Wizard'),
];

export default rplus1Sidebar;

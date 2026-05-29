import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const rplusTask3Sidebar: SidebarsConfig[string] = [
  doc('software/rplus_task_3_0/rplus_task_3_0', 'R+ Task 3.0'),
  doc('software/rplus_task_3_0/task_programming', 'Task Programming'),
  doc('software/rplus_task_3_0/task_instructions', 'Task Instructions'),
  doc('software/rplus_task_3_0/task_parameters', 'Task Parameters'),
  doc('software/rplus_task_3_0/motion_programming', 'Motion Programming'),
  doc('software/rplus_task_3_0/python_api', 'Python API'),
  doc('software/rplus_task_3_0/useful_tips', 'Useful Tips'),
];

export default rplusTask3Sidebar;

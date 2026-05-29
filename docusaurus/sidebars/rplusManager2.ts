import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const rplusManager2Sidebar: SidebarsConfig[string] = [
  doc('software/rplus_manager_2_0/rplus_manager_2_0', 'R+ Manager 2.0'),
];

export default rplusManager2Sidebar;

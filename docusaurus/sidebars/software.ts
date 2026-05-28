import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const softwareSidebar: SidebarsConfig[string] = [
  doc('software/overview', 'Overview'),
];

export default softwareSidebar;

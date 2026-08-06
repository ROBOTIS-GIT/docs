import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const cycloSidebar: SidebarsConfig[string] = [
  doc('software/cyclo/cyclo', 'What is CYCLO?'),
];

export default cycloSidebar;

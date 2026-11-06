import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const cycloSidebar: SidebarsConfig[string] = [
  doc('software/cyclo/cyclo', 'What is CYCLO?'),
  {
    type: 'category',
    label: 'Modules',
    collapsed: false,
    items: [
      doc('software/cyclo/cyclo_studio', 'Cyclo Studio'),
      doc('software/cyclo/cyclo_marketplace', 'Cyclo Marketplace'),
      doc('software/cyclo/cyclo_intelligence', 'Cyclo Intelligence'),
      doc('software/cyclo/cyclo_lab', 'Cyclo Lab'),
      doc('software/cyclo/cyclo_control', 'Cyclo Control'),
      doc('software/cyclo/cyclo_app', 'Cyclo App'),
      doc('software/cyclo/cyclo_manager', 'Cyclo Manager'),
      doc('software/cyclo/cyclo_flow', 'Cyclo Flow'),
      doc('software/cyclo/cyclo_os', 'Cyclo OS'),
    ],
  },
];

export default cycloSidebar;

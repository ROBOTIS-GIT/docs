import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const aisapiensSidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    label: 'AI Sapiens',
    link: {type: 'doc', id: 'systems/aisapiens/introduction'},
    items: ['systems/aisapiens/introduction'],
  },
];

export default aisapiensSidebar;

import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const eduSidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    label: 'Bioloid',
    collapsed: true,
    items: [
      {type: 'doc', id: 'edu/bioloid/premium', label: 'ROBOTIS Premium'},
    ],
  },
  {
    type: 'category',
    label: 'Engineer',
    collapsed: true,
    items: [
      {type: 'doc', id: 'edu/engineer/kit1', label: 'Engineer Kit 1'},
      {
        type: 'category',
        label: 'Engineer Kit 2',
        collapsed: true,
        items: [
          {type: 'doc', id: 'edu/engineer/kit2_introduction', label: 'Introduction'},
          {type: 'doc', id: 'edu/engineer/kit2_quickstart', label: 'Quickstart'},
          {type: 'doc', id: 'edu/engineer/kit2_advanced_course', label: 'Advanced Course'},
          {type: 'doc', id: 'edu/engineer/kit2_reference', label: 'Reference'},
        ],
      },
    ],
  },
];

export default eduSidebar;

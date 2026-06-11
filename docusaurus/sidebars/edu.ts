import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const eduSidebar: SidebarsConfig[string] = [
  // ── EN ─────────────────────────────────────────────────────────────
  {
    type: 'html',
    value: '<div class="sidebar-section-label">EN</div>',
  },
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

  // ── KR ─────────────────────────────────────────────────────────────
  {
    type: 'html',
    value: '<div class="sidebar-section-label">KR</div>',
  },
  {
    type: 'category',
    label: '바이올로이드',
    collapsed: true,
    items: [
      {type: 'doc', id: 'edu/kr/bioloid/premium', label: 'ROBOTIS Premium'},
    ],
  },
  {
    type: 'category',
    label: '엔지니어',
    collapsed: true,
    items: [
      {type: 'doc', id: 'edu/kr/engineer/kit1', label: '엔지니어 키트 1'},
      {
        type: 'category',
        label: '엔지니어 키트 2',
        collapsed: true,
        items: [
          {type: 'doc', id: 'edu/kr/engineer/kit2_introduction', label: '소개'},
          {type: 'doc', id: 'edu/kr/engineer/kit2_quickstart', label: '퀵스타트'},
          {type: 'doc', id: 'edu/kr/engineer/kit2_advanced_course', label: '심화 과정'},
          {type: 'doc', id: 'edu/kr/engineer/kit2_reference', label: '참고 자료'},
        ],
      },
    ],
  },
];

export default eduSidebar;

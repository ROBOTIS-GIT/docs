import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const partsSidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    label: 'Controller',
    collapsed: true,
    items: [
      {type: 'doc', id: 'parts/controller/openrb-150', label: 'OpenRB-150'},
      {type: 'doc', id: 'parts/controller/opencr10', label: 'OpenCR 1.0'},
      {type: 'doc', id: 'parts/controller/cm-550', label: 'CM-550'},
      {type: 'doc', id: 'parts/controller/cm-530', label: 'CM-530'},
    ],
  },
  {
    type: 'category',
    label: 'Interface',
    collapsed: true,
    items: [
      {type: 'doc', id: 'parts/interface/u2d2', label: 'U2D2'},
      {type: 'doc', id: 'parts/interface/u2d2_power_hub', label: 'U2D2 Power Hub Board'},
      {type: 'doc', id: 'parts/interface/dxl_bridge', label: 'DXL-Bridge'},
      {type: 'doc', id: 'parts/interface/dynamixel_shield', label: 'DYNAMIXEL Shield'},
      {type: 'doc', id: 'parts/interface/mkr_shield', label: 'MKR Shield'},
    ],
  },
];

export default partsSidebar;

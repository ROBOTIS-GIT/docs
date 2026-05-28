import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label});

const rhp12rnurSidebar: SidebarsConfig[string] = [
  doc('systems/rh_p12_rn/rh_p12_rn_ur', 'RH-P12-RN-UR'),
];

export default rhp12rnurSidebar;

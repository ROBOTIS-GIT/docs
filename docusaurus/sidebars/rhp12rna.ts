import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label});

const rhp12rnaSidebar: SidebarsConfig[string] = [
  doc('systems/rh_p12_rn/rh_p12_rn', 'Introduction'),
  doc('systems/rh_p12_rn/examples_rna', 'Examples'),
  doc('systems/rh_p12_rn/gazebo_rna', 'Gazebo Simulation'),
];

export default rhp12rnaSidebar;

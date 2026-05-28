import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const dynamixelWizardSidebar: SidebarsConfig[string] = [
  doc('software/dynamixel_wizard_2_0/dynamixel_wizard_2_0', 'DYNAMIXEL Wizard 2.0'),
];

export default dynamixelWizardSidebar;

import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const dynamixelWizardSidebar: SidebarsConfig[string] = [
  {
    type: 'category',
    label: 'DYNAMIXEL Wizard 2.0',
    collapsed: false,
    link: {type: 'doc', id: 'software/dynamixel_wizard_2_0/introduction'},
    items: [
      doc('software/dynamixel_wizard_2_0/installation', 'Installation'),
      doc('software/dynamixel_wizard_2_0/menu_description', 'Menu Description'),
      doc('software/dynamixel_wizard_2_0/basic_features', 'Basic Features'),
      doc('software/dynamixel_wizard_2_0/advanced_features', 'Advanced Features'),
    ],
  },
  {
    type: 'category',
    label: 'DYNAMIXEL Wizard CLI',
    collapsed: false,
    link: {type: 'doc', id: 'software/dynamixel_wizard_cli/introduction'},
    items: [
      doc('software/dynamixel_wizard_cli/commands', 'Commands'),
      doc('software/dynamixel_wizard_cli/basic_usage', 'Basic Usage'),
      doc('software/dynamixel_wizard_cli/advanced_features', 'Advanced Features'),
      doc('software/dynamixel_wizard_cli/script_mode', 'Script Mode'),
    ],
  },
];

export default dynamixelWizardSidebar;

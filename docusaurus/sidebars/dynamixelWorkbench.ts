import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const dynamixelWorkbenchSidebar: SidebarsConfig[string] = [
  doc('software/dynamixel_workbench/dynamixel_workbench', 'DYNAMIXEL Workbench'),
];

export default dynamixelWorkbenchSidebar;

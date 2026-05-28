import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const doc = (id: string, label: string) => ({type: 'doc' as const, id, label, key: id});

const arduinoIdeSidebar: SidebarsConfig[string] = [
  doc('software/arduino_ide/arduino_ide', 'Arduino IDE'),
];

export default arduinoIdeSidebar;

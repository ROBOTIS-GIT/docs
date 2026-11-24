import type {Guide} from '@site/src/components/Tutorial';
import quickStart from '../quick_start_guide/_quick_start';

// The OMX troubleshooting guides and the FAQ page, in the order of the Troubleshooting page. "Help me, AI!" gives
// them to the AI.
// A new guide goes in support/troubleshooting/<group>/ and gets one line here and one card on the Troubleshooting
// page (troubleshooting.mdx). A new short question goes in the FAQ page (faq.mdx) only.
const page = (path: string) => `/docs/systems/omx/support/troubleshooting/${path}`;

const guides = [
  {title: 'A Motor Blinks Red or Is Not Found', to: page('motors/motor_not_found')},
  {title: 'OMX Does Not Start on a Virtual Machine, Windows, or Mac', to: page('pc/pc_not_supported')},
  {title: 'The Follower Jumps or Does Not Match the Leader', to: page('motors/arm_moves_wrong')},
  {title: 'How Do I Replace a Motor?', to: page('motors/replace_motor')},
  {title: 'Frequently Asked Questions', to: '/docs/systems/omx/support/faq'},
];

// "Help me, AI!" on the Troubleshooting page: the AI gets these pages and is asked to find the cause with the reader.
const help: Guide = {
  title: 'OMX Troubleshooting',
  intro: 'I use a ROBOTIS OMX, and something does not work. These pages may have the answer:',
  pages: [
    {title: 'Troubleshooting', to: '/docs/systems/omx/support/troubleshooting'},
    ...guides,
    ...quickStart.pages,
  ],
  ask: [
    'Then help me find what is wrong, one check at a time.',
    'Use simple words. Ask me what I see: what my terminal shows, the lights on the motors, or how the arms move.',
  ],
  note: 'The AI gets the links to these pages and is asked to find the problem with you.',
};

export default help;

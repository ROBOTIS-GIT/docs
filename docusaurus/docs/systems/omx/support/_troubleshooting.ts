import type {Guide} from '@site/src/components/Tutorial';
import quickStart from '../quick_start_guide/_quick_start';

// The OMX problem and question pages (often asked on Discord), by group, in the order they are listed on the
// Troubleshooting page.
// A new problem page goes in support/troubleshooting/<group>/ and gets one line here:
// the Troubleshooting page lists it, and "Help me, AI!" gives it to the AI.
const page = (path: string) => `/docs/systems/omx/support/troubleshooting/${path}`;

export const problems = {
  motors: [
    {title: 'The Follower Jumps or Does Not Match the Leader', to: page('motors/arm_moves_wrong')},
    {title: 'A Motor Blinks Red or Is Not Found', to: page('motors/motor_not_found')},
    {title: 'Do I Set the Motor IDs Myself?', to: page('motors/motor_ids')},
    {title: 'How Do I Replace a Motor?', to: page('motors/replace_motor')},
    {title: 'Where Do I Get a Repair?', to: page('motors/repair')},
  ],
  pc: [
    {title: 'OMX Does Not Start on a Virtual Machine, Windows, or Mac', to: page('pc/pc_not_supported')},
    {title: 'Which PC Can I Use?', to: page('pc/which_pc')},
    {title: 'What Power Do the Arms Need?', to: page('pc/power')},
  ],
  using: [
    {title: 'The Leader Does Not Go to Its Start Pose', to: page('using/leader_start_pose')},
    {title: 'Can I Use Another Camera?', to: page('using/other_camera')},
    {title: 'Can the Leader and the Follower Be on Two PCs?', to: page('using/two_pcs')},
    {title: 'Can I Use Two OMX Sets Together, or One Leader for Two Followers?', to: page('using/two_sets')},
    {title: 'Does the Leader Have Gravity Compensation?', to: page('using/gravity_compensation')},
    {title: 'Where Is the Older OMX Manual?', to: page('using/older_manual')},
  ],
};

// "Help me, AI!" on the Troubleshooting page: the AI gets these pages and is asked to find the cause with the reader.
const help: Guide = {
  title: 'OMX Troubleshooting',
  intro: 'I use a ROBOTIS OMX, and something does not work. These pages may have the answer:',
  pages: [
    {title: 'Troubleshooting', to: '/docs/systems/omx/support/troubleshooting'},
    ...Object.values(problems).flat(),
    ...quickStart.pages,
  ],
  ask: [
    'Then help me find what is wrong, one check at a time.',
    'Use simple words. Ask me what I see: what my terminal shows, the lights on the motors, or how the arms move.',
  ],
  note: 'The AI gets the links to these pages and is asked to find the problem with you.',
};

export default help;

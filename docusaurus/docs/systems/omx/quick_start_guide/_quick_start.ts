import type {Guide} from '@site/src/components/Tutorial';

// The pages of the OMX Quick Start Guide, in reading order.
// "Help me, AI!" on each page gives the AI these links. Keep them in the same order as the left menu.
const quickStart: Guide = {
  title: 'OMX Quick Start Guide',
  pages: [
    {title: 'Assemble OMX', to: '/docs/systems/omx/quick_start_guide/assembly_guide'},
    {title: 'Move OMX', to: '/docs/systems/omx/quick_start_guide/move_omx'},
    {title: 'Train and run AI', to: '/docs/systems/omx/quick_start_guide/train_and_run_ai'},
  ],
};

export default quickStart;

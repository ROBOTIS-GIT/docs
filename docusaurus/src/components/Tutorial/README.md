# Tutorial kit

Parts for follow-along guide pages. Only the OMX Quick Start Guide uses them:

- `docs/systems/omx/quick_start_guide/move_omx.mdx` (Bringup)
- `docs/systems/omx/quick_start_guide/train_and_run_ai.mdx` (Train and run AI)
- `docs/systems/omx/quick_start_guide/_quick_start.ts` holds the guide's title and the links to its pages.

No other page of the site uses this folder, so a change here changes only these two pages.

## What a guide page does differently

A guide page shows one step at a time, with a step bar that stays at the top of the window.
The Docusaurus page parts move from page to page, not from step to step inside one page.
So a guide page turns three of them off in its front matter, and this kit draws its own:

| Docusaurus part | Turned off with | Drawn instead by |
| --- | --- | --- |
| Page title | `hide_title: true` | `GuidePage`: the title, with "Help me, AI!" at its right end |
| List of headings at the right | `hide_table_of_contents: true` | `StepTabs`: the steps, and the `###` titles of the open step |
| Previous and Next at the bottom | `pagination_prev: null` and `pagination_next: null` | `StepTabs`: Back and Next under each step |

Everything else is Docusaurus: the menu, the top bar, search, the footer and the code blocks.

## Write a guide page

```mdx
---
title: Bringup
hide_title: true
hide_table_of_contents: true
pagination_prev: null
pagination_next: null
---

import {GuidePage, StepTab, StepTabs} from '@site/src/components/Tutorial';
import quickStart from './_quick_start';

<GuidePage guide={quickStart} title="Bringup">

<StepTabs back={quickStart.pages[0]} next={quickStart.pages[2]} firstNumber={0}>

<StepTab id="before-you-begin" title="Before you begin">

### What You Will Achieve

...

</StepTab>

</StepTabs>

</GuidePage>
```

- Each `StepTab` is one step. Its `id` is the end of the address that opens it, such as `#connect-omx`.
- Each step is one box. Put its parts under `###` headings. They are listed at the right.
- `back` is the page before this one, and `next` is the page after it.
  The first step's Back and the last step's Next go there.
  They are written by hand, so keep them in the same order as the menu (`sidebars/omx.ts`).
- Use `firstNumber={0}` when the first step is "Before you begin", so the real work starts at Step 1.

## Parts

Each part's comment in `index.tsx` says how to use it.

| Part | Use it for |
| --- | --- |
| `GuidePage` | One page of a guide. It holds everything else. |
| `StepTabs`, `StepTab` | The steps of the page, shown one at a time. |
| `Goal` | What the reader gets at the end, in "Before you begin". |
| `TutorialMedia` | A picture or a short looping clip. It can have names, a tag, numbered points and outlines. |
| `MediaRow` | Pictures side by side. |
| `ScreenshotBox` | A screenshot with the short text that points at it. |
| `Clicks` | Things to click, in order, numbered like the points on the screenshot. |
| `Shots`, `Shot` | Small actions side by side, each a short clip with one sentence. |
| `TerminalMap` | The terminals a step keeps open, drawn as one window split into panes. |
| `MarkedOutput` | Command output where the parts that are different on every PC have a red outline. |
| `Checks` | What a good result looks like, when it is not in a terminal. |
| `NotGood` | What to do when the result is different. It stays closed until the reader opens it. |
| `OnlyIf` | Parts that only some readers need. It stays closed until the reader opens it. |
| `Caution` | Safety notes, and nothing else. |
| `Notice` | One thing that is not about safety but must not be missed. |
| `GoFurther` | The end of a guide: it sends the reader on to a bigger manual. |

## Terminal pictures

- Real GNOME Terminal screenshots at real size, 80 columns wide.
  The nano picture is the one exception: it is 108 columns, so its long line fits.
- A label at the top names the terminal: "PC terminal", "Robot container terminal" or "Cyclo container terminal".
- A red outline marks what is different on every PC, such as a board's name.

## How it behaves

- Every step stays in the page, so the site search and "Help me, AI!" read all of them. Only the chosen one is shown.
- A change of step, and a click in the list at the right, adds an entry to the browser history.
  The browser's Back and Forward buttons go through the steps. Back on the first step goes to the page before.
- A link to `#<step id>` opens that step. A link to the id of a title or of a closed box inside a step opens the
  step, and opens the box.
- The step bar's real height is measured into `--guide-bar-height`. A link stops just below the bar.
- A title chosen in the list at the right stays marked until the reader scrolls by hand.

## Check after a change, or after a Docusaurus upgrade

The kit uses these Docusaurus parts:

- `useHistory` and `useLocation` from `@docusaurus/router`
- `@docusaurus/Link`, `@docusaurus/useBaseUrl` and `@docusaurus/useDocusaurusContext`
- `@theme/Heading`

Its styles use Infima class names, such as `table-of-contents__link` and `table-of-contents__link--active`, and
`--ifm-*` variables. If a Docusaurus upgrade changes any of these, this kit needs a change too.

Check both pages, in a wide window and in a phone-width window:

1. Click each title in the list at the right. The clicked title turns blue, and the page stops with that title
   just below the step bar.
2. Click Next three times, then the browser's Back button. Each Back goes one step back.
   Back on the first step goes to the page you came from.
3. Open a page with `#<step id>`, and with the id of a `###` title in a step. The step opens at that place.
4. Run `npm run typecheck`.

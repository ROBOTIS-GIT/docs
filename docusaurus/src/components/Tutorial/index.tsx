import React, {type ReactNode, createContext, useContext, useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {useHistory, useLocation} from '@docusaurus/router';
import useBaseUrl, {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import SectionCard from '@site/src/components/SectionCard';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

/*
 * Display parts for follow-along guides, such as the OMX Quick Start Guide.
 *
 * Each page of a guide is wrapped in `GuidePage`. The guide's title and the links to its pages
 * are kept in one `_*.ts` file next to the pages (for OMX: quick_start_guide/_quick_start.ts).
 * The other parts go inside a page: terminals, pictures, numbered clicks, checks, fixes and cautions.
 */

/** A picture or a short silent looping clip. Leave `src` out until it is made. */
export type TutorialMediaItem = {
  /** What it shows. Read by screen readers, and shown in the empty slot until `src` is set. */
  label: string;
  /** Path under /static. A .mp4 or .webm file plays as a loop, anything else is a picture. */
  src?: string;
  /** Still picture shown before a clip loads. */
  poster?: string;
  /** Names written on top, for example the name of each arm. x and y run from 0 to 1 across the picture. */
  names?: {text: string; x: number; y: number}[];
  /** One name in a rounded label at the top left, for what the whole picture shows. For example "Leader". */
  tag?: string;
  /**
   * Numbered points where the reader clicks. Use the same numbers as the list next to the picture. x and y run from 0 to 1.
   * `color` gives one point its own colour, for a picture where the numbers name different things (give the list the same).
   */
  marks?: {n: number; x: number; y: number; color?: string}[];
  /**
   * Outlines around what the reader should look at. x, y, w and h run from 0 to 1. `color` as for marks.
   * `dashed` draws the outline with a dashed line, for example around a place that is empty now.
   */
  boxes?: {x: number; y: number; w: number; h: number; color?: string; dashed?: boolean}[];
  /**
   * `wide` is 16:9 (default). `square` is 1:1, for close-ups shown side by side.
   * `free` keeps the picture's own shape and adds a thin border, for screenshots.
   * A `free` picture opens larger when clicked, with its marks and outlines.
   */
  shape?: 'wide' | 'square' | 'free';
  /** The widest it may be shown, in pixels. For small pictures that would look blurry when stretched. */
  width?: number;
  /** One short line under it, when the picture alone does not say where it was taken or what it shows. */
  caption?: ReactNode;
};

/** Shows a picture or a looping clip. Without `src` it shows a slot that says what is still to be made. */
export function TutorialMedia({caption, ...media}: TutorialMediaItem) {
  if (!caption || !media.src) {
    return <MediaItem {...media} />;
  }
  return (
    <figure className={styles.mediaFigure} style={media.width ? {maxWidth: media.width} : undefined}>
      <MediaItem {...media} />
      <figcaption className={styles.mediaCaption}>{caption}</figcaption>
    </figure>
  );
}

/** The picture or clip of TutorialMedia, without its caption. */
function MediaItem({label, src, poster, names, tag, marks, boxes, shape = 'wide', width}: Omit<TutorialMediaItem, 'caption'>) {
  const square = shape === 'square' ? styles.mediaSquare : shape === 'free' ? styles.mediaFree : '';
  const limit = width ? {maxWidth: width} : undefined;
  const url = useBaseUrl(src ?? '');
  const posterUrl = useBaseUrl(poster ?? '');
  // People who ask their system for less motion get a still picture with a play button.
  const [lessMotion, setLessMotion] = useState(false);
  useEffect(() => {
    setLessMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  // The larger view of a screenshot: null while closed, else the picture's shape and its own width in pixels.
  const [zoom, setZoom] = useState<{aspect: number; width: number} | null>(null);
  useEffect(() => {
    if (zoom === null) {
      return undefined;
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setZoom(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [zoom]);

  if (!src) {
    return (
      <div className={`${styles.mediaEmpty} ${square}`} style={limit} role="img" aria-label={`To be made: ${label}`}>
        <span>To be made</span>
        <strong>{label}</strong>
      </div>
    );
  }

  const isClip = /\.(mp4|webm)$/i.test(src);

  // Drawn over the picture, and again over its larger view.
  const overlays = (
    <>
      {tag ? <span className={styles.mediaTag}>{tag}</span> : null}
      {boxes?.map((box, index) => (
        <span
          key={`box-${index}`}
          className={styles.mediaBox}
          style={{
            left: `${box.x * 100}%`,
            top: `${box.y * 100}%`,
            width: `${box.w * 100}%`,
            height: `${box.h * 100}%`,
            borderColor: box.color,
            borderStyle: box.dashed ? 'dashed' : undefined,
          }}
        />
      ))}
      {marks?.map(mark => (
        <span
          key={`mark-${mark.n}`}
          className={styles.mediaMark}
          style={{left: `${mark.x * 100}%`, top: `${mark.y * 100}%`, background: mark.color}}
        >
          {mark.n}
        </span>
      ))}
      {names?.map((name, index) => (
        <span key={`name-${index}`} className={styles.mediaName} style={{left: `${name.x * 100}%`, top: `${name.y * 100}%`}}>
          {name.text}
        </span>
      ))}
    </>
  );

  if (isClip) {
    return (
      <div className={styles.mediaFrame} style={limit}>
        <video
          key={lessMotion ? 'still' : 'loop'}
          className={`${styles.mediaItem} ${square}`}
          src={url}
          poster={poster ? posterUrl : undefined}
          aria-label={label}
          autoPlay={!lessMotion}
          controls={lessMotion}
          loop
          muted
          playsInline
        />
        {overlays}
      </div>
    );
  }

  const picture = <img className={`${styles.mediaItem} ${square}`} src={url} alt={label} loading="lazy" />;

  if (shape !== 'free') {
    return (
      <div className={styles.mediaFrame} style={limit}>
        {picture}
        {overlays}
      </div>
    );
  }

  // A screenshot opens larger when clicked: as wide as the window allows, but never past its own size.
  const open = (frame: HTMLElement) => {
    const shown = frame.querySelector('img');
    const loaded = shown !== null && shown.naturalWidth > 0;
    setZoom({aspect: loaded ? shown.naturalWidth / shown.naturalHeight : 16 / 9, width: loaded ? shown.naturalWidth : 0});
  };

  return (
    <>
      <div
        className={`${styles.mediaFrame} ${styles.mediaZoomable}`}
        style={limit}
        role="button"
        tabIndex={0}
        title="Click to see it larger"
        onClick={event => open(event.currentTarget)}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            open(event.currentTarget);
          }
        }}
      >
        {picture}
        {overlays}
        <span className={styles.mediaZoomHint} aria-hidden="true">
          Click to enlarge
        </span>
      </div>
      {/* Outside the frame on purpose: the frame's container-type would keep a fixed view inside it. */}
      {zoom !== null ? (
        <div className={styles.mediaZoom} role="dialog" aria-modal="true" aria-label={label} onClick={() => setZoom(null)}>
          <div
            className={`${styles.mediaFrame} ${styles.mediaZoomFrame}`}
            style={{
              width: `min(96vw, calc((100vh - var(--ifm-navbar-height, 3.75rem)) * 0.94 * ${zoom.aspect})${zoom.width ? `, ${zoom.width}px` : ''})`,
            }}
          >
            <img src={url} alt={label} />
            {overlays}
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * A guide that is read in order, such as the OMX Quick Start Guide. Keep it in one `_*.ts` file next to its pages.
 */
export type Guide = {
  /** For example "OMX Quick Start Guide". */
  title: string;
  /** Its pages in reading order. "Help me, AI!" gives the AI these links. */
  pages: {title: string; to: string}[];
};

/**
 * "Help me, AI!" for a guide: opens ChatGPT or Claude with a prompt already typed in.
 * The prompt gives the AI the links to the pages of the guide and asks it to help the reader through them.
 * It is only typed in, not sent, so the reader can change it first.
 * The links use the address the site is published at, so the AI can only read the pages once they are online.
 */
function GuideAsk({guide}: {guide: Guide}) {
  const {siteConfig} = useDocusaurusContext();
  const {withBaseUrl} = useBaseUrlUtils();
  const [copied, setCopied] = useState(false);

  const prompt = [
    `I am following the ROBOTIS "${guide.title}". Its pages, in order:`,
    ...guide.pages.map(page => `- ${page.title}: ${siteConfig.url}${withBaseUrl(page.to)}`),
    'Read those pages.',
    'Then be my helper, so I can get through the guide without getting stuck.',
    'Use simple words. If something goes wrong, ask me to paste what my terminal shows.',
  ].join('\n');
  const query = encodeURIComponent(prompt);
  const copy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <details className={styles.ask}>
      <summary>Help me, AI!</summary>
      <div className={styles.askMenu}>
        {/* `prompt` only fills the box. With `q`, ChatGPT sends it at once and the reader cannot change it. */}
        <a href={`https://chatgpt.com/?prompt=${query}`} target="_blank" rel="noopener noreferrer">
          Ask ChatGPT
        </a>
        <a href={`https://claude.ai/new?q=${query}`} target="_blank" rel="noopener noreferrer">
          Ask Claude
        </a>
        <button type="button" onClick={copy} aria-live="polite">
          {copied ? 'Copied' : 'Copy the prompt for another AI'}
        </button>
        <p>The AI gets the links to this guide and is asked to help you through it.</p>
      </div>
    </details>
  );
}

/** The title of a guide page, with "Help me, AI!" at its right end. GuidePage puts it at the top of the page. */
function AskTitle({guide, title}: {guide: Guide; title: string}) {
  return (
    <div className={styles.titleRow}>
      <h1 className={styles.pageTitle}>{title}</h1>
      <GuideAsk guide={guide} />
    </div>
  );
}

/** Gives GuidePage the list to show at the right of the page. StepTabs gives it the list of its steps. */
const SetGuideToc = createContext<((toc: ReactNode) => void) | null>(null);

/**
 * Wraps one page of a guide, such as "Bringup" in the Quick Start Guide:
 * the title with "Help me, AI!" at its right end, then the page.
 * At the right of the page is a list to jump to, as on the other pages of the site: StepTabs puts its steps there,
 * and under the open step the `###` titles of its parts. Like that list, it shows on wide screens only.
 * Put `hide_title: true` and `hide_table_of_contents: true` in the page's front matter,
 * because this part writes the title and the list.
 */
export function GuidePage({guide, title, children}: {guide: Guide; title: string; children: ReactNode}) {
  // StepTabs gives the list once the page runs in the browser, so it is not in the page as the server sends it.
  // The bar above the steps has the same steps.
  const [toc, setToc] = useState<ReactNode>(null);
  return (
    <div className={styles.guideLayout}>
      <div className={styles.page}>
        <AskTitle guide={guide} title={title} />
        <SetGuideToc.Provider value={setToc}>{children}</SetGuideToc.Provider>
      </div>
      <div className={styles.guideToc}>{toc}</div>
    </div>
  );
}

/**
 * A part of a step that sends the reader on to a bigger manual, such as Cyclo Intelligence, for when this guide is
 * done. Start it with a `###` heading, then a few lines. One button goes to `to`; `logo` is shown at its right.
 * It is a part of the step's box, not a box of its own: on the AI Worker pages a box holds one `##` part.
 */
export function GoFurther({to, button, logo, logoAlt = '', children}: {to: string; button: string; logo?: string; logoAlt?: string; children: ReactNode}) {
  const logoUrl = useBaseUrl(logo ?? '');
  return (
    <>
      {children}
      <div className={styles.goFurtherFoot}>
        <Link className="button button--primary" to={to}>
          {button} →
        </Link>
        {logo ? <img className={styles.goFurtherLogo} src={logoUrl} alt={logoAlt} /> : null}
      </div>
    </>
  );
}

type StepProps = {id: string; title: string; label?: string; tag?: string; extra?: boolean; need?: string; children: ReactNode};

/**
 * One step of `StepTabs`. `id` is the end of the address that opens it, such as `connect-omx`.
 * `label` is a shorter name for the bar, when `title` is too long for it. Back and Next say "Step N" (or the tag)
 * and keep `title` as their tooltip.
 * `tag` is a short word shown instead of "Step N". A step with a tag has no number.
 * `extra` is for a part after the last step that the reader does only if they want to, such as making a result
 * better. Its tag is "Going further", and its tab has a dashed line.
 * `need` names what only some steps need, such as "Needs an NVIDIA GPU". Steps next to each other with the same
 * `need` share one line under the bar, with the words under it. Steps without it need nothing more.
 */
export function StepTab({children}: StepProps) {
  return <>{children}</>;
}

/**
 * The steps of a guide page, shown one at a time. A bar with the numbered steps stays at the top of the window
 * while the reader scrolls, so every step is one click away. Each step ends with Back and one Next button.
 * Put `<StepTab id="…" title="…">` items inside, each holding its step in markdown.
 *
 * Every step stays in the page, so the site search and "Help me, AI!" read them all. Only the chosen one is shown.
 * The address ends with `#` and the step's `id`, so a link can open a step. A link to a heading or part inside a step
 * opens that step too, and opens a closed part (such as `OnlyIf`) that holds it.
 * `back` and `next` are the pages before and after this one: the first step's Back and the last step's Next go there.
 * Put `pagination_prev: null` and `pagination_next: null` in the front matter, so Next is the only way on.
 * Each step is one box (SectionCard), as each `##` part is one box on the AI Worker pages: the step's number and title
 * are its `##` title, and everything in the step is inside it, its parts under `###` headings. Nothing of a step is
 * outside its box. What a page is for and what it needs go in a first step, "Before you begin", with a `Goal`.
 * `firstNumber` is the number of the first step: 0 when that first step is "Before you begin", so the real work
 * starts at Step 1.
 * Inside `GuidePage`, the list at the right of the page shows the steps, and under the open step its `###` titles.
 */
export function StepTabs({
  back,
  next,
  firstNumber = 1,
  children,
}: {
  back?: {title: string; to: string};
  next?: {title: string; to: string};
  firstNumber?: number;
  children: ReactNode;
}) {
  const steps = React.Children.toArray(children).filter(
    (child): child is React.ReactElement<StepProps> =>
      React.isValidElement<StepProps>(child) && typeof child.props.id === 'string',
  );
  // The steps are numbered from `firstNumber` (0, 1, 2 … or 1, 2, 3 …); a part with a tag ("Going further") has none.
  const tagOf = (step: React.ReactElement<StepProps>) => step.props.tag ?? (step.props.extra ? 'Going further' : undefined);
  const lastNumber = steps.filter(step => !tagOf(step)).length - 1 + firstNumber;
  const numberOf = (index: number) => steps.slice(0, index + 1).filter(step => !tagOf(step)).length - 1 + firstNumber;
  const titleOf = (index: number) => {
    const tag = tagOf(steps[index]);
    return tag ? `${tag}: ${steps[index].props.title}` : `${numberOf(index)}. ${steps[index].props.title}`;
  };
  // Runs of steps next to each other that need the same thing, for one line under the bar.
  const needs: {from: number; to: number; text: string}[] = [];
  steps.forEach((step, index) => {
    const text = step.props.need;
    const last = needs[needs.length - 1];
    if (!text) return;
    if (last && last.text === text && last.to === index - 1) last.to = index;
    else needs.push({from: index, to: index, text});
  });
  const [current, setCurrent] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  // Where to scroll once the chosen step is shown: the top of the steps, or a part inside the step.
  const scrollTarget = useRef<HTMLElement | 'top' | null>(null);
  const location = useLocation();
  const {hash} = location;
  const history = useHistory();
  const setToc = useContext(SetGuideToc);
  // The titles of the boxes of the open step, for the list at the right, and the box the reader is at.
  const [parts, setParts] = useState<{id: string; text: string}[]>([]);
  const [activePart, setActivePart] = useState<string | null>(null);
  // A box chosen in the list or by a link stays marked until the reader scrolls on, also where the page
  // cannot scroll it to the top (the last boxes of a step).
  const pinnedPart = useRef<string | null>(null);
  const previousHash = useRef(hash);

  // The bar's real height, for where a link to a box stops (styles: .stepPanel [id]).
  // It is taller when a line of needs is under it, and different on a narrow screen.
  useEffect(() => {
    const barElement = bar.current;
    const rootElement = root.current;
    if (!barElement || !rootElement || typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const measure = () => rootElement.style.setProperty('--guide-bar-height', `${barElement.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(barElement);
    return () => observer.disconnect();
  }, []);

  const scrollTo = (target: HTMLElement | 'top') => {
    if (target !== 'top') {
      target.scrollIntoView({block: 'start'});
      if (target.matches('[data-step-box] > h3[id]')) {
        pinnedPart.current = target.id;
        setActivePart(target.id);
      }
      return;
    }
    pinnedPart.current = null;
    // When the steps start near the top of the page, right under its title, go to the very top:
    // every step then opens the same way, with the title, the bar and the start of the step.
    const steps = root.current;
    if (steps && steps.getBoundingClientRect().top + window.scrollY < window.innerHeight / 2) {
      window.scrollTo({top: 0});
    } else {
      steps?.scrollIntoView({block: 'start'});
    }
  };

  const show = (index: number, target: HTMLElement | 'top') => {
    if (index === current) {
      scrollTo(target);
      return;
    }
    scrollTarget.current = target;
    setCurrent(index);
  };

  // Open the step that the address names, or the step that holds the part it names.
  const openFromAddress = (address: string) => {
    const id = decodeURIComponent(address.replace(/^#/, ''));
    if (!id) {
      return;
    }
    const direct = steps.findIndex(step => step.props.id === id);
    if (direct >= 0) {
      show(direct, 'top');
      return;
    }
    const target = document.getElementById(id);
    const panel = target?.closest<HTMLElement>('[data-step]');
    if (target && panel) {
      for (let closed = target.closest('details'); closed; closed = closed.parentElement?.closest('details') ?? null) {
        closed.open = true;
      }
      show(Number(panel.dataset.step), target);
    }
  };

  useEffect(() => {
    // Back to the address the page opened with, without a step in it: show the first step again.
    if (!hash.replace(/^#/, '') && previousHash.current.replace(/^#/, '')) {
      show(0, 'top');
    } else {
      openFromAddress(hash);
    }
    previousHash.current = hash;
    // Only the address matters here. The steps are the same for as long as the page is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hash]);

  useEffect(() => {
    const onHashChange = () => openFromAddress(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  });

  useEffect(() => {
    const target = scrollTarget.current;
    // When the page opens with an address, this first runs before the step that holds the target is shown.
    // A hidden part cannot be scrolled to, so keep the target until its step is shown.
    if (!target || (target !== 'top' && target.closest<HTMLElement>('[data-step]')?.hidden)) {
      return;
    }
    scrollTarget.current = null;
    scrollTo(target);
  }, [current]);

  // Put an id in the address as a new entry of the browser history, as a link on any other page does, so the
  // browser's Back and Forward buttons go through the steps. The new address then opens the step or the box
  // (the effect on `hash` above). Returns false when the address already has that id.
  const navigate = (id: string) => {
    if (decodeURIComponent(window.location.hash.replace(/^#/, '')) === id) {
      return false;
    }
    history.push({pathname: location.pathname, search: location.search, hash: `#${id}`});
    return true;
  };

  // A click on the bar or on Back / Next: show that step from its top, and put its id in the address.
  const go = (index: number) => {
    if (!navigate(steps[index].props.id)) {
      show(index, 'top');
    }
  };

  // The `###` title of each part of the open step.
  const partHeadings = () =>
    Array.from(root.current?.querySelectorAll<HTMLElement>(`[data-step="${current}"] [data-step-box] > h3[id]`) ?? []);

  useEffect(() => {
    setParts(
      partHeadings().map(heading => ({
        id: heading.id,
        // A heading ends with its # link, which holds a zero-width space.
        text: (heading.textContent ?? '').replace(/​/g, '').trim(),
      })),
    );
    // Mark the box the reader is at, in the same way as the list at the right of other pages: the first title
    // below the bar once it is in the top half of the window, else the title before it, and the last one at the end.
    let frame = 0;
    const update = () => {
      frame = 0;
      if (pinnedPart.current) {
        setActivePart(pinnedPart.current);
        return;
      }
      const headings = partHeadings();
      const line = bar.current?.getBoundingClientRect().bottom ?? 0;
      // 1 px of slack for rounding: a title that stopped right below the bar counts as below it.
      const next = headings.findIndex(heading => heading.getBoundingClientRect().top >= line - 1);
      const active =
        next < 0
          ? headings[headings.length - 1]
          : headings[next].getBoundingClientRect().top < window.innerHeight / 2
            ? headings[next]
            : headings[next - 1];
      setActivePart(active?.id ?? null);
    };
    const onScroll = () => {
      if (!frame) {
        frame = window.requestAnimationFrame(update);
      }
    };
    // The reader scrolls on by hand: stop keeping the chosen box marked, and mark by position again.
    const release = () => {
      if (pinnedPart.current) {
        pinnedPart.current = null;
        onScroll();
      }
    };
    const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '];
    const onKey = (event: KeyboardEvent) => {
      if (scrollKeys.includes(event.key)) {
        release();
      }
    };
    update();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);
    window.addEventListener('wheel', release, {passive: true});
    window.addEventListener('touchmove', release, {passive: true});
    window.addEventListener('mousedown', release);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchmove', release);
      window.removeEventListener('mousedown', release);
      window.removeEventListener('keydown', onKey);
      window.cancelAnimationFrame(frame);
    };
    // The boxes change only with the step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // A click on a box in the list: go to it, and put its id in the address.
  const goToPart = (id: string) => {
    if (!navigate(id)) {
      const target = document.getElementById(id);
      if (target) {
        scrollTo(target);
      }
    }
  };

  const toc = (
    <nav aria-label="On this page">
      <ul className="table-of-contents table-of-contents__left-border">
        {steps.map((step, index) => (
          <li key={step.props.id}>
            <a
              href={`#${step.props.id}`}
              className={[
                'table-of-contents__link',
                index === current ? styles.tocStepNow : '',
                index === current && !activePart ? 'table-of-contents__link--active' : '',
              ].join(' ')}
              onClick={event => {
                event.preventDefault();
                go(index);
              }}
            >
              {titleOf(index)}
            </a>
            {index === current && parts.length > 0 && (
              <ul>
                {parts.map(part => (
                  <li key={part.id}>
                    <a
                      href={`#${part.id}`}
                      className={`table-of-contents__link ${part.id === activePart ? 'table-of-contents__link--active' : ''}`}
                      onClick={event => {
                        event.preventDefault();
                        goToPart(part.id);
                      }}
                    >
                      {part.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );

  // Give GuidePage the list again after every change: of the step, of its boxes, or of the box being read.
  useEffect(() => {
    setToc?.(toc);
  });
  useEffect(() => () => setToc?.(null), [setToc]);

  return (
    <div ref={root} className={styles.steps} style={{'--step-count': steps.length} as React.CSSProperties}>
      <nav ref={bar} className={styles.stepBar} aria-label="Steps of this page">
        <ol className={styles.stepList}>
          {steps.map((step, index) => (
            <li key={step.props.id}>
              <button
                type="button"
                className={[
                  styles.stepTab,
                  index === current ? styles.stepTabNow : '',
                  step.props.extra ? styles.stepTabExtra : '',
                ].join(' ')}
                aria-current={index === current ? 'step' : undefined}
                onClick={() => go(index)}
              >
                <span className={styles.stepTabNumber}>{tagOf(step) ?? `Step ${numberOf(index)}`}</span>
                {step.props.label ?? step.props.title}
              </button>
            </li>
          ))}
        </ol>
        {needs.length > 0 && (
          <div className={styles.stepNeeds}>
            {needs.map(n => (
              <span key={n.from} className={styles.stepNeed} style={{gridColumn: `${n.from + 1} / ${n.to + 2}`}}>
                {n.text}
              </span>
            ))}
          </div>
        )}
        {/* On a narrow screen the steps do not fit in one row, so they become a list to choose from. */}
        <select
          className={styles.stepSelect}
          value={current}
          aria-label="Step"
          onChange={event => go(Number(event.target.value))}
        >
          {steps.map((step, index) => (
            <option key={step.props.id} value={index}>
              {tagOf(step)
                ? `${tagOf(step)}: ${step.props.title}`
                : `Step ${numberOf(index)} of ${lastNumber}: ${step.props.title}`}
              {step.props.need ? ` (${step.props.need})` : ''}
            </option>
          ))}
        </select>
      </nav>
      {steps.map((step, index) => {
        return (
          <section
            key={step.props.id}
            id={step.props.id}
            data-step={index}
            className={styles.stepPanel}
            hidden={index !== current}
            aria-label={tagOf(step) ? titleOf(index) : `Step ${numberOf(index)}: ${step.props.title}`}
          >
            {/* The whole step is one box, with its number and title as the box's ## title. */}
            <SectionCard data-step-box="">
              <h2>{titleOf(index)}</h2>
              {step.props.children}
            </SectionCard>
            <div className={styles.stepNav}>
              {index > 0 ? (
                // Back reads like Next: "Back: Step 2", or "Back: Get ready" for a tagged step.
                <button
                  type="button"
                  className={styles.stepBack}
                  onClick={() => go(index - 1)}
                  aria-label={`Back: ${titleOf(index - 1)}`}
                  title={steps[index - 1].props.title}
                >
                  ← Back: {tagOf(steps[index - 1]) ?? `Step ${numberOf(index - 1)}`}
                </button>
              ) : back ? (
                <Link className={styles.stepBack} to={back.to}>
                  ← Back: {back.title}
                </Link>
              ) : null}
              {index < steps.length - 1 ? (
                // Every Next button reads the same way: "Next: Step 3", or "Next: Going further" for a tagged step.
                <button
                  type="button"
                  className={styles.stepNext}
                  onClick={() => go(index + 1)}
                  aria-label={`Next: ${titleOf(index + 1)}`}
                  title={steps[index + 1].props.title}
                >
                  Next: {tagOf(steps[index + 1]) ?? `Step ${numberOf(index + 1)}`} →
                </button>
              ) : next ? (
                <Link className={styles.stepNext} to={next.to}>
                  Next: {next.title} →
                </Link>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/**
 * What the reader gets at the end of the page, in the first step ("Before you begin"): a short `###` title (`heading`,
 * "What You Will Achieve" unless it says otherwise), a clip of the result, and a few sentences if needed. It is one part of the step's box, so its title is in the list at the right
 * like the other `###` titles; `id` is the end of the address that opens it.
 * Put the sentence (and at most one quiet line after it) inside, and give the clip with the same props as
 * TutorialMedia (`label` describes the clip). The clip is centred. `below` goes right under it, before the sentence.
 */
export function Goal({
  heading = 'What You Will Achieve',
  id = 'what-you-will-achieve',
  below,
  children,
  ...media
}: TutorialMediaItem & {heading?: string; id?: string; below?: ReactNode; children?: ReactNode}) {
  return (
    <>
      <Heading as="h3" id={id}>
        {heading}
      </Heading>
      <div className={styles.goal}>
        <TutorialMedia {...media} />
        {below ? <div className={styles.goalBelow}>{below}</div> : null}
        {children ? <div className={styles.goalText}>{children}</div> : null}
      </div>
    </>
  );
}

/**
 * Pictures or clips side by side in one row, all the same width (one under the other on a phone).
 * Put `TutorialMedia` items inside. A short name on top of each, such as "OMX", goes in its `names`.
 * `label` is a small line over the row. For a set that belongs together, such as everything the reader needs, put a
 * `###` title over it instead: it is then a part of the step's box, with no box of its own.
 */
export function MediaRow({label, note, children}: {label?: string; note?: ReactNode; children: ReactNode}) {
  return (
    <div className={styles.mediaRowSet}>
      {label ? <p className={styles.goalLabel}>{label}</p> : null}
      <div className={styles.mediaRow}>{children}</div>
      {/* `note`: one thing the reader must not miss about these items, set apart under them. */}
      {note ? <div className={styles.mediaRowNote}>{note}</div> : null}
    </div>
  );
}

/**
 * Parts that only some readers need, such as installing a program that may already be there.
 * It stays closed, so a reader who does not need it goes straight on. `title` says when to open it.
 * Give it an `id` when a link elsewhere points at it: inside `StepTabs`, that link opens it.
 */
export function OnlyIf({id, title, children}: {id?: string; title: ReactNode; children: ReactNode}) {
  return (
    <details id={id} className={styles.onlyIf}>
      <summary>{title}</summary>
      <div className={styles.onlyIfBody}>{children}</div>
    </details>
  );
}

/** The text of a fenced code block that was written inside a component. */
function codeText(node: ReactNode): string {
  if (typeof node === 'string') {
    return node;
  }
  if (Array.isArray(node)) {
    return node.map(codeText).join('');
  }
  if (React.isValidElement<{children?: ReactNode}>(node)) {
    return codeText(node.props.children);
  }
  return '';
}

/**
 * A map of the terminals that a step keeps open, drawn as one window split into panes.
 * Each pane shows its number, what runs there, and the sign that it is running.
 * The numbers are the ones the step's text uses, as in "This is Terminal 1."
 */
export function TerminalMap({panes}: {panes: {name: string; shows?: string}[]}) {
  return (
    <ol className={styles.terminalMap} aria-label="The terminals of this step">
      {panes.map((pane, index) => (
        <li key={pane.name}>
          <span className={styles.terminalMapWhere}>Terminal {index + 1}</span>
          <strong>{pane.name}</strong>
          {pane.shows ? <span className={styles.terminalMapShows}>{pane.shows}</span> : null}
        </li>
      ))}
    </ol>
  );
}

/**
 * What a command prints, when parts of it are different on every PC: those parts get a red outline,
 * as on the ROBOTIS terminal screenshots. Put the text inside as one string between backticks, with [[ and ]]
 * around each part that is different: {`usb-ROBOTIS_OpenRB-150_[[3F9A61C2]]-if00`}.
 * `note` adds one line under it that says what the red parts are.
 */
export function MarkedOutput({note, children}: {note?: string; children: ReactNode}) {
  const lines = codeText(children).replace(/^\n+|\n+$/g, '').split('\n');
  return (
    <div className={styles.markedOutput}>
      <pre>
        <code>
          {lines.map((line, index) => (
            <span key={index}>
              {line.split(/\[\[(.+?)\]\]/).map((part, i) =>
                i % 2 === 1 ? (
                  <mark key={i} className={styles.outputMark}>
                    {part}
                  </mark>
                ) : (
                  part
                ),
              )}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
      {note ? <p className={styles.markedOutputNote}>{note}</p> : null}
    </div>
  );
}

/**
 * What a good result looks like when it is not in a terminal: the robot, or a web page.
 * Put a markdown list inside. Each line gets a green check mark. Keep each line to a few words.
 */
export function Checks({children}: {children: ReactNode}) {
  return <div className={styles.checks}>{children}</div>;
}

/**
 * Things to click, in order. Put a markdown numbered list inside.
 * Each number is drawn as the same coloured point as the `marks` on the screenshot next to it,
 * so the reader sees that line 2 of the list and point 2 on the picture are the same thing.
 */
export function Clicks({start = 1, colors, children}: {start?: number; colors?: string[]; children: ReactNode}) {
  // `start` lets a second list go on where the first one stopped, so the numbers still match one picture.
  // `colors` gives the points of this list their own colours, in order, the same as the `color` of the marks.
  const vars: Record<string, string | number> = {'--clicks-from': start - 1};
  colors?.forEach((c, i) => { if (c) vars[`--click-${i + 1}`] = c; });
  return (
    <div className={styles.clicks} style={vars as React.CSSProperties}>
      {children}
    </div>
  );
}

/**
 * A screenshot and the short text that points at it, in one rounded box as wide as the reading column:
 * the text on top, the screenshot below it at the full width of the box, so the text inside the screenshot
 * stays readable. The numbers in the text are the same as the numbers on the picture.
 * Put the text inside, and give the picture with the same props as TutorialMedia.
 * Give `width` the picture's own width in pixels, so a small screenshot is not stretched.
 */
export function ScreenshotBox({children, ...media}: TutorialMediaItem & {children: ReactNode}) {
  return (
    <div className={styles.screenshotBox}>
      <div className={styles.screenshotBoxText}>{children}</div>
      <div className={styles.screenshotBoxPicture}>
        <TutorialMedia shape="free" {...media} />
      </div>
    </div>
  );
}

/**
 * What to do when the result is different. It stays closed until the reader opens it,
 * so a reader for whom everything works never has to read it.
 * Put a markdown table inside with two columns: what the reader sees, and what to do.
 * With an `id`, a link to it opens this box, and inside StepTabs also the step that holds it.
 */
export function NotGood({id, title = 'Something different?', children}: {id?: string; title?: string; children: ReactNode}) {
  return (
    <details id={id} className={styles.fix}>
      <summary>{title}</summary>
      <div className={styles.fixBody}>{children}</div>
    </details>
  );
}

/**
 * An amber box for safety: what to know before the robot moves, or before it goes limp.
 * Every safety note of a guide goes in one of these, and nothing else does.
 */
export function Caution({title = 'Caution', children}: {title?: string; children: ReactNode}) {
  return (
    <div className={styles.caution}>
      <p className={styles.cautionTitle}>{title}</p>
      {children}
    </div>
  );
}

/**
 * The same amber box with larger text, for one thing that is not about safety but must not be missed,
 * such as another way to do the whole job (LeRobot instead of ROS 2).
 */
export function Notice({title = 'Notice', children}: {title?: string; children: ReactNode}) {
  return (
    <div className={`${styles.caution} ${styles.notice}`}>
      <p className={styles.cautionTitle}>{title}</p>
      {children}
    </div>
  );
}

/**
 * Small actions shown side by side, each as a short clip with one sentence under it.
 * Put `<Shot>` items inside. They are numbered in order.
 * `small` puts four in a row instead of two, for a step that should fit on the screen.
 */
export function Shots({small = false, children}: {small?: boolean; children: ReactNode}) {
  return <ol className={`${styles.shots} ${small ? styles.shotsSmall : ''}`}>{children}</ol>;
}

/** One action: a square clip or picture, and one sentence. `tag` names the part it is about, at the top left. */
export function Shot({children, ...media}: TutorialMediaItem & {children: ReactNode}) {
  return (
    <li className={styles.shot}>
      <TutorialMedia {...media} shape="square" />
      {/* One wrapper, so a caption with bold words stays one piece next to its number. */}
      <div className={styles.shotText}>
        <div>{children}</div>
      </div>
    </li>
  );
}

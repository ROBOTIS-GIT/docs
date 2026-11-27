import React, {type ReactNode, useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

/*
 * Picture parts for the OMX Quick Start Guide and Imitation Learning pages.
 *
 * Each part shows a screenshot, a photo or a short clip, with what the reader should look at drawn over it:
 * numbered points to click, outlines and names. A screenshot opens larger when it is clicked.
 * The rest of those pages uses the parts every docs page uses: SectionCard, admonitions and <details>.
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
  /**
   * For a `free` picture: its height in pixels when it is shown `width` wide. With both, the page keeps the picture's
   * room before it loads, so a link to a title further down the page lands on that title.
   */
  height?: number;
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
function MediaItem({label, src, poster, names, tag, marks, boxes, shape = 'wide', width, height}: Omit<TutorialMediaItem, 'caption'>) {
  const square = shape === 'square' ? styles.mediaSquare : shape === 'free' ? styles.mediaFree : '';
  const limit = width ? {maxWidth: width} : undefined;
  // A free picture has no shape until it loads. Its room is kept from width and height; once loaded, its own shape wins.
  const room = shape === 'free' && width && height ? {aspectRatio: `auto ${width} / ${height}`} : undefined;
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
          style={room}
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

  const picture = <img className={`${styles.mediaItem} ${square}`} style={room} src={url} alt={label} loading="lazy" />;

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
 * Pictures or clips side by side in one row, all the same width (one under the other on a phone).
 * Put `TutorialMedia` items inside. A short name on top of each, such as "OMX", goes in its `names`.
 * `label` is a small line over the row. For a set that belongs together, such as everything the reader needs, put a
 * `##` or `###` title over it instead.
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
 * Small actions shown side by side, each as a short clip with one sentence under it.
 * Put `<Shot>` items inside. They are numbered in order.
 * `small` puts four in a row instead of two, for a section that should fit on the screen.
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

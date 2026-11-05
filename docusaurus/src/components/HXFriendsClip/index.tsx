import React from 'react';
import './styles.css';

export type HXFriendsClipItem = {
  src: string;
  caption: string;
  alt?: string;
};

export type HXFriendsClipProps = {
  /** Accessible title for the clip group */
  title: string;
  /** One or more GIFs shown in a row */
  clips: HXFriendsClipItem[];
};

export default function HXFriendsClip({title, clips}: HXFriendsClipProps): React.JSX.Element {
  return (
    <div className="hx-friends-clip" aria-label={title}>
      <div className={`hx-friends-clip__row hx-friends-clip__row--${Math.min(clips.length, 3)}`}>
        {clips.map((clip) => (
          <figure key={`${clip.src}-${clip.caption}`} className="hx-friends-clip__item">
            <div className="hx-friends-clip__frame">
              <img
                className="hx-friends-clip__gif"
                src={clip.src}
                alt={clip.alt || `${title} — ${clip.caption}`}
                loading="lazy"
              />
            </div>
            <figcaption className="hx-friends-clip__caption">{clip.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

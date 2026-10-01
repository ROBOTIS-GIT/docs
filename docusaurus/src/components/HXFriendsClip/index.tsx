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
  /** One or more media items shown in a row */
  clips?: HXFriendsClipItem[];
  /** Legacy single local video path */
  src?: string;
  /** Optional poster image path for video */
  poster?: string;
  /** Optional YouTube video id (used when src/clips are not provided) */
  youtubeId?: string;
};

export default function HXFriendsClip({
  title,
  clips,
  src,
  poster,
  youtubeId,
}: HXFriendsClipProps): React.JSX.Element {
  if (clips && clips.length > 0) {
    return (
      <div className="hx-friends-clip" aria-label={title}>
        <div className={`hx-friends-clip__row hx-friends-clip__row--${Math.min(clips.length, 3)}`}>
          {clips.map((clip) => (
            <figure key={`${clip.src}-${clip.caption}`} className="hx-friends-clip__item">
              <div className="hx-friends-clip__frame hx-friends-clip__frame--gif">
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

  const hasLocal = Boolean(src);
  const hasYoutube = Boolean(youtubeId);

  return (
    <div className="hx-friends-clip">
      {hasLocal ? (
        <div className="hx-friends-clip__frame">
          <video
            className="hx-friends-clip__video"
            controls
            playsInline
            preload="metadata"
            poster={poster}
            title={title}
          >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : hasYoutube ? (
        <div className="hx-friends-clip__frame">
          <iframe
            className="hx-friends-clip__iframe"
            src={`https://www.youtube.com/embed/${youtubeId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <div
          className="hx-friends-clip__frame hx-friends-clip__frame--placeholder"
          role="img"
          aria-label={`${title} video coming soon`}
        >
          <span>Video coming soon</span>
        </div>
      )}
    </div>
  );
}

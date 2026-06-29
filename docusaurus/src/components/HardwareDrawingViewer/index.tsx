import React from 'react';
import './styles.css';

type HardwareDrawingViewerProps = {
  title: string;
  description?: string;
  src: string;
  previewSrc: string;
  downloadName?: string;
};

export default function HardwareDrawingViewer({
  title,
  description,
  src,
  previewSrc,
  downloadName,
}: HardwareDrawingViewerProps): React.JSX.Element {
  return (
    <section className="hardware-drawing-viewer">
      <div className="hardware-drawing-viewer__header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <div className="hardware-drawing-viewer__actions">
          <a href={src} target="_blank" rel="noopener noreferrer">
            Open PDF
          </a>
          <a href={src} download={downloadName ?? undefined}>
            Download
          </a>
        </div>
      </div>

      <a
        className="hardware-drawing-viewer__preview"
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${title} PDF`}
      >
        <img src={previewSrc} alt={title} loading="lazy" decoding="async" />
      </a>
    </section>
  );
}

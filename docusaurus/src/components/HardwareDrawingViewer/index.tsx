import React, {useEffect, useRef, useState} from 'react';
import './styles.css';

type HardwareDrawingViewerProps = {
  title: string;
  description?: string;
  src: string;
  downloadName?: string;
};

type ViewerState = 'loading' | 'ready' | 'error';

const MIN_SCALE = 0.35;
const MAX_SCALE = 4;
const ZOOM_STEP = 0.2;

function clampScale(value: number): number {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, value));
}

function formatZoom(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}

export default function HardwareDrawingViewer({
  title,
  description,
  src,
  downloadName,
}: HardwareDrawingViewerProps): React.JSX.Element {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pageRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const renderSerialRef = useRef(0);
  const fitWidthRef = useRef(true);

  const [viewerState, setViewerState] = useState<ViewerState>('loading');
  const [statusText, setStatusText] = useState('Loading hardware drawing...');
  const [scale, setScale] = useState(1);
  const [isFitWidth, setIsFitWidth] = useState(true);

  useEffect(() => {
    let disposed = false;

    async function loadPdf() {
      try {
        setViewerState('loading');
        setStatusText('Loading hardware drawing...');

        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url,
        ).toString();

        const loadingTask = pdfjs.getDocument({url: src});
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        if (disposed) return;

        pageRef.current = page;
        setViewerState('ready');
        setStatusText('Hardware drawing loaded.');
      } catch (error) {
        if (disposed) return;
        console.error(error);
        setViewerState('error');
        setStatusText('Unable to load the hardware drawing.');
      }
    }

    loadPdf();

    return () => {
      disposed = true;
      renderTaskRef.current?.cancel?.();
    };
  }, [src]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateFitScale = () => {
      const page = pageRef.current;
      if (!page || !fitWidthRef.current) return;

      const baseViewport = page.getViewport({scale: 1});
      const availableWidth = Math.max(240, viewport.clientWidth - 36);
      setScale(clampScale(availableWidth / baseViewport.width));
    };

    updateFitScale();

    const resizeObserver = new ResizeObserver(updateFitScale);
    resizeObserver.observe(viewport);

    return () => resizeObserver.disconnect();
  }, [viewerState]);

  useEffect(() => {
    let disposed = false;

    async function renderPage() {
      const page = pageRef.current;
      const canvas = canvasRef.current;
      if (!page || !canvas || viewerState === 'error') return;

      renderTaskRef.current?.cancel?.();

      const serial = renderSerialRef.current + 1;
      renderSerialRef.current = serial;

      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      const viewport = page.getViewport({scale});
      const context = canvas.getContext('2d', {alpha: false});
      if (!context) return;

      canvas.width = Math.floor(viewport.width * pixelRatio);
      canvas.height = Math.floor(viewport.height * pixelRatio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, viewport.width, viewport.height);

      try {
        setStatusText('Rendering drawing...');
        const renderTask = page.render({canvasContext: context, viewport});
        renderTaskRef.current = renderTask;
        await renderTask.promise;

        if (disposed || renderSerialRef.current !== serial) return;
        setViewerState('ready');
        setStatusText('Hardware drawing loaded.');
      } catch (error: any) {
        if (error?.name === 'RenderingCancelledException') return;
        if (disposed) return;
        console.error(error);
        setViewerState('error');
        setStatusText('Unable to render the hardware drawing.');
      }
    }

    renderPage();

    return () => {
      disposed = true;
    };
  }, [scale, viewerState]);

  const setManualScale = (nextScale: number) => {
    fitWidthRef.current = false;
    setIsFitWidth(false);
    setScale(clampScale(nextScale));
  };

  const fitToWidth = () => {
    const page = pageRef.current;
    const viewport = viewportRef.current;
    if (!page || !viewport) return;

    const baseViewport = page.getViewport({scale: 1});
    const availableWidth = Math.max(240, viewport.clientWidth - 36);
    fitWidthRef.current = true;
    setIsFitWidth(true);
    setScale(clampScale(availableWidth / baseViewport.width));
  };

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

      <div className="hardware-drawing-viewer__toolbar" aria-label="Drawing viewer controls">
        <div className="hardware-drawing-viewer__zoom">
          <button
            type="button"
            onClick={() => setManualScale(scale - ZOOM_STEP)}
            disabled={viewerState !== 'ready' || scale <= MIN_SCALE}
            aria-label="Zoom out"
          >
            -
          </button>
          <span>{formatZoom(scale)}</span>
          <button
            type="button"
            onClick={() => setManualScale(scale + ZOOM_STEP)}
            disabled={viewerState !== 'ready' || scale >= MAX_SCALE}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="hardware-drawing-viewer__fit"
          onClick={fitToWidth}
          disabled={viewerState !== 'ready'}
          aria-pressed={isFitWidth}
        >
          Fit width
        </button>
      </div>

      <div className="hardware-drawing-viewer__stage" ref={viewportRef}>
        <canvas ref={canvasRef} />
        <div
          className={`hardware-drawing-viewer__status hardware-drawing-viewer__status--${viewerState}`}
          role={viewerState === 'error' ? 'alert' : 'status'}
        >
          {statusText}
        </div>
      </div>
    </section>
  );
}

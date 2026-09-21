import React, {useEffect, useId, useRef, useState} from 'react';
import './styles.css';

export default function AutonomyStudioImageZoom() {
  const [image, setImage] = useState(null);
  const [originalSize, setOriginalSize] = useState(false);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    // Enhance both Markdown images and inline <img> tags without wrapping them.
    const images = new Map();
    const attributes = ['tabindex', 'role', 'aria-label', 'aria-haspopup'];

    function enhanceImages() {
      document.querySelectorAll('.theme-doc-markdown img').forEach((element) => {
        if (images.has(element) || element.closest('a, button')) return;

        images.set(element, attributes.map((name) => element.getAttribute(name)));
        element.classList.add('autonomy-image-zoomable');
        element.setAttribute('tabindex', '0');
        element.setAttribute('role', 'button');
        element.setAttribute('aria-haspopup', 'dialog');
        element.setAttribute('aria-label', `Enlarge image: ${element.alt || 'Image'}`);
      });
    }

    function openImage(element) {
      openerRef.current = element;
      setOriginalSize(false);
      setImage({src: element.currentSrc || element.src, alt: element.alt});
    }

    function onClick(event) {
      if (
        event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        !images.has(event.target)
      ) return;

      event.preventDefault();
      openImage(event.target);
    }

    function onKeyDown(event) {
      if (event.defaultPrevented || !images.has(event.target)) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openImage(event.target);
      }
    }

    enhanceImages();
    const observer = new MutationObserver(enhanceImages);
    observer.observe(document.body, {childList: true, subtree: true});
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
      images.forEach((values, element) => {
        element.classList.remove('autonomy-image-zoomable');
        attributes.forEach((name, index) => {
          if (values[index] === null) element.removeAttribute(name);
          else element.setAttribute(name, values[index]);
        });
      });
    };
  }, []);

  useEffect(() => {
    if (!image) return undefined;

    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.showModal();

    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      if (openerRef.current?.isConnected) {
        openerRef.current.focus({preventScroll: true});
      }
    };
  }, [image]);

  function close() {
    dialogRef.current.close();
  }

  function onBackdropClick(event) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom
    ) close();
  }

  function toggleSize() {
    setOriginalSize((value) => !value);
    dialogRef.current.querySelector('.autonomy-image-zoom__viewport').scrollTo(0, 0);
  }

  return (
    <dialog
      ref={dialogRef}
      className="autonomy-image-zoom"
      aria-labelledby={titleId}
      onClose={(event) => {
        if (!event.currentTarget.open) setImage(null);
      }}
      onClick={onBackdropClick}>
      <div className="autonomy-image-zoom__toolbar">
        <p id={titleId} className="autonomy-image-zoom__title">Image preview</p>
        <div className="autonomy-image-zoom__actions">
          <button type="button" className="button button--secondary" onClick={toggleSize}>
            {originalSize ? 'Fit to screen' : 'Original size'}
          </button>
          <button type="button" className="button button--secondary" onClick={close}>
            Close
          </button>
        </div>
      </div>
      <div className="autonomy-image-zoom__viewport">
        {image && (
          <img
            src={image.src}
            alt={image.alt}
            className={`autonomy-image-zoom__image${originalSize ? ' autonomy-image-zoom__image--original' : ''}`}
          />
        )}
      </div>
    </dialog>
  );
}

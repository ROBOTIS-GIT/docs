import React from 'react';
import './styles.css';

export type HXDownloadsProps = {
  cadUrl: string;
  urdfUrl: string;
};

export default function HXDownloads({cadUrl, urdfUrl}: HXDownloadsProps): React.JSX.Element {
  return (
    <div className="hx-downloads">
      <a className="button button--primary hx-downloads__button" href={cadUrl} rel="noopener">
        Download CAD
      </a>
      <a className="button button--primary hx-downloads__button" href={urdfUrl} rel="noopener">
        Download URDF
      </a>
    </div>
  );
}

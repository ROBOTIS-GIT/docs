import React, {useEffect} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {useHistory, useLocation} from '@docusaurus/router';

export default function TechnicalStoryRedirect({destination}: {destination: {to: string}}) {
  const history = useHistory();
  const {search, hash} = useLocation();
  const to = `${destination.to}${search}${hash}`;

  useEffect(() => {
    history.replace(to);
  }, [history, to]);

  return <>
    <Head>
      <title>Technical Story</title>
      <meta name="robots" content="noindex" />
      <script>{`window.location.replace(${JSON.stringify(destination.to)} + window.location.search + window.location.hash);`}</script>
      <meta httpEquiv="refresh" content={`0;url=${to}`} />
      <link rel="canonical" href={destination.to} />
    </Head>
    <main className="container margin-vert--lg">
      <p>This page has moved to <Link to={to}>Technical Story</Link>.</p>
    </main>
  </>;
}

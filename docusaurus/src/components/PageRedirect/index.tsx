import React, {useEffect} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {useHistory, useLocation} from '@docusaurus/router';
import {getRedirectTarget, type Destination} from './target';

export default function PageRedirect({destination}: {destination: Destination}) {
  const history = useHistory();
  const {search, hash} = useLocation();
  const to = getRedirectTarget(destination, search, hash);

  useEffect(() => {
    if (!destination.from || window.location.pathname.replace(/\/$/, '') === destination.from.replace(/\/$/, '')) {
      history.replace(to);
    }
  }, [destination.from, history, to]);

  return <>
    <Head>
      <title>Page moved</title>
      <meta name="robots" content="noindex" />
      <script>{`if (!${JSON.stringify(destination.from)} || window.location.pathname.replace(/[/]$/, '') === ${JSON.stringify(destination.from)}.replace(/[/]$/, '')) window.location.replace((${getRedirectTarget.toString()})(${JSON.stringify(destination)}, window.location.search, window.location.hash));`}</script>
      <link rel="canonical" href={destination.to} />
    </Head>
    <main className="container margin-vert--lg">
      <p>This page has moved. <Link to={to}>Open the current guide.</Link></p>
    </main>
  </>;
}

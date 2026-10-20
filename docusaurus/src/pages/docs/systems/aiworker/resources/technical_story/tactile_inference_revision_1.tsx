import React, {useEffect} from 'react';
import {useHistory, useLocation} from '@docusaurus/router';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

export default function TactileInferenceRedirect() {
  const history = useHistory();
  const {pathname, search, hash} = useLocation();
  const destination = pathname.replace(/tactile_inference_revision_1\/?$/, 'tactile_inference');

  useEffect(() => {
    history.replace(`${destination}${search}${hash}`);
  }, [history, destination, search, hash]);

  return (
    <Layout title="Tactile ACT">
      <Head><meta name="robots" content="noindex" /></Head>
      <main className="container margin-vert--lg">
        <p>This page has moved to <Link to={destination}>Tactile ACT</Link>.</p>
      </main>
    </Layout>
  );
}

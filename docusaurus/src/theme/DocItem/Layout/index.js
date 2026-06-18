import React from 'react';
import {useLocation} from '@docusaurus/router';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import DocItemLayout from '@theme-original/DocItem/Layout';
import DocItemPaginator from '@theme/DocItem/Paginator';
import DocVersionBanner from '@theme/DocVersionBanner';
import DocVersionBadge from '@theme/DocVersionBadge';
import DocItemFooter from '@theme/DocItem/Footer';
import DocItemContent from '@theme/DocItem/Content';
import DocBreadcrumbs from '@theme/DocBreadcrumbs';
import ContentVisibility from '@theme/ContentVisibility';
import unsupportedRoutes from '@site/src/data/koUnsupportedDocRoutes.json';
import './styles.css';

const unsupportedRouteSet = new Set(unsupportedRoutes);

function normalizeDocPath(pathname) {
  const withoutLocale = pathname.replace(/^\/ko(?=\/docs(?:\/|$))/, '');
  const withoutTrailingSlash = withoutLocale.replace(/\/$/, '');

  return withoutTrailingSlash || '/';
}

function UnsupportedKoreanDocNotice({englishPath}) {
  return (
    <div className="ko-unsupported-doc" aria-labelledby="ko-unsupported-doc-title">
      <section className="ko-unsupported-doc__notice">
        <p className="ko-unsupported-doc__label">한국어 미지원 문서</p>
        <h1 id="ko-unsupported-doc-title">아직 한국어로 제공되지 않는 페이지입니다</h1>
        <p>
          이 문서는 현재 영어 원문만 제공됩니다.
        </p>
        <a className="button button--primary" href={englishPath}>
          영어 원문 보기
        </a>
      </section>
    </div>
  );
}

function UnsupportedKoreanDocLayout({children}) {
  const {metadata} = useDoc();

  return (
    <div className="row">
      <div className="col">
        <ContentVisibility metadata={metadata} />
        <DocVersionBanner />
        <div className="ko-unsupported-doc__container">
          <article>
            <DocBreadcrumbs />
            <DocVersionBadge />
            <DocItemContent>{children}</DocItemContent>
            <DocItemFooter />
          </article>
          <DocItemPaginator />
        </div>
      </div>
    </div>
  );
}

export default function DocItemLayoutWrapper(props) {
  const location = useLocation();
  const normalizedPath = normalizeDocPath(location.pathname);
  const isUnsupportedKoreanDoc =
    location.pathname.startsWith('/ko/docs/') && unsupportedRouteSet.has(normalizedPath);

  if (isUnsupportedKoreanDoc) {
    return (
      <UnsupportedKoreanDocLayout>
        <UnsupportedKoreanDocNotice englishPath={normalizedPath} />
      </UnsupportedKoreanDocLayout>
    );
  }

  return <DocItemLayout {...props} />;
}

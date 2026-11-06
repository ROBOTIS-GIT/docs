import React from 'react';
import Layout from '@theme/Layout';
import SearchMetadata from '@theme/SearchMetadata';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {Props} from '@theme/BlogListPage';
import TechnicalStoryGrid from '@site/src/components/TechnicalStoryGrid';

export default function BlogListPage(props: Props) {
  const {metadata, items} = props;
  const {i18n: {currentLocale}} = useDocusaurusContext();
  return <Layout title={metadata.blogTitle} description={metadata.blogDescription}>
    <SearchMetadata tag="blog_posts_list" />
    <BlogListPageStructuredData {...props} />
    <main className="container margin-vert--xl">
      <header className="margin-bottom--lg">
        <h1>{metadata.blogTitle}</h1>
        <p>{currentLocale === 'ko' ? '로봇을 움직이는 기술과 실험을 만나보세요. 로봇과 기술 태그로 관심 있는 스토리를 찾아보세요.' : 'Explore the engineering, experiments, and ideas behind our robots. Find your next story by robot or technology.'}</p>
      </header>
      <TechnicalStoryGrid items={items} />
    </main>
  </Layout>;
}

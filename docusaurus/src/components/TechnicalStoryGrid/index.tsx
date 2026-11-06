import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import type {Props} from '@theme/BlogPostItems';
import styles from './styles.module.css';

export default function TechnicalStoryGrid({items}: Props) {
  const {i18n: {currentLocale}} = useDocusaurusContext();
  const ko = currentLocale === 'ko';
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const posts = items.map(({content}) => content.metadata);
  const tags = [...new Map(posts.flatMap(post => post.tags).map(tag => [tag.permalink, tag])).values()]
    .sort((a, b) => a.label.localeCompare(b.label));
  const words = query.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const visible = posts.filter(post => {
    const text = [post.title, post.description, ...post.tags.map(tag => tag.label)].join(' ').toLocaleLowerCase();
    return (!selectedTag || post.tags.some(tag => tag.permalink === selectedTag)) && words.every(word => text.includes(word));
  });
  const baseUrl = useBaseUrl('/');
  const reset = () => {setQuery(''); setSelectedTag('');};

  return (
    <section aria-label={ko ? 'Technical Story 검색' : 'Find technical stories'}>
      <div className={styles.filters}>
        <label htmlFor="story-search" className={styles.label}>{ko ? '스토리 검색' : 'Search stories'}</label>
        <input id="story-search" className={styles.search} type="search" value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder={ko ? '제목, 기술 또는 로봇 이름으로 검색' : 'Search by title, technology, or robot'} />
        <div className={styles.tags} role="group" aria-label={ko ? '태그 필터' : 'Filter by tag'}>
          <button type="button" className={styles.tag} aria-pressed={!selectedTag} onClick={() => setSelectedTag('')}>
            {ko ? '전체' : 'All'} <span>{posts.length}</span>
          </button>
          {tags.map(tag => <button type="button" key={tag.permalink} className={styles.tag}
            aria-pressed={selectedTag === tag.permalink} onClick={() => setSelectedTag(selectedTag === tag.permalink ? '' : tag.permalink)}>
            {tag.label} <span>{posts.filter(post => post.tags.some(item => item.permalink === tag.permalink)).length}</span>
          </button>)}
        </div>
      </div>
      <p className={styles.count} role="status">{ko ? `${visible.length}개의 스토리` : `${visible.length} stories`}</p>
      {visible.length === 0 ? <div className={styles.empty}>
        <h2>{ko ? '검색 결과가 없습니다' : 'No stories found'}</h2>
        <p>{ko ? '다른 검색어나 태그를 선택해 보세요.' : 'Try a different search term or tag.'}</p>
        <button type="button" className="button button--secondary" onClick={reset}>{ko ? '필터 초기화' : 'Clear filters'}</button>
      </div> : <div className="ecosystem-project-grid">
        {visible.map(post => <article className={`ecosystem-project-card ${styles.card}`} key={post.permalink}>
          {post.frontMatter.image && <Link to={post.permalink} tabIndex={-1} aria-hidden="true">
            <img src={`${baseUrl}${String(post.frontMatter.image).replace(/^\//, '')}`} alt="" loading="lazy" className="ecosystem-project-image" />
          </Link>}
          <time className={styles.date} dateTime={post.date}>{new Date(post.date).toLocaleDateString(ko ? 'ko-KR' : 'en-US', {year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'})}</time>
          <h2 className={styles.title}><Link to={post.permalink}>{post.title}</Link></h2>
          <p>{post.description}</p>
          <div className={styles.tags}>{post.tags.map(tag => <Link key={tag.permalink} to={tag.permalink} className={styles.cardTag}>{tag.label}</Link>)}</div>
          <div className="ecosystem-project-actions">
            <Link className="ecosystem-project-btn" to={post.permalink} aria-label={`${ko ? '자세히 보기' : 'Read story'}: ${post.title}`}>{ko ? '자세히 보기' : 'Read story'}</Link>
          </div>
        </article>)}
      </div>}
    </section>
  );
}

import React from 'react';
import Link from '@docusaurus/Link';
import {useDocsData, useDocsVersion} from '@docusaurus/plugin-content-docs/client';
import {selectTroubleshootingPosts} from './posts';
import styles from './styles.module.css';

const categories = [
  {id: 'common', title: 'Common'},
  {id: 'bringup', title: 'Bringup'},
  {id: 'teleoperation', title: 'Teleoperation'},
  {id: 'navigation', title: 'Navigation'},
  {id: 'vr_teleoperation', title: 'VR Teleoperation'},
  {id: 'robot_recovery', title: 'Robot Recovery'},
];

export default function TroubleshootingList() {
  const {version, pluginId, docs: metadata} = useDocsVersion();
  const {versions} = useDocsData(pluginId);
  const docs = versions.find(item => item.name === version)?.docs ?? [];
  const posts = selectTroubleshootingPosts(docs, metadata);
  const knownCategories = new Set(categories.map(category => category.id));
  const sections = [...categories, ...Array.from(new Set(posts.map(post => post.category)))
    .filter(category => !knownCategories.has(category))
    .sort()
    .map(id => ({id, title: id.replace(/_/g, ' ')}))];

  return <>
    {sections.map(category => {
      const articles = posts.filter(post => post.category === category.id);
      if (!articles.length) return null;
      return <section key={category.id} className={styles.section}>
        <h2 id={category.id.replace(/_/g, '-')}>{category.title}</h2>
        <ul className={styles.list}>
          {articles.map(post => <li key={post.id}>
            <Link className={styles.card} to={post.path}>
              <span>{post.title}</span><span aria-hidden="true">→</span>
            </Link>
          </li>)}
        </ul>
      </section>;
    })}
  </>;
}

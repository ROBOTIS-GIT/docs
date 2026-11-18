import assert from 'node:assert/strict';
import test from 'node:test';
import {selectTroubleshootingPosts} from './posts.ts';

test('discovers published troubleshooting articles and categorizes them by folder', () => {
  const prefix = 'systems/aiworker/support/troubleshooting/';
  const docs = [
    {id: `${prefix}image_reflashing`, path: '/ko/docs/image'},
    {id: `${prefix}multi_turn_error`, path: '/ko/docs/error'},
    {id: `${prefix}navigation/map`, path: '/ko/docs/map'},
    {id: `${prefix}hidden`, path: '/ko/docs/hidden', unlisted: true},
    {id: 'systems/omy/support/issues', path: '/ko/docs/other'},
  ];
  const metadata = {
    [`${prefix}image_reflashing`]: {title: 'Image Reflashing'},
    [`${prefix}multi_turn_error`]: {title: 'Clearing Multi-turn Error'},
    [`${prefix}navigation/map`]: {title: 'Map Is Not Displayed'},
    [`${prefix}hidden`]: {title: 'Hidden'},
  };
  const posts = selectTroubleshootingPosts(docs, metadata);
  assert.deepEqual(posts.map(post => [post.title, post.category]), [
    ['Clearing Multi-turn Error', 'robot_recovery'],
    ['Image Reflashing', 'robot_recovery'],
    ['Map Is Not Displayed', 'navigation'],
  ]);
  assert.equal(posts[0].path, '/ko/docs/error');
  const newId = `${prefix}common/network`;
  assert.equal(selectTroubleshootingPosts([...docs, {id: newId, path: '/ko/docs/network'}],
    {...metadata, [newId]: {title: 'Network Issues'}}).find(post => post.id === newId).category, 'common');
  assert.deepEqual(selectTroubleshootingPosts([], {}), []);
});

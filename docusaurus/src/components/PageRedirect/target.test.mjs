import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync} from 'node:fs';
import {getRedirectTarget} from './target.ts';

test('keeps query and section when a complete guide moves', () => {
  assert.equal(getRedirectTarget({to: '/docs/software/cyclo/manager/install'}, '?mode=robot', '#installation'),
    '/docs/software/cyclo/manager/install?mode=robot#installation');
});

test('uses the merged section by default and maps old anchors', () => {
  const destination = {to: '/ko/docs/systems/aiworker/overview/software_architecture#middleware', anchors: {'old-heading': 'external-pc-control'}};
  assert.equal(getRedirectTarget(destination, '', ''), destination.to);
  assert.equal(getRedirectTarget(destination, '?from=old', '#old-heading'),
    '/ko/docs/systems/aiworker/overview/software_architecture?from=old#external-pc-control');
  assert.equal(getRedirectTarget(destination, '', '#quick-checks'),
    '/ko/docs/systems/aiworker/overview/software_architecture#quick-checks');
});

test('redirects an old section to a different document while preserving locale, base URL and query', () => {
  const destination = {
    to: '/preview/ko/docs/systems/aiworker/quick_start_guide/bringup',
    anchors: {'old-section': '/docs/software/cyclo/manager/system#launch-arguments'},
  };
  assert.equal(getRedirectTarget(destination, '?from=old', '#old-section'),
    '/preview/ko/docs/software/cyclo/manager/system?from=old#launch-arguments');
});

test('preserves actual legacy section links after overview pages are merged', () => {
  const redirects = JSON.parse(readFileSync(new URL('../../data/docRedirects.json', import.meta.url), 'utf8'));
  for (const [from, hash, expected] of [
    ['/docs/systems/aiworker/quick_start_guide/setup_overview', '#recommended-order', '/docs/systems/aiworker/overview/introduction#quick-start-guide'],
    ['/docs/systems/aiworker/advanced_features', '#1-cyclo-control', '/docs/systems/aiworker/overview/introduction#advanced-feature'],
    ['/docs/systems/aiworker/imitation_learning/overview', '#recommended-tool', '/docs/software/cyclo/cyclo_intelligence#workflow'],
    ['/docs/systems/aiworker/advanced_features/robotis_vuer', '#related-guides', '/docs/systems/aiworker/advanced_features/vr_teleoperation#vr-startup'],
    ['/docs/systems/aiworker/advanced_features/robotis_vuer', '#what-is-vuer', '/docs/systems/aiworker/advanced_features/vr_teleoperation#vr-startup'],
  ]) {
    const value = redirects[from];
    assert.equal(getRedirectTarget(typeof value === 'string' ? {to: value} : value, '', hash), expected);
  }
});

test('preserves the shop introduction link and section anchors after the move', () => {
  const redirects = JSON.parse(readFileSync(new URL('../../data/docRedirects.json', import.meta.url), 'utf8'));
  const destination = {to: redirects['/docs/systems/aiworker/introduction']};
  assert.equal(getRedirectTarget(destination, '', ''), '/docs/systems/aiworker/overview/introduction');
  assert.equal(getRedirectTarget(destination, '?source=shop', '#key-features'),
    '/docs/systems/aiworker/overview/introduction?source=shop#key-features');
});

export type Destination = {to: string; from?: string; anchors?: Record<string, string>};

export function getRedirectTarget(destination: Destination, search: string, hash: string): string {
  const [path, defaultAnchor] = destination.to.split('#');
  const sourceAnchor = hash.replace(/^#/, '');
  const anchor = sourceAnchor ? destination.anchors?.[sourceAnchor] ?? sourceAnchor : defaultAnchor;
  if (anchor?.startsWith('/docs/')) {
    const docsIndex = path.indexOf('/docs/');
    const prefix = docsIndex >= 0 ? path.slice(0, docsIndex) : '';
    const [targetPath, targetAnchor] = anchor.split('#');
    return `${prefix}${targetPath}${search}${targetAnchor ? `#${targetAnchor}` : ''}`;
  }
  return `${path}${search}${anchor ? `#${anchor}` : ''}`;
}

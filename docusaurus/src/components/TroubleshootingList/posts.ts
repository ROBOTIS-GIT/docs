type DocRoute = {id: string; path: string; unlisted?: boolean};
type DocMetadata = {title: string; description?: string};

const prefix = 'systems/aiworker/support/troubleshooting/';

export function selectTroubleshootingPosts(docs: readonly DocRoute[], metadata: Record<string, DocMetadata>) {
  return docs
    .filter(doc => doc.id.startsWith(prefix) && !doc.unlisted && metadata[doc.id])
    .map(doc => {
      const parts = doc.id.slice(prefix.length).split('/');
      return {
        id: doc.id,
        path: doc.path,
        title: metadata[doc.id].title,
        category: parts.length > 1 ? parts[0] : 'robot_recovery',
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'en'));
}

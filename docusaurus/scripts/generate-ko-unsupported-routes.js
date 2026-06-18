const fs = require('fs');
const path = require('path');

const siteDir = path.resolve(__dirname, '..');
const docsDir = path.join(siteDir, 'docs');
const koDocsDir = path.join(
  siteDir,
  'i18n',
  'ko',
  'docusaurus-plugin-content-docs',
  'current',
);
const outputPath = path.join(siteDir, 'src', 'data', 'koUnsupportedDocRoutes.json');
const docExtensions = new Set(['.md', '.mdx']);

function walkDocs(dir, root = dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir, {withFileTypes: true})
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name === '_partials') {
          return [];
        }

        return walkDocs(fullPath, root);
      }

      if (!entry.isFile() || !docExtensions.has(path.extname(entry.name))) {
        return [];
      }

      return [path.relative(root, fullPath)];
    });
}

function withoutExtension(relativePath) {
  return relativePath.replace(/\.(md|mdx)$/, '');
}

function toDocRoute(relativePath) {
  const normalized = withoutExtension(relativePath).split(path.sep).join('/');
  const parts = normalized.split('/');
  const basename = parts[parts.length - 1];
  const parent = parts[parts.length - 2];

  if (basename === 'index' || basename === parent) {
    parts.pop();
  }

  return `/docs/${parts.join('/')}`.replace(/\/$/, '');
}

const koDocFiles = new Set(walkDocs(koDocsDir));
const unsupportedRoutes = walkDocs(docsDir)
  .filter((relativePath) => !koDocFiles.has(relativePath))
  .map(toDocRoute)
  .filter((route, index, routes) => routes.indexOf(route) === index)
  .sort();

fs.mkdirSync(path.dirname(outputPath), {recursive: true});
fs.writeFileSync(
  outputPath,
  `${JSON.stringify(unsupportedRoutes, null, 2)}\n`,
  'utf8',
);

console.log(`Generated ${unsupportedRoutes.length} unsupported Korean doc routes.`);

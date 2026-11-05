const fs = require('node:fs/promises');
const path = require('node:path');

module.exports = function prPreview(context) {
  return {
    name: 'pr-preview-routes',
    configureWebpack(config, isServer) {
      if (isServer || !process.env.DOCUSAURUS_BASE_URL?.startsWith('/pr-preview/')) return {};
      return {plugins: [{apply(compiler) {
        compiler.hooks.done.tapPromise('PreviewAssetSources', async stats => {
          const assets = {};
          const localePrefix = context.i18n.currentLocale === 'ko' ? 'ko/' : '';
          for (const asset of stats.compilation.getAssets()) {
            if (!asset.info.sourceFilename) continue;
            const source = asset.info.sourceFilename.split('?')[0];
            assets[localePrefix + asset.name] = path.isAbsolute(source)
              ? path.relative(context.siteDir, source) : source.replace(/^\.\//, '');
          }
          const root = path.join(context.siteDir, 'build');
          await fs.mkdir(root, {recursive: true});
          await fs.writeFile(path.join(root, `preview-assets-${context.i18n.currentLocale}.json`), JSON.stringify(assets));
        });
      }}]};
    },
    async postBuild({routes, outDir}) {
      const prefix = process.env.DOCUSAURUS_BASE_URL?.replace(/\/$/, '');
      if (!prefix) return;
      const pages = new Map();
      function visit(route) {
        if (route.path && !route.path.includes('*') && !route.routes?.length) {
          pages.set(route.path, {
            route: route.path.startsWith(prefix + '/') ? route.path.slice(prefix.length) : route.path,
            source: route.metadata?.sourceFilePath ?? null,
          });
        }
        route.routes?.forEach(visit);
      }
      routes.forEach(visit);
      // A locale build's outDir is build/ko; manifests belong in the common root.
      const root = path.join(context.siteDir, 'build');
      await fs.mkdir(root, {recursive: true});
      await fs.writeFile(path.join(root, `preview-routes-${context.i18n.currentLocale}.json`), JSON.stringify([...pages.values()]));
    },
  };
};

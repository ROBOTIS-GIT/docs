const redirects = require('../src/data/docRedirects.json');

module.exports = function docRedirects({baseUrl}) {
  return {
    name: 'doc-redirects',
    async contentLoaded({actions: {createData, addRoute}}) {
      for (const [from, value] of Object.entries(redirects)) {
        const target = typeof value === 'string' ? {to: value} : value;
        const destination = await createData(`${from.replaceAll('/', '-')}.json`, JSON.stringify({
          ...target,
          from: baseUrl + from.slice(1),
          to: baseUrl + target.to.slice(1),
        }));
        addRoute({
          path: baseUrl + from.slice(1),
          component: '@site/src/components/PageRedirect/index.tsx',
          exact: true,
          modules: {destination},
        });
      }
    },
  };
};

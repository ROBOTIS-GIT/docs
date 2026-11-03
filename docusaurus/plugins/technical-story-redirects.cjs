const redirects = require('../src/data/technicalStoryRedirects.json');

module.exports = function technicalStoryRedirects({baseUrl}) {
  return {
    name: 'technical-story-redirects',
    async contentLoaded({actions: {createData, addRoute}}) {
      for (const [from, to] of Object.entries(redirects)) {
        const destination = await createData(`${from.replaceAll('/', '-')}.json`, JSON.stringify({
          to: baseUrl + to.slice(1),
        }));
        addRoute({
          path: baseUrl + from.slice(1),
          component: '@site/src/components/TechnicalStoryRedirect/index.tsx',
          exact: true,
          modules: {destination},
        });
      }
    },
  };
};

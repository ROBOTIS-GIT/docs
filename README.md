# ROBOTIS Docs

Official ROBOTIS product documentation.

https://docs.robotis.com

## OMX assembly guide development

The interactive guide is built with the documentation site. Install both dependency
sets with Node.js 22.12 or later:

```sh
cd docusaurus
npm ci
npm ci --prefix omx-assembly
npm start
```

See [the OMX application README](docusaurus/omx-assembly/README.md) for content,
asset provenance, tests and build integration.

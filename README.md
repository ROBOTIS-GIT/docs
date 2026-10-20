# ROBOTIS Docs

Official ROBOTIS product documentation.

https://docs.robotis.com

## Development with Docker Compose

With Docker and Docker Compose installed and Docker running, start the development
server from the repository root:

```sh
docker compose -f docker-compose.dev.yml up --build -d
```

Open http://localhost:5715. The development server uses the English (`en`) locale
and automatically reloads when source files change.

View the logs:

```sh
docker compose -f docker-compose.dev.yml logs -f
```

Stop and remove the development container:

```sh
docker compose -f docker-compose.dev.yml down
```

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

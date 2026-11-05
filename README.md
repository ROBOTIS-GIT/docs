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


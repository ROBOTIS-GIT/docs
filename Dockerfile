# Docusaurus build and serving image with English and Korean locales.
# package.json requires Node.js 20 or newer; GitHub Actions also uses Node.js 20.
#
# docker-compose.yml sets ./docusaurus as the build context.
# Using the repository root would also send .git and source (1 GB+) to the
# Docker daemon, slowing down the build. COPY paths below are therefore
# relative to the docusaurus directory.
FROM node:20

WORKDIR /app

# Copy dependency manifests first to take advantage of layer caching.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the remaining source as the initial content; Compose overlays a volume.
COPY . .

# Docusaurus serving port.
EXPOSE 5714

# Build all locales, then serve the generated static files.
# Treat broken links as warnings so they do not stop the build.
CMD ["/bin/sh", "-c", "DOCUSAURUS_ON_BROKEN_LINKS=warn npm run build && npm run serve -- --host 0.0.0.0 --port 5714"]

# Docusaurus build and serving image with English and Korean locales.
# package.json requires Node.js 22.12 or newer; GitHub Actions also uses Node.js 22.
#
# docker-compose.yml sets ./docusaurus as the build context.
# Using the repository root would also send .git and source (1 GB+) to the
# Docker daemon, slowing down the build. COPY paths below are therefore
# relative to the docusaurus directory.
FROM node:22

WORKDIR /app

# Copy dependency manifests first to take advantage of layer caching.
COPY package.json package-lock.json ./
COPY omx-assembly/package.json omx-assembly/package-lock.json ./omx-assembly/
RUN npm ci && npm ci --prefix omx-assembly

# Copy the remaining source as the initial content; Compose overlays a volume.
COPY . .

# Docusaurus serving port.
EXPOSE 5714

# Match CI/Pages: build each locale separately, then serve the combined output.
# Explicit locale base URLs in docusaurus.config.ts place Korean in build/ko
# while preserving the English files in build.
CMD ["/bin/sh", "-c", "DOCUSAURUS_ON_BROKEN_LINKS=warn npm run build -- --locale en && DOCUSAURUS_ON_BROKEN_LINKS=warn npm run build -- --locale ko && npm run serve -- --host 0.0.0.0 --port 5714"]

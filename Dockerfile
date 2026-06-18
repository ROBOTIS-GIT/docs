# Docusaurus 빌드 + 서빙 이미지 (EN + KO 다국어 포함)
# package.json engines: node >=20, GitHub Actions 빌드도 node 20 사용
#
# 빌드 컨텍스트는 docker-compose.yml 에서 ./docusaurus 로 지정한다.
# (레포 루트를 컨텍스트로 잡으면 .git / source(1GB+) 까지 데몬에 전송되어 느려짐)
# 따라서 아래 COPY 경로는 모두 docusaurus/ 폴더 기준이다.
FROM node:20

WORKDIR /app

# 의존성만 먼저 복사해 레이어 캐시 활용
COPY package.json package-lock.json ./
RUN npm ci

# 나머지 소스 복사 (compose 에서 볼륨으로 덮어쓰므로 초기값 역할)
COPY . .

# Docusaurus serve 포트
EXPOSE 5714

# 전체 빌드(EN + KO) 후 정적 파일 서빙
# DOCUSAURUS_ON_BROKEN_LINKS=warn: broken link를 경고로만 처리해 빌드 중단 방지
CMD ["/bin/sh", "-c", "DOCUSAURUS_ON_BROKEN_LINKS=warn npm run build && npm run serve -- --host 0.0.0.0 --port 5714"]

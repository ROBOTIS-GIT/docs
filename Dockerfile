# Docusaurus 개발 서버용 이미지
# package.json engines: node >=20, GitHub Actions 빌드도 node 20 사용
#
# 빌드 컨텍스트는 docker-compose.yml 에서 ./docusaurus 로 지정한다.
# (레포 루트를 컨텍스트로 잡으면 .git / source(1GB+) 까지 데몬에 전송되어 느려짐)
# 따라서 아래 COPY 경로는 모두 docusaurus/ 폴더 기준이다.
FROM node:20 AS dev

WORKDIR /app

# 의존성만 먼저 복사해 레이어 캐시 활용
COPY package.json package-lock.json ./
RUN npm ci

# 나머지 소스 복사 (compose 에서 볼륨으로 덮어쓰므로 초기값 역할)
COPY . .

# Docusaurus dev 서버 포트
EXPOSE 5714

# 컨테이너 밖(호스트)에서 접속 가능하도록 0.0.0.0 바인딩
CMD ["npm", "run", "start", "--", "--host", "0.0.0.0", "--port", "5714"]

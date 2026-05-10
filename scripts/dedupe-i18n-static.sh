#!/usr/bin/env bash
# Docusaurus i18n 빌드 후처리:
#   - build/ko/img 와 build/ja/img 는 build/img 와 동일한 자산 (locale 무관)
#   - 중복 제거하고 ko/ja HTML의 /ko/img/, /ja/img/ 참조를 /img/ 로 일괄 치환
#   - GitHub Pages artifact 1GB 한계 회피
#
# 사용:
#   bash scripts/dedupe-i18n-static.sh
#
# 주의: webpack assets (build/{ko,ja}/assets) 는 chunk hash 가 locale 별로 달라
# (i18n로 다른 텍스트 포함) 공유 불가. 그대로 유지.

set -e

BUILD=docusaurus/build

if [ ! -d "$BUILD" ]; then
  echo "build directory not found: $BUILD"
  exit 1
fi

before=$(du -sb "$BUILD" 2>/dev/null | cut -f1)
echo "build size before: $((before / 1024 / 1024)) MiB"

for locale in ko; do
  if [ -d "$BUILD/$locale/img" ]; then
    rm -rf "$BUILD/$locale/img"
    echo "removed $BUILD/$locale/img"
  fi
done

# ko HTML의 /ko/img/ → /img/
echo "rewriting HTML img references..."
find "$BUILD/ko" -name "*.html" -type f 2>/dev/null | while IFS= read -r f; do
  sed -i 's|/ko/img/|/img/|g' "$f"
done

# search-index.json 도 동일 처리
if [ -f "$BUILD/ko/search-index.json" ]; then
  sed -i "s|/ko/img/|/img/|g" "$BUILD/ko/search-index.json"
fi

after=$(du -sb "$BUILD" 2>/dev/null | cut -f1)
echo "build size after:  $((after / 1024 / 1024)) MiB"
echo "saved: $(((before - after) / 1024 / 1024)) MiB"

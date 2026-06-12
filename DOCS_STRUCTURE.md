# ROBOTIS Docs — 구조 규칙

## 디렉터리 구조

디렉토리 구조는 메가메뉴-사이드바 구조를 따릅니다.

```
docusaurus/
├── docs/                          # 영문(default) 콘텐츠
│   ├── dxl/
│   │   ├── _partials/             # 시리즈 공유 조각 (ax/ ex/ mx2/ p/ x/ ...)
│   │   ├── model_reference/       # 모델 페이지
│   │   │   ├── ax_series/
│   │   │   ├── ex_series/
│   │   │   ├── mx_series/
│   │   │   ├── x_series/          # xc/ xd/ xh/ xl/ xm/ xw/ 서브폴더
│   │   │   ├── p_series/
│   │   │   ├── y_series/
│   │   │   ├── dyd/
│   │   │   ├── dx_series/
│   │   │   ├── rx_series/
│   │   │   └── pro_series/        # pro_h/ pro_l/ pro_m/ 서브폴더
│   │   └── protocol/
│   ├── edu/kr/
│   ├── faq/
│   ├── parts/
│   │   ├── controller/
│   │   └── interface/
│   ├── software/
│   └── systems/
├── static/img/                    # 이미지 (docs 폴더 구조와 동일하게 대응)
│   └── dxl/model_reference/       # 모델 참조 다이어그램
│       ├── ax_series/
│       ├── ex_series/
│       ├── x_series/
│       └── common_*.webp          # 시리즈 무관 공통 다이어그램
├── sidebars/                      # 섹션별 사이드바 파일
└── sidebars.ts                    # 사이드바 진입점
```

## 폴더 구조 규칙

`docs/` 폴더명은 사이드바의 카테고리 명칭과 1:1로 대응한다. `static/img/` 도 동일한 계층 구조를 따른다.

| docs 경로 | 사이드바 카테고리 | img 경로 |
|-----------|-----------------|----------|
| `dxl/model_reference/ax_series/` | AX Series | `img/dxl/model_reference/ax_series/` |
| `dxl/model_reference/x_series/xl_series/` | XL Series | `img/dxl/model_reference/x_series/` |
| `parts/controller/` | Parts › Controller | `img/parts/controller/` |
| `software/rplus_1_0/` | R+ 1.0 | `img/software/rplus_1_0/` |

## 사이드바 등록

새 페이지를 추가하면 반드시 `sidebars/<section>.ts` 에 항목을 추가한다. `sidebars.ts` 는 건드리지 않아도 된다.

```ts
// sidebars/dxl.ts 예시 — 새 모델 추가
doc('dxl/model_reference/ax_series/ax-12b', 'AX-12B'),
```

새 섹션(제품군)을 추가할 때만 `sidebars/<new>.ts` 파일을 만들고 `sidebars.ts` 에 import한다.

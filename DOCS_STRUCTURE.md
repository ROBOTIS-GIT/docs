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
| `dxl/model_reference/x_series/xl_series/` | XL Series | `img/dxl/model_reference/x_series/xl_series/` |
| `parts/controller/` | Parts › Controller | `img/parts/controller/` |
| `software/rplus_1_0/` | R+ 1.0 | `img/software/rplus_1_0/` |

## 사이드바 등록

새 페이지를 추가하면 반드시 `sidebars/<section>.ts` 에 항목을 추가한다. `sidebars.ts` 는 건드리지 않아도 된다.

```ts
// sidebars/dxl.ts 예시 — 새 모델 추가
doc('dxl/model_reference/ax_series/ax-12b', 'AX-12B'),
```

새 섹션(제품군)을 추가할 때만 `sidebars/<new>.ts` 파일을 만들고 `sidebars.ts` 에 import한다.

## 파본(variant) partial

같은 항목이라도 모델마다 내용이 다른 경우가 있다. e-Manual 이 `page.product_group` 으로
갈라 두던 것들이며, docs 에는 조건문이 없으므로 **파일을 나누고 해당 모델만 다시 연결한다.**

```
_partials/x/warning.mdx              # 기본
_partials/x/warning_xw.mdx           # 방수 XW 시리즈
_partials/x/warning_xl330.mdx        # XL330 (3.3V TTL)
```

규칙:

- 파일명은 `<기본이름>_<대상>.mdx`. 대상은 제품군(`xw`, `x540`, `x330`) 또는 모델군(`xc330_m`).
- 파본 파일 맨 위에 `{/* ... */}` 로 **왜 갈라졌는지** 적는다.
- 기본 파일 맨 위에는 `{/* 파본 있음 ... */}` 로 **함께 고쳐야 할 파일**을 나열한다.
  공통 문장을 수정할 때 파본을 빠뜨리지 않기 위한 장치다.
- EN 과 KO 는 같은 파일 이름을 유지한다. 한쪽 로케일에만 차이가 없더라도 파일은 만들어 둔다.

partial 은 props 를 쓰지 않는다(전체 947개 중 0개). 조건부 렌더링 대신 파일을 나누는 것이
이 레포의 방식이다.

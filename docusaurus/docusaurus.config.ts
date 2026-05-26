import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import generatedRedirects from './redirects.generated.json';

const config: Config = {
  title: 'ROBOTIS Docs',
  tagline: 'ROBOTIS product documentation',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://docs.robotis.com',
  baseUrl: '/',

  organizationName: 'Luke-K-Robotis',
  projectName: 'emanual-v2',

  onBrokenLinks: 'throw',
  // <a id> invisible anchor (inject-heading-anchors.js로 부착)는 빌드 HTML에
  // 살아있지만 Docusaurus 검증 알고리즘은 heading id만 인식. 실제 브라우저
  // anchor scroll 동작 정상이므로 워닝을 끄고 진짜 broken은 시각 검증으로 처리.
  onBrokenAnchors: 'ignore',

  // 클라이언트 사이드 모듈: navbar mega-menu / docs UI enhancements
  clientModules: [
    require.resolve('./src/clients/mega-menu-sticky.js'),
    require.resolve('./src/clients/platform-docs-ui.js'),
  ],
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en-US'},
      ko: {label: '한국어', htmlLang: 'ko-KR'},
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/docs',
          editUrl: 'https://github.com/Luke-K-Robotis/emanual-v2/edit/master/docusaurus/',
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        language: ['en', 'ko'],
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        // scripts/build-redirects.js 가 source/docs/**/*.md 의 permalink 추출 → JSON
        redirects: generatedRedirects,
        // 다국어 redirect (kr/jp 원본 URL → ko/ja 페이지)는 client-redirects
        // 플러그인의 valid-path 검증 한계로 한 번에 처리 불가.
        // 별도 i18n redirect 미들웨어 또는 GitHub Pages level 처리로 후속.
      },
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'ROBOTIS DOCS',
      logo: {
        alt: 'ROBOTIS',
        src: 'img/common/ai_worker_website/favicon.svg',
      },
      items: [
        {
          type: 'dropdown',
          label: 'DYNAMIXEL',
          position: 'left',
          className: 'mega-menu-trigger',
          items: [
            {
              type: 'html',
              className: 'mega-menu-wrapper',
              value: `
                <div class="mega-menu">
                  <div class="mega-menu__left">
                    <div class="mega-menu__category" data-cat="dxl-quickstart" tabindex="0">
                      <h4>Quick Start</h4>
                      <p>Guides and open sources</p>
                    </div>
                    <div class="mega-menu__category" data-cat="dxl-series" tabindex="0">
                      <h4>DYNAMIXEL</h4>
                      <p>Guides and open sources</p>
                    </div>
                    <div class="mega-menu__category" data-cat="dxl-protocol" tabindex="0">
                      <h4>Protocol</h4>
                      <p>Guides and open sources</p>
                    </div>
                  </div>
                  <div class="mega-menu__right">
                    <div class="mega-menu__panel" data-panel="dxl-quickstart">
                      <div class="mega-menu__list">
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/dxl">
                          <span>All DYNAMIXEL</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/dxl/dxl-quick-start-guide">
                          <span>Quick Start</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="dxl-series">
                      <div class="mega-menu__grid mega-menu__grid--3col">
                        <a class="mega-menu__product" href="/docs/dxl/y">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/Y-series.webp" alt="Y Series" /></div>
                          <span>Y Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/p">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/p-series.webp" alt="P Series" /></div>
                          <span>P Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/x">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/x-series.webp" alt="X Series" /></div>
                          <span>X Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/mx">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/mx-series.webp" alt="MX Series" /></div>
                          <span>MX Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/ax">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/ax-series.webp" alt="AX Series" /></div>
                          <span>AX Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/ex">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/ex-series.webp" alt="EX Series" /></div>
                          <span>EX Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/dx">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/dx-series.webp" alt="DX Series" /></div>
                          <span>DX Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/rx">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/rx-series.webp" alt="RX Series" /></div>
                          <span>RX Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/pro">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/pro-series.webp" alt="PRO Series" /></div>
                          <span>PRO Series</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="dxl-protocol">
                      <div class="mega-menu__list">
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/dxl/protocol1">
                          <span>DYNAMIXEL Protocol 1.0</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/dxl/protocol2">
                          <span>DYNAMIXEL Protocol 2.0</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/dxl/crc">
                          <span>CRC Calculation</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              `,
            },
          ],
        },
        {
          type: 'dropdown',
          label: 'Systems',
          position: 'left',
          className: 'mega-menu-trigger',
          items: [
            {
              type: 'html',
              className: 'mega-menu-wrapper',
              value: `
                <div class="mega-menu">
                  <div class="mega-menu__left">
                    <div class="mega-menu__category" data-cat="humanoid" tabindex="0">
                      <h4>Humanoid</h4>
                      <p>Guides and open sources</p>
                    </div>
                    <div class="mega-menu__category" data-cat="hand" tabindex="0">
                      <h4>Robot Hand</h4>
                      <p>Guides and open sources</p>
                    </div>
                    <div class="mega-menu__category" data-cat="manip" tabindex="0">
                      <h4>Manipulator</h4>
                      <p>Guides and open sources</p>
                    </div>
                    <div class="mega-menu__category" data-cat="turtlebot3" tabindex="0">
                      <h4>TurtleBot3</h4>
                      <p>Guides and open sources</p>
                    </div>
                  </div>
                  <div class="mega-menu__right">
                    <div class="mega-menu__panel" data-panel="humanoid">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/systems/aiworker/ai_worker/introduction">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/ai-worker.webp" alt="AI Worker" /></div>
                          <span>AI Worker</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/systems/aisapiens/introduction_ai_sapiens">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/ai-sapiens.webp" alt="AI Sapiens" /></div>
                          <span>AI Sapiens</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/systems/op/getting_started">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/robotos-op.webp" alt="ROBOTIS OP" /></div>
                          <span>ROBOTIS OP</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/systems/thormang3/introduction">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/thormang3.webp" alt="THORMANG3" /></div>
                          <span>THORMANG3</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="hand">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/systems/hx5_d20/hx5_d20/introduction">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/hx5-d20.webp" alt="HX5-D20" /></div>
                          <span>HX5-D20</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/systems/rh_p12_rn">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/rh-p12-rn.webp" alt="RH-P12-RN(A)" /></div>
                          <span>RH-P12-RN(A)</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/systems/rh_p12_rn/rh_p12_rn_ur">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/rh-p12-rn.webp" alt="RH-P12-RN-UR" /></div>
                          <span>RH-P12-RN-UR</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="manip">
                      <div class="mega-menu__group">
                        <h5 class="mega-menu__group-title">AI Manipulator</h5>
                        <p class="mega-menu__group-desc">designed for physical AI research</p>
                        <div class="mega-menu__grid">
                          <a class="mega-menu__product" href="/docs/systems/omy/omy/introduction">
                            <div class="mega-menu__product-thumb"><img src="/img/mega-menu/omy.webp" alt="OMY" /></div>
                            <span>OMY</span>
                          </a>
                          <a class="mega-menu__product" href="/docs/systems/omx/omx/introduction">
                            <div class="mega-menu__product-thumb"><img src="/img/mega-menu/omx.webp" alt="OMX" /></div>
                            <span>OMX</span>
                          </a>
                        </div>
                      </div>
                      <div class="mega-menu__group">
                        <h5 class="mega-menu__group-title">OpenManipulator</h5>
                        <p class="mega-menu__group-desc">Open-Source Manipulator System</p>
                        <div class="mega-menu__list">
                          <a class="mega-menu__product mega-menu__product--row" href="/docs/systems/openmanipulator_p/overview">
                            <div class="mega-menu__product-thumb mega-menu__product-thumb--sm"><img src="/img/mega-menu/openmanipulator-p.webp" alt="OpenMANIPULATOR-P" /></div>
                            <span>OpenMANIPULATOR-P</span>
                          </a>
                          <a class="mega-menu__product mega-menu__product--row" href="/docs/systems/openmanipulator_x/overview">
                            <div class="mega-menu__product-thumb mega-menu__product-thumb--sm"><img src="/img/mega-menu/openmanipulator-x.webp" alt="OpenMANIPULATOR-X" /></div>
                            <span>OpenMANIPULATOR-X</span>
                          </a>
                          <a class="mega-menu__product mega-menu__product--row" href="/docs/systems/manipulator_h/introduction">
                            <div class="mega-menu__product-thumb mega-menu__product-thumb--sm"><img src="/img/mega-menu/manipulator-h.webp" alt="Manipulator-H" /></div>
                            <span>Manipulator-H</span>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="turtlebot3">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/category/turtlebot3">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/turtlebot3.webp" alt="TurtleBot3" /></div>
                          <span>TurtleBot3</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              `,
            },
          ],
        },
        {
          type: 'docSidebar',
          sidebarId: 'softwareSidebar',
          position: 'left',
          label: 'Software',
        },
        {
          type: 'docSidebar',
          sidebarId: 'partsSidebar',
          position: 'left',
          label: 'Parts',
        },
        {
          type: 'docSidebar',
          sidebarId: 'eduSidebar',
          position: 'left',
          label: 'Edu',
        },
        {
          type: 'docSidebar',
          sidebarId: 'faqSidebar',
          position: 'left',
          label: 'FAQ',
        },
        {
          to: '/docs/common/ecosystem',
          position: 'left',
          label: 'Ecosystem',
        },
        {
          to: '/docs/common/opensource',
          position: 'left',
          label: 'Open Source',
        },
        {
          to: '/docs/common/contact',
          position: 'left',
          label: 'Contact',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'DYNAMIXEL', to: '/docs/dxl/'},
            {label: 'Systems', to: '/docs/systems/'},
            {label: 'Software', to: '/docs/software/'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'ROBOTIS Forum', href: 'https://forum.robotis.com/'},
            {label: 'GitHub', href: 'https://github.com/Luke-K-Robotis/emanual-v2'},
          ],
        },
        {
          title: 'More',
          items: [
            {label: 'ROBOTIS', href: 'https://www.robotis.com/'},
            {label: 'Shop', href: 'https://www.robotis.us/'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ROBOTIS Co., Ltd. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'cpp', 'c', 'json', 'yaml', 'cmake', 'ruby', 'csharp', 'java', 'matlab'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

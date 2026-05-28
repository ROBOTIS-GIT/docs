import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
const docsRouteBasePath = process.env.DOCUSAURUS_DOCS_ROUTE_BASE_PATH ?? '/docs';
const onBrokenLinks = ['throw', 'warn', 'ignore', 'log'].includes(process.env.DOCUSAURUS_ON_BROKEN_LINKS ?? '')
  ? (process.env.DOCUSAURUS_ON_BROKEN_LINKS as 'throw' | 'warn' | 'ignore' | 'log')
  : 'throw';

const config: Config = {
  title: 'ROBOTIS Docs',
  tagline: 'ROBOTIS product documentation',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: process.env.DOCUSAURUS_URL ?? 'https://docs.robotis.com',
  baseUrl: process.env.DOCUSAURUS_BASE_URL ?? '/',

  organizationName: 'ROBOTIS-GIT',
  projectName: 'docs',

  onBrokenLinks,
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
          routeBasePath: docsRouteBasePath,
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
        docsRouteBasePath,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
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
                    <div class="mega-menu__category" data-cat="dxl-series" tabindex="0">
                      <h4>Model Reference</h4>
                      <p>Specifications and control tables</p>
                    </div>
                    <div class="mega-menu__category" data-cat="dxl-protocol" tabindex="0">
                      <h4>Protocol</h4>
                      <p>Communication protocol</p>
                    </div>
                  </div>
                  <div class="mega-menu__right">
                    <div class="mega-menu__panel" data-panel="dxl-series">
                      <div class="mega-menu__list">
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/dxl/model_reference/">
                          <span>All Models</span>
                        </a>
                      </div>
                      <div class="mega-menu__grid mega-menu__grid--3col">
                        <a class="mega-menu__product" href="/docs/dxl/model_reference/y_series/">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/Y-series.webp" alt="Y Series" /></div>
                          <span>Y Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/model_reference/p_series/">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/p-series.webp" alt="P Series" /></div>
                          <span>P Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/model_reference/x_series/">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/x-series.webp" alt="X Series" /></div>
                          <span>X Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/model_reference/mx_series/">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/mx-series.webp" alt="MX Series" /></div>
                          <span>MX Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/model_reference/ax_series/">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/ax-series.webp" alt="AX Series" /></div>
                          <span>AX Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/model_reference/ex_series/">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/ex-series.webp" alt="EX Series" /></div>
                          <span>EX Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/model_reference/dx_series/">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/dx-series.webp" alt="DX Series" /></div>
                          <span>DX Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/model_reference/rx_series/">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/rx-series.webp" alt="RX Series" /></div>
                          <span>RX Series</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/dxl/model_reference/pro_series/">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/pro-series.webp" alt="PRO Series" /></div>
                          <span>PRO Series</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="dxl-protocol">
                      <div class="mega-menu__list">
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/dxl/protocol/protocol1">
                          <span>DYNAMIXEL Protocol 1.0</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/dxl/protocol/protocol2">
                          <span>DYNAMIXEL Protocol 2.0</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/dxl/protocol/crc">
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
                        <a class="mega-menu__product" href="/docs/systems/rh_p12_rn/">
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
                        <div class="mega-menu__grid">
                          <a class="mega-menu__product" href="/docs/systems/openmanipulator_p/overview">
                            <div class="mega-menu__product-thumb"><img src="/img/mega-menu/openmanipulator-p.webp" alt="OpenMANIPULATOR-P" /></div>
                            <span>OpenMANIPULATOR-P</span>
                          </a>
                          <a class="mega-menu__product" href="/docs/systems/openmanipulator_x/overview">
                            <div class="mega-menu__product-thumb"><img src="/img/mega-menu/openmanipulator-x.webp" alt="OpenMANIPULATOR-X" /></div>
                            <span>OpenMANIPULATOR-X</span>
                          </a>
                        </div>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="turtlebot3">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/systems/turtlebot3/overview">
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
          type: 'dropdown',
          position: 'left',
          label: 'Software',
          className: 'mega-menu-trigger',
          items: [
            {
              type: 'html',
              className: 'mega-menu-wrapper',
              value: `
                <div class="mega-menu">
                  <div class="mega-menu__left">
                    <div class="mega-menu__category" data-cat="software-overview" tabindex="0">
                      <h4>Overview</h4>
                      <p>Software index</p>
                    </div>
                    <div class="mega-menu__category" data-cat="dynamixel-software" tabindex="0">
                      <h4>DYNAMIXEL Software</h4>
                      <p>Tools and SDKs</p>
                    </div>
                    <div class="mega-menu__category" data-cat="arduino-ide" tabindex="0">
                      <h4>Arduino IDE</h4>
                      <p>Controller development</p>
                    </div>
                  </div>
                  <div class="mega-menu__right">
                    <div class="mega-menu__panel" data-panel="software-overview">
                      <div class="mega-menu__list">
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/software/overview">
                          <span>Overview</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="dynamixel-software">
                      <div class="mega-menu__list">
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/software/dynamixel_sdk">
                          <span>DYNAMIXEL SDK</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/software/dynamixel_wizard_2_0">
                          <span>DYNAMIXEL Wizard 2.0</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/software/dynamixel_easy_sdk">
                          <span>DYNAMIXEL Easy SDK</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/software/dynamixel_workbench">
                          <span>DYNAMIXEL Workbench</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="arduino-ide">
                      <div class="mega-menu__list">
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/software/arduino_ide">
                          <span>Arduino IDE</span>
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
            {label: 'DYNAMIXEL', to: '/docs/dxl/model_reference/'},
            {label: 'Systems', to: '/docs/systems/'},
            {label: 'Software', to: '/docs/software/overview'},
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

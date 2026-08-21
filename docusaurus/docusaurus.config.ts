import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
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
  storage: {
    type: 'localStorage',
    namespace: 'robotis-docs',
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko'],
    localeConfigs: {
      en: { label: 'English', htmlLang: 'en' },
      ko: { label: '한국어', htmlLang: 'ko' },
    },
  },

  organizationName: 'ROBOTIS-GIT',
  projectName: 'docs',

  onBrokenLinks,
  // Invisible <a id> anchors injected by inject-heading-anchors.js remain in
  // the built HTML, but Docusaurus validation only recognizes heading IDs.
  // Browser anchor scrolling works, so ignore these warnings and catch real
  // failures through visual checks.
  onBrokenAnchors: 'ignore',

  // Client-side modules for the navbar mega-menu and docs UI enhancements.
  clientModules: [
    require.resolve('./src/clients/mega-menu-sticky.js'),
    require.resolve('./src/clients/localized-static-images.js'),
    require.resolve('./src/clients/navbar-search-toggle.js'),
    require.resolve('./src/clients/navbar-sidebar-cleanup.js'),
    require.resolve('./src/clients/platform-docs-ui.js'),
  ],
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: docsRouteBasePath,
          showLastUpdateTime: false,
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: [
            './src/css/custom.css',
            './src/css/ohgym.css',
          ],
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

  themes: ['@docusaurus/theme-mermaid'],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css',
      type: 'text/css',
    },
  ],

  themeConfig: {
    image: 'img/og_image.jpg',
    mermaid: {
      options: {
        fontFamily:
          '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
    },
    colorMode: {
      respectPrefersColorScheme: false,
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
                        <a class="mega-menu__product" href="/docs/dxl/model_reference/dyd/">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/dyd.webp" alt="DYD" /></div>
                          <span>DYD</span>
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
                        <a class="mega-menu__product" href="/docs/systems/aiworker/introduction">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/ai-worker.webp" alt="AI Worker" /></div>
                          <span>AI Worker</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/systems/aisapiens/introduction">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/ai-sapiens.webp" alt="AI Sapiens" /></div>
                          <span>AI Sapiens</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/systems/op3/introduction">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/op3.png" alt="ROBOTIS OP3" /></div>
                          <span>ROBOTIS OP3</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/systems/thormang3/introduction">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/thormang3.webp" alt="THORMANG3" /></div>
                          <span>THORMANG3</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="hand">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/systems/hx5_d20/introduction">
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
                          <a class="mega-menu__product" href="/docs/systems/omy/introduction">
                            <div class="mega-menu__product-thumb"><img src="/img/mega-menu/omy.webp" alt="OMY" /></div>
                            <span>OMY</span>
                          </a>
                          <a class="mega-menu__product" href="/docs/systems/omx/introduction">
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
                    <div class="mega-menu__category" data-cat="cyclo" tabindex="0">
                      <h4>CYCLO</h4>
                      <p>Physical AI software platform</p>
                    </div>
                    <div class="mega-menu__category" data-cat="arduino-ide" tabindex="0">
                      <h4>Arduino IDE</h4>
                      <p>Controller development</p>
                    </div>
                    <div class="mega-menu__category" data-cat="rplus" tabindex="0">
                      <h4>R+</h4>
                      <p>RoboPlus software</p>
                    </div>
                  </div>
                  <div class="mega-menu__right">
                    <div class="mega-menu__panel" data-panel="software-overview">
                      <div class="mega-menu__list">
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/software/overview">
                          <span>Software Overview</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="dynamixel-software">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/software/dynamixel_wizard_2_0/introduction">
                          <div class="mega-menu__product-thumb"><img src="/img/software/overview/software.webp" alt="DYNAMIXEL Wizard 2.0" /></div>
                          <span>DYNAMIXEL Wizard 2.0</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/software/dynamixel_sdk">
                          <div class="mega-menu__product-thumb"><img src="/img/software/overview/icon_dynamixel_sdk.webp" alt="DYNAMIXEL SDK" /></div>
                          <span>DYNAMIXEL SDK</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/software/dynamixel_easy_sdk">
                          <div class="mega-menu__product-thumb"><img src="/img/software/overview/icon_dynamixel_sdk.webp" alt="DYNAMIXEL Easy SDK" /></div>
                          <span>DYNAMIXEL Easy SDK</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/software/dynamixel_workbench">
                          <div class="mega-menu__product-thumb"><img src="/img/software/overview/DYNAMIXEL_Workbench_LOGO.webp" alt="DYNAMIXEL Workbench" /></div>
                          <span>DYNAMIXEL Workbench</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="cyclo">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/software/cyclo">
                          <div class="mega-menu__product-thumb"><img src="/img/common/CYCLO_Signature_Horiz.svg" alt="CYCLO" /></div>
                          <span>What is CYCLO?</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="arduino-ide">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/software/arduino_ide">
                          <div class="mega-menu__product-thumb"><img src="/img/software/overview/icon_arduino_ide.webp" alt="Arduino IDE" /></div>
                          <span>Arduino IDE</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="rplus">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/software/rplus_task_3_0">
                          <div class="mega-menu__product-thumb"><img src="/img/software/all_software/R+Task3_APP_ICON.webp" alt="R+ Task 3.0" /></div>
                          <span>R+ Task 3.0</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/software/rplus_manager_2_0">
                          <div class="mega-menu__product-thumb"><img src="/img/software/overview/icon_r_manager.webp" alt="R+ Manager 2.0" /></div>
                          <span>R+ Manager 2.0</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/software/rplus_1_0/rplus_task/getting_started">
                          <div class="mega-menu__product-thumb"><img src="/img/software/overview/icon_task10.webp" alt="R+ Task 1.0" /></div>
                          <span>R+ Task 1.0</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/software/rplus_1_0/rplus_manager">
                          <div class="mega-menu__product-thumb"><img src="/img/software/overview/icon_manager10.webp" alt="R+ Manager 1.0" /></div>
                          <span>R+ Manager 1.0</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/software/rplus_1_0/rplus_motion">
                          <div class="mega-menu__product-thumb"><img src="/img/software/overview/icon_motion10.webp" alt="R+ Motion 1.0" /></div>
                          <span>R+ Motion 1.0</span>
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
          label: 'Parts',
          position: 'left',
          className: 'mega-menu-trigger',
          items: [
            {
              type: 'html',
              className: 'mega-menu-wrapper',
              value: `
                <div class="mega-menu">
                  <div class="mega-menu__left">
                    <div class="mega-menu__category" data-cat="parts-controller" tabindex="0">
                      <h4>Controller</h4>
                      <p>Arduino-based DYNAMIXEL controllers</p>
                    </div>
                    <div class="mega-menu__category" data-cat="parts-interface" tabindex="0">
                      <h4>Interface</h4>
                      <p>Communication interface boards</p>
                    </div>
                  </div>
                  <div class="mega-menu__right">
                    <div class="mega-menu__panel" data-panel="parts-controller">
                      <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/parts/controller/controller_compatibility">
                        <span>Controller Compatibility</span>
                      </a>
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/parts/controller/openrb-150">
                          <div class="mega-menu__product-thumb"><img src="/img/parts/controller/openrb-150/openrb-150_product.webp" alt="OpenRB-150" /></div>
                          <span>OpenRB-150</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/parts/controller/opencr10">
                          <div class="mega-menu__product-thumb"><img src="/img/parts/controller/opencr10/opencr_product.webp" alt="OpenCR 1.0" /></div>
                          <span>OpenCR 1.0</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/parts/controller/cm-550">
                          <div class="mega-menu__product-thumb"><img src="/img/parts/controller/cm-550/cm-550_product.png" alt="CM-550" /></div>
                          <span>CM-550</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/parts/controller/cm-530">
                          <div class="mega-menu__product-thumb"><img src="/img/parts/controller/cm-530/cm-530_product.webp" alt="CM-530" /></div>
                          <span>CM-530</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="parts-interface">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/parts/interface/u2d2">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/u2d2.webp" alt="U2D2" /></div>
                          <span>U2D2</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/parts/interface/u2d2_power_hub">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/u2d2-phb.webp" alt="U2D2 Power Hub Board" /></div>
                          <span>U2D2 PHB</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/parts/interface/dxl_bridge">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/dxl-bridge.webp" alt="DXL-Bridge" /></div>
                          <span>DXL-Bridge</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/parts/interface/dynamixel_shield">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/dynamixel-shield.webp" alt="DYNAMIXEL Shield" /></div>
                          <span>DYNAMIXEL Shield</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/parts/interface/mkr_shield">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/mkr-shield.webp" alt="MKR Shield" /></div>
                          <span>MKR Shield</span>
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
          label: 'Edu',
          position: 'left',
          className: 'mega-menu-trigger',
          items: [
            {
              type: 'html',
              className: 'mega-menu-wrapper',
              value: `
                <div class="mega-menu">
                  <div class="mega-menu__left">
                    <div class="mega-menu__category" data-cat="edu-bioloid" tabindex="0">
                      <h4>Bioloid</h4>
                      <p>Modular robotics education kits</p>
                    </div>
                    <div class="mega-menu__category" data-cat="edu-engineer" tabindex="0">
                      <h4>Engineer</h4>
                      <p>AI-based robotics education kits</p>
                    </div>
                  </div>
                  <div class="mega-menu__right">
                    <div class="mega-menu__panel" data-panel="edu-bioloid">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/edu/bioloid/premium">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/bioloid-premium.webp" alt="ROBOTIS Premium" /></div>
                          <span>ROBOTIS Premium</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="edu-engineer">
                      <div class="mega-menu__grid">
                        <a class="mega-menu__product" href="/docs/edu/engineer/kit1">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/engineer-kit1.webp" alt="Engineer Kit 1" /></div>
                          <span>Engineer Kit 1</span>
                        </a>
                        <a class="mega-menu__product" href="/docs/edu/engineer/kit2_introduction">
                          <div class="mega-menu__product-thumb"><img src="/img/mega-menu/engineer-kit2.webp" alt="Engineer Kit 2" /></div>
                          <span>Engineer Kit 2</span>
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
          label: 'FAQ',
          position: 'left',
          className: 'mega-menu-trigger',
          items: [
            {
              type: 'html',
              className: 'mega-menu-wrapper',
              value: `
                <div class="mega-menu">
                  <div class="mega-menu__left">
                    <div class="mega-menu__category" data-cat="faq-by-topic" tabindex="0">
                      <h4>FAQ by Topic</h4>
                      <p>Answers by product category</p>
                    </div>
                    <div class="mega-menu__category" data-cat="faq-guides" tabindex="0">
                      <h4>Guides</h4>
                      <p>Reference guides and how-tos</p>
                    </div>
                  </div>
                  <div class="mega-menu__right">
                    <div class="mega-menu__panel" data-panel="faq-by-topic">
                      <div class="mega-menu__list">
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/faq/faq_dynamixel">
                          <span>DYNAMIXEL</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/faq/faq_platform">
                          <span>DYNAMIXEL System</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/faq/faq_steam">
                          <span>Education Kits</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/faq/faq_software">
                          <span>Software</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/faq/faq_parts">
                          <span>Parts</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/faq/faq_general">
                          <span>General</span>
                        </a>
                      </div>
                    </div>
                    <div class="mega-menu__panel" data-panel="faq-guides">
                      <div class="mega-menu__list">
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/faq/dxl-selection-guide">
                          <span>DYNAMIXEL Selection Guide</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/faq/download_task_code">
                          <span>Download Task Code</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/faq/cm_510_530_fuse">
                          <span>CM-510/530 Fuse Replacement</span>
                        </a>
                        <a class="mega-menu__product mega-menu__product--row mega-menu__product--text" href="/docs/faq/op">
                          <span>DARWIN-OP FAQ</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              `,
            },
          ],
        },
        { type: 'localeDropdown', position: 'right' },
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
          to: '/docs/common/oh_project',
          position: 'left',
          label: 'OH! Project',
        },
        {
          to: '/docs/common/contact',
          position: 'left',
          label: 'Contact',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [],
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

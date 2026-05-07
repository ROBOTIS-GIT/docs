import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import generatedRedirects from './redirects.generated.json';

const config: Config = {
  title: 'ROBOTIS e-Manual',
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
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
      onBrokenMarkdownImages: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ko', 'ja'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en-US'},
      ko: {label: '한국어', htmlLang: 'ko-KR'},
      ja: {label: '日本語', htmlLang: 'ja-JP'},
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
        language: ['en', 'ko', 'ja'],
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
      },
    ],
  ],

  themeConfig: {
    image: 'img/robotis-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'ROBOTIS e-Manual',
      logo: {
        alt: 'ROBOTIS Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'dxlSidebar',
          position: 'left',
          label: 'DYNAMIXEL',
        },
        {
          type: 'docSidebar',
          sidebarId: 'platformSidebar',
          position: 'left',
          label: 'Platform',
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
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://github.com/Luke-K-Robotis/emanual-v2',
          label: 'GitHub',
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
            {label: 'Platform', to: '/docs/platform/'},
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

import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomeHero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          <Translate id="home.hero.title">ROBOTIS DOCS</Translate>
        </Heading>
        <p className={styles.heroSubtitle}>
          <Translate id="home.hero.subtitle">
            Complete e-Manuals for ROBOTIS products, from DYNAMIXEL actuators to robot platforms and developer tools.
          </Translate>
        </p>
      </div>
    </header>
  );
}

type CardProps = {
  to: string;
  imageSrc: string;
  imageAlt: string;
  title: ReactNode;
  desc: ReactNode;
};

function ProductCard({to, imageSrc, imageAlt, title, desc}: CardProps): ReactNode {
  return (
    <Link to={to} className={styles.productCard}>
      <div className={styles.productImageWrap}>
        <img src={imageSrc} alt={imageAlt} className={styles.productImage} />
      </div>
      <Heading as="h3" className={styles.productTitle}>
        {title}
      </Heading>
      <p className={styles.productDesc}>{desc}</p>
      <span className={styles.productCta}>
        <Translate id="home.card.cta">Explore</Translate>
        <span aria-hidden className={styles.productCtaArrow}>
          →
        </span>
      </span>
    </Link>
  );
}
 
function ProductGrid(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container"> 
        <div className={styles.productGrid}>
          <ProductCard
            to="/docs/dxl/model_reference"
            imageSrc="/img/home/dxl.png"
            imageAlt="DYNAMIXEL"
            title={<Translate id="home.card.dxl.title">DYNAMIXEL</Translate>}
            desc={
              <Translate id="home.card.dxl.desc">
                Smart actuators — Y, P, X, MX, AX series and more.
              </Translate>
            }
          />
          <ProductCard
            to="/docs/systems/aiworker/ai_worker/introduction"
            imageSrc="/img/mega-menu/ai-worker.webp"
            imageAlt="AI Worker"
            title={<Translate id="home.card.aiworker.title">AI Worker</Translate>}
            desc={
              <Translate id="home.card.aiworker.desc">
                Semi-humanoid robot for physical AI and industrial automation.
              </Translate>
            }
          />
          <ProductCard
            to="/docs/systems/hx5_d20/hx5_d20/introduction"
            imageSrc="/img/mega-menu/hx5-d20.webp"
            imageAlt="Robot Hand"
            title={<Translate id="home.card.hand.title">Hand</Translate>}
            desc={
              <Translate id="home.card.hand.desc">
                Dexterous robot hands — HX5-D20, RH-P12-RN series.
              </Translate>
            }
          />
          <ProductCard
            to="/docs/systems/omy/omy/introduction"
            imageSrc="/img/mega-menu/omy.webp"
            imageAlt="OMY"
            title={<Translate id="home.card.omy.title">OMY</Translate>}
            desc={
              <Translate id="home.card.omy.desc">
                AI manipulator designed for physical AI research.
              </Translate>
            }
          />
        </div>
      </div>
    </section>
  );
}

type SiteEntry = {label: string; href: string};
type SiteLinkProps = {label: ReactNode; entries: SiteEntry[]; icon: ReactNode};

function SiteLinkItem({label, entries, icon}: SiteLinkProps): ReactNode {
  return (
    <li className={styles.siteLinkWrap}>
      <div className={styles.siteLink}>
        {icon}
        <span>{label}</span>
      </div>
      <ul className={styles.siteLinkDropdown}>
        {entries.map(({label: entryLabel, href}) => (
          <li key={entryLabel}>
            <a href={href} className={styles.siteLinkDropdownItem} target="_blank" rel="noopener noreferrer">
              {entryLabel}
            </a>
          </li>
        ))}
      </ul>
    </li>
  );
}

type SocialCardProps = {href: string; label: string; children: ReactNode};

function SocialCard({href, label, children}: SocialCardProps): ReactNode {
  return (
    <li className={styles.siteLinkWrap}>
      <a href={href} target="_blank" rel="noopener noreferrer" className={styles.siteLink} aria-label={label} title={label}>
        {children}
        <span>{label}</span>
      </a>
    </li>
  );
}

function RelatedSites(): ReactNode {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <span className={styles.sectionEyebrow}>
          <Translate id="home.sites.eyebrow">External links</Translate>
        </span>
        <Heading as="h2" className={styles.sectionTitle}>
          <Translate id="home.sites.heading">Related Sites</Translate>
        </Heading>
        <ul className={styles.siteLinks}>
          <SiteLinkItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="18.5" textAnchor="middle" fontSize="17" fontWeight="900" fill="currentColor">R</text></svg>}
            label={<Translate id="home.sites.robotis">ROBOTIS.COM</Translate>}
            entries={[
              {label: 'English', href: 'https://www.robotis.com/en/'},
              {label: 'Korea',   href: 'https://www.robotis.com/ko/'},
              {label: 'China',   href: 'https://www.robotis.com/zh/'},
              {label: 'Japan',   href: 'https://www.robotis.com/ja/'},
            ]}
          />
          <SiteLinkItem
            icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 5.9 17 7 17h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H19c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 23.45 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>}
            label={<Translate id="home.sites.shop">Shop</Translate>}
            entries={[
              {label: 'International', href: 'https://en.robotis.com/shop_en/'},
              {label: 'Korea',         href: 'https://en.robotis.com/shop/'},
              {label: 'US',            href: 'https://robotis.us/'},
              {label: 'Japan',         href: 'https://e-shop.robotis.co.jp/'},
            ]}
          />
          <SocialCard href="https://github.com/ROBOTIS-GIT/" label="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
          </SocialCard>
          <SocialCard href="https://www.youtube.com/@ROBOTISOpenSourceTeam" label="YouTube">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M23.499 6.203a3.008 3.008 0 0 0-2.089-2.089c-1.87-.501-9.4-.501-9.4-.501s-7.509 0-9.399.501A3.008 3.008 0 0 0 .523 6.203C.022 8.073.022 12 .022 12s0 3.926.5 5.797a3.008 3.008 0 0 0 2.088 2.089c1.868.502 9.401.502 9.401.502s7.508 0 9.399-.502a3.008 3.008 0 0 0 2.089-2.089c.5-1.862.5-5.797.5-5.797s-.01-3.926-.5-5.797zM9.609 15.601V8.408l6.264 3.602z"/></svg>
          </SocialCard>
          <SocialCard href="https://discord.gg/robotis" label="Discord">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.102.138 18.116a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
          </SocialCard>
          <SocialCard href="https://x.com/ROBOTISAmerica" label="X">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
          </SocialCard>
          <SocialCard href="https://www.instagram.com/robotis_global/" label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.74 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
          </SocialCard>
          <SocialCard href="https://www.facebook.com/robotis.company" label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </SocialCard>
          <SocialCard href="https://www.linkedin.com/company/robotis/" label="LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </SocialCard>
        </ul>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description={translate({
        id: 'home.meta.description',
        message: 'Complete e-Manuals for ROBOTIS products, platforms, and developer tools.',
      })}>
      <HomeHero />
      <main>
        <ProductGrid />
        <RelatedSites />
      </main>
    </Layout>
  );
}

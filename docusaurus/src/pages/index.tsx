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
type SiteLinkProps = {label: ReactNode; entries: SiteEntry[]};

function SiteLinkItem({label, entries}: SiteLinkProps): ReactNode {
  return (
    <li className={styles.siteLinkWrap}>
      <div className={styles.siteLink}>
        <span>{label}</span>
        <span aria-hidden className={styles.siteLinkArrow}>▾</span>
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
        <p className={styles.sectionLead}>
          <Translate id="home.sites.lead">
            Visit ROBOTIS official websites and online shops.
          </Translate>
        </p>
        <ul className={styles.siteLinks}>
          <SiteLinkItem
            label={<Translate id="home.sites.robotis">ROBOTIS.COM</Translate>}
            entries={[
              {label: 'English', href: 'https://www.robotis.com/en/'},
              {label: 'Korea', href: 'https://www.robotis.com/ko/'},
              {label: 'China', href: 'https://www.robotis.com/zh/'},
              {label: 'Japan', href: 'https://www.robotis.com/ja/'},
            ]}
          />
          <SiteLinkItem
            label={<Translate id="home.sites.shop">Shop</Translate>}
            entries={[
              {label: 'International', href: 'https://en.robotis.com/shop_en/'},
              {label: 'Korea', href: 'https://en.robotis.com/shop/'},
              {label: 'US', href: 'https://robotis.us/'},
              {label: 'Japan', href: 'https://e-shop.robotis.co.jp/'},
            ]}
          />
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

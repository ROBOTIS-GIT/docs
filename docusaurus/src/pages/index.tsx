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
          <Translate id="home.hero.title">ROBOTIS e-Manual</Translate>
        </Heading>
        <p className={styles.heroSubtitle}>
          <Translate id="home.hero.subtitle">
            Documentation for ROBOTIS hardware, firmware, and developer tools.
          </Translate>
        </p>
        <div className={styles.heroActions}>
          <Link className="button button--primary button--lg" to="/docs/dxl/">
            <Translate id="home.hero.ctaPrimary">Browse documentation</Translate>
          </Link>
          <Link
            className={`button button--secondary button--lg ${styles.heroSecondary}`}
            to="/search">
            <Translate id="home.hero.ctaSecondary">Search the manuals</Translate>
          </Link>
        </div>
      </div>
    </header>
  );
}

type CardProps = {
  to: string;
  emoji: string;
  title: ReactNode;
  desc: ReactNode;
};

function ProductCard({to, emoji, title, desc}: CardProps): ReactNode {
  return (
    <Link to={to} className={styles.productCard}>
      <div className={styles.productEmoji} aria-hidden>
        {emoji}
      </div>
      <Heading as="h3" className={styles.productTitle}>
        {title}
      </Heading>
      <p className={styles.productDesc}>{desc}</p>
    </Link>
  );
}

function ProductGrid(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          <Translate id="home.products.heading">Browse by category</Translate>
        </Heading>
        <div className={styles.productGrid}>
          <ProductCard
            to="/docs/dxl/"
            emoji="⚙️"
            title={<Translate id="home.card.dxl.title">DYNAMIXEL</Translate>}
            desc={
              <Translate id="home.card.dxl.desc">
                Smart actuators — Y, P, X, MX, AX series and more.
              </Translate>
            }
          />
          <ProductCard
            to="/docs/platform/"
            emoji="🤖"
            title={<Translate id="home.card.platform.title">Platform</Translate>}
            desc={
              <Translate id="home.card.platform.desc">
                Robot platforms — TurtleBot3, OP3, OMY, OpenManipulator.
              </Translate>
            }
          />
          <ProductCard
            to="/docs/software/"
            emoji="🛠️"
            title={<Translate id="home.card.software.title">Software</Translate>}
            desc={
              <Translate id="home.card.software.desc">
                SDKs, Wizard, R+ Suite, ROS packages.
              </Translate>
            }
          />
          <ProductCard
            to="/docs/parts/"
            emoji="🔩"
            title={<Translate id="home.card.parts.title">Parts</Translate>}
            desc={
              <Translate id="home.card.parts.desc">
                Frames, brackets, controllers, sensors and accessories.
              </Translate>
            }
          />
          <ProductCard
            to="/docs/edu/"
            emoji="🎓"
            title={<Translate id="home.card.edu.title">Education</Translate>}
            desc={
              <Translate id="home.card.edu.desc">
                STEAM kits and curriculum-friendly platforms.
              </Translate>
            }
          />
          <ProductCard
            to="/docs/faq/"
            emoji="❓"
            title={<Translate id="home.card.faq.title">FAQ</Translate>}
            desc={
              <Translate id="home.card.faq.desc">
                Frequently asked questions and troubleshooting.
              </Translate>
            }
          />
        </div>
      </div>
    </section>
  );
}

type QuickProps = {to: string; label: ReactNode};

function QuickLink({to, label}: QuickProps): ReactNode {
  return (
    <li>
      <Link to={to} className={styles.quickLink}>
        {label}
        <span aria-hidden className={styles.quickArrow}>
          →
        </span>
      </Link>
    </li>
  );
}

function PopularGuides(): ReactNode {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          <Translate id="home.popular.heading">Popular guides</Translate>
        </Heading>
        <ul className={styles.quickLinks}>
          <QuickLink
            to="/docs/dxl/ax/ax-12a"
            label={<Translate id="home.quick.ax12a">AX-12A reference</Translate>}
          />
          <QuickLink
            to="/docs/dxl/"
            label={<Translate id="home.quick.dxlIntro">DYNAMIXEL overview</Translate>}
          />
          <QuickLink
            to="/docs/platform/"
            label={<Translate id="home.quick.platform">Robot platforms</Translate>}
          />
          <QuickLink
            to="/docs/software/"
            label={<Translate id="home.quick.software">Software & SDKs</Translate>}
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
        message: 'Documentation for ROBOTIS hardware, firmware, and developer tools.',
      })}>
      <HomeHero />
      <main>
        <ProductGrid />
        <PopularGuides />
      </main>
    </Layout>
  );
}

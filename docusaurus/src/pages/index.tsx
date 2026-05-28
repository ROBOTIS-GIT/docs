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
            to="/docs/systems/"
            imageSrc="/img/home/platform.png"
            imageAlt="Systems"
            title={<Translate id="home.card.platform.title">Ecosystem</Translate>}
            desc={
              <Translate id="home.card.platform.desc">
                Robot Ecosystem — Humanoid, Manipulator, Mobile, and etc. platforms.
              </Translate>
            }
          />
          <ProductCard
            to="/docs/software/"
            imageSrc="/img/home/software.png"
            imageAlt="Software"
            title={<Translate id="home.card.software.title">Software</Translate>}
            desc={
              <Translate id="home.card.software.desc">
                SDKs, Wizard, ROS packages.
              </Translate>
            }
          />
          <ProductCard
            to="/docs/parts/"
            imageSrc="/img/home/parts.png"
            imageAlt="Parts"
            title={<Translate id="home.card.parts.title">Parts</Translate>}
            desc={
              <Translate id="home.card.parts.desc">
                Frames, brackets, controllers, sensors and accessories.
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
        <span className={styles.sectionEyebrow}>
          <Translate id="home.popular.eyebrow">Quick links</Translate>
        </span>
        <Heading as="h2" className={styles.sectionTitle}>
          <Translate id="home.popular.heading">Popular guides</Translate>
        </Heading>
        <p className={styles.sectionLead}>
          <Translate id="home.popular.lead">
            Frequently visited references and getting-started guides.
          </Translate>
        </p>
        <ul className={styles.quickLinks}>
          <QuickLink
            to="/docs/dxl/model_reference/ax_series/ax-12a"
            label={<Translate id="home.quick.ax12a">AX-12A reference</Translate>}
          />
          <QuickLink
            to="/docs/dxl/model_reference"
            label={<Translate id="home.quick.dxlIntro">DYNAMIXEL overview</Translate>}
          />
          <QuickLink
            to="/docs/systems/"
            label={<Translate id="home.quick.platform">Robot platforms</Translate>}
          />
          <QuickLink
            to="/docs/software/"
            label={<Translate id="home.quick.software">Software & SDKs</Translate>}
          />
          <QuickLink
            to="/docs/edu/"
            label={<Translate id="home.quick.edu">Education kits</Translate>}
          />
          <QuickLink
            to="/docs/faq/"
            label={<Translate id="home.quick.faq">FAQ</Translate>}
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
        <PopularGuides />
      </main>
    </Layout>
  );
}

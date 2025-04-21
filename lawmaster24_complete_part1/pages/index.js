// pages/index.js - Updated with modern design and interactivity
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <Layout title="Startseite">
      <Head>
        <title>lawmaster24.com - KI-gestützte Rechtsassistenz-Plattform</title>
        <meta name="description" content="Automatisierte rechtliche Einschätzungen und Vorabschreiben generieren, passende Anwälte finden, Dokumente hochladen und rechtliche Weiterbearbeitung anstoßen." />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </Head>

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>Rechtliche Einschätzungen einfach und schnell</h1>
          <p>
            lawmaster24.com nutzt künstliche Intelligenz, um Ihnen in wenigen Minuten eine fundierte rechtliche Einschätzung zu liefern. Sparen Sie Zeit und Geld mit unserer innovativen Plattform.
          </p>
          <div className={styles.heroCta}>
            <Link href="/legal-assessment">
              <Button variant="secondary" size="large">Rechtliche Einschätzung anfordern</Button>
            </Link>
            <Link href="/find-lawyer">
              <Button variant="outline" size="large">Anwalt finden</Button>
            </Link>
          </div>
        </div>
        <div className={styles.heroImage}>
          <img src="/images/hero-illustration.svg" alt="Rechtliche Einschätzung" />
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>So funktioniert's</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>
                <i className="fas fa-file-alt"></i>
              </div>
              <h3>1. Fall beschreiben</h3>
              <p>Beschreiben Sie Ihr rechtliches Anliegen und beantworten Sie einige gezielte Fragen.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>
                <i className="fas fa-robot"></i>
              </div>
              <h3>2. KI-Analyse</h3>
              <p>Unsere KI analysiert Ihren Fall und erstellt eine fundierte rechtliche Einschätzung.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>
                <i className="fas fa-file-contract"></i>
              </div>
              <h3>3. Ergebnis erhalten</h3>
              <p>Erhalten Sie Ihre rechtliche Einschätzung und bei Bedarf ein Vorabschreiben.</p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepIcon}>
                <i className="fas fa-user-tie"></i>
              </div>
              <h3>4. Anwalt finden</h3>
              <p>Bei Bedarf vermitteln wir Ihnen einen passenden Anwalt für die Weiterbearbeitung.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section + ' ' + styles.featuresSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Unsere Rechtsgebiete</h2>
          <div className={styles.features}>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}><i className="fas fa-gavel"></i></div>
              <h3>Erbrecht</h3>
              <p>Testamente, Erbschaften, Pflichtteilsansprüche und Nachlassregelungen.</p>
              <Link href="/legal-assessment?area=erbrecht">
                <Button variant="outline" size="small">Mehr erfahren</Button>
              </Link>
            </Card>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}><i className="fas fa-home"></i></div>
              <h3>Mietrecht</h3>
              <p>Mietverträge, Mietminderung, Kündigungen und Nebenkostenabrechnungen.</p>
              <Link href="/legal-assessment?area=mietrecht">
                <Button variant="outline" size="small">Mehr erfahren</Button>
              </Link>
            </Card>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}><i className="fas fa-users"></i></div>
              <h3>Familienrecht</h3>
              <p>Scheidung, Unterhalt, Sorgerecht und Ehevertrag.</p>
              <Link href="/legal-assessment?area=familienrecht">
                <Button variant="outline" size="small">Mehr erfahren</Button>
              </Link>
            </Card>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}><i className="fas fa-briefcase"></i></div>
              <h3>Arbeitsrecht</h3>
              <p>Kündigung, Abmahnung, Arbeitsvertrag und Arbeitszeugnis.</p>
              <Link href="/legal-assessment?area=arbeitsrecht">
                <Button variant="outline" size="small">Mehr erfahren</Button>
              </Link>
            </Card>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}><i className="fas fa-car"></i></div>
              <h3>Verkehrsrecht</h3>
              <p>Verkehrsunfälle, Bußgeldbescheide und Fahrverbote.</p>
              <Link href="/legal-assessment?area=verkehrsrecht">
                <Button variant="outline" size="small">Mehr erfahren</Button>
              </Link>
            </Card>
            <Card className={styles.featureCard}>
              <div className={styles.featureIcon}><i className="fas fa-file-signature"></i></div>
              <h3>Vertragsrecht</h3>
              <p>Vertragsgestaltung, Vertragsprüfung und Vertragsstreitigkeiten.</p>
              <Link href="/legal-assessment?area=vertragsrecht">
                <Button variant="outline" size="small">Mehr erfahren</Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <section className={styles.section + ' ' + styles.pricingSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Einfache und transparente Preise</h2>
          <div className={styles.pricing}>
            <Card className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <h3>Rechtliche Einschätzung</h3>
                <div className={styles.price}>
                  <span className={styles.amount}>4,99 €</span>
                  <span className={styles.period}>pro Fall</span>
                </div>
              </div>
              <div className={styles.pricingFeatures}>
                <ul>
                  <li><i className="fas fa-check"></i> Detaillierte rechtliche Einschätzung</li>
                  <li><i className="fas fa-check"></i> Handlungsempfehlungen</li>
                  <li><i className="fas fa-check"></i> Relevante Gesetzesgrundlagen</li>
                  <li><i className="fas fa-check"></i> Vorabschreiben (wenn sinnvoll)</li>
                  <li><i className="fas fa-check"></i> Anwaltsempfehlung (optional)</li>
                </ul>
              </div>
              <div className={styles.pricingFooter}>
                <Link href="/legal-assessment">
                  <Button variant="primary" size="large" fullWidth>Jetzt starten</Button>
                </Link>
              </div>
            </Card>
            <Card className={styles.pricingCard + ' ' + styles.pricingCardFeatured}>
              <div className={styles.pricingBadge}>Beliebt</div>
              <div className={styles.pricingHeader}>
                <h3>Demo-Fall</h3>
                <div className={styles.price}>
                  <span className={styles.amount}>0 €</span>
                  <span className={styles.period}>einmalig</span>
                </div>
              </div>
              <div className={styles.pricingFeatures}>
                <ul>
                  <li><i className="fas fa-check"></i> Ein kostenloser Demo-Fall</li>
                  <li><i className="fas fa-check"></i> Alle Features der rechtlichen Einschätzung</li>
                  <li><i className="fas fa-check"></i> Ideal zum Testen unserer Plattform</li>
                  <li><i className="fas fa-check"></i> Keine Zahlungsdaten erforderlich</li>
                  <li><i className="fas fa-check"></i> Sofort verfügbar nach Registrierung</li>
                </ul>
              </div>
              <div className={styles.pricingFooter}>
                <Link href="/register">
                  <Button variant="primary" size="large" fullWidth>Kostenlos registrieren</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className={styles.section + ' ' + styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2>Bereit für Ihre rechtliche Einschätzung?</h2>
            <p>Registrieren Sie sich jetzt und erhalten Sie Ihren ersten Fall kostenlos!</p>
            <Link href="/register">
              <Button variant="primary" size="large">Jetzt kostenlos starten</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}

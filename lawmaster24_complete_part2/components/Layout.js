// components/Layout.js - Updated with modern design and interactivity
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Layout.module.css';

export default function Layout({ children, title = 'lawmaster24.com' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{title} - KI-gestützte Rechtsassistenz-Plattform</title>
        <meta name="description" content="Automatisierte rechtliche Einschätzungen und Vorabschreiben generieren, passende Anwälte finden, Dokumente hochladen und rechtliche Weiterbearbeitung anstoßen." />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      </Head>

      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logo}>
            <Link href="/">
              <a>
                <span className={styles.logoIcon}><i className="fas fa-balance-scale"></i></span>
                <span className={styles.logoText}>lawmaster24</span>
              </a>
            </Link>
          </div>
          
          <button className={styles.mobileMenuButton} onClick={toggleMobileMenu} aria-label="Toggle menu">
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
          
          <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
            <Link href="/">
              <a className={styles.navLink}>Startseite</a>
            </Link>
            <Link href="/legal-assessment">
              <a className={styles.navLink}>Rechtliche Einschätzung</a>
            </Link>
            <Link href="/find-lawyer">
              <a className={styles.navLink}>Anwalt finden</a>
            </Link>
            <Link href="/about">
              <a className={styles.navLink}>Über uns</a>
            </Link>
            <div className={styles.authButtons}>
              <Link href="/login">
                <a className={styles.loginButton}>Anmelden</a>
              </Link>
              <Link href="/register">
                <a className={styles.registerButton}>Registrieren</a>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerGrid}>
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>lawmaster24.com</h3>
              <p>Ihre KI-gestützte Rechtsassistenz-Plattform für schnelle und fundierte rechtliche Einschätzungen zu einem fairen Preis.</p>
              <div className={styles.socialLinks}>
                <a href="#" className={styles.socialLink} aria-label="Facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className={styles.socialLink} aria-label="Twitter">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#" className={styles.socialLink} aria-label="Instagram">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>Rechtsgebiete</h3>
              <ul className={styles.footerLinks}>
                <li><Link href="/legal-assessment?area=erbrecht"><a>Erbrecht</a></Link></li>
                <li><Link href="/legal-assessment?area=familienrecht"><a>Familienrecht</a></Link></li>
                <li><Link href="/legal-assessment?area=mietrecht"><a>Mietrecht</a></Link></li>
                <li><Link href="/legal-assessment?area=arbeitsrecht"><a>Arbeitsrecht</a></Link></li>
                <li><Link href="/legal-assessment?area=verkehrsrecht"><a>Verkehrsrecht</a></Link></li>
              </ul>
            </div>
            
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>Rechtliches</h3>
              <ul className={styles.footerLinks}>
                <li><Link href="/terms"><a>AGB</a></Link></li>
                <li><Link href="/privacy"><a>Datenschutz</a></Link></li>
                <li><Link href="/imprint"><a>Impressum</a></Link></li>
                <li><Link href="/faq"><a>FAQ</a></Link></li>
              </ul>
            </div>
            
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>Kontakt</h3>
              <address className={styles.contactInfo}>
                <p><i className="fas fa-envelope"></i> info@lawmaster24.com</p>
                <p><i className="fas fa-phone"></i> +49 123 456789</p>
                <p><i className="fas fa-map-marker-alt"></i> Musterstraße 123, 10115 Berlin</p>
              </address>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <div className={styles.copyright}>
              &copy; {new Date().getFullYear()} lawmaster24.com - Alle Rechte vorbehalten
            </div>
            <div className={styles.paymentMethods}>
              <span className={styles.paymentIcon}><i className="fab fa-cc-visa"></i></span>
              <span className={styles.paymentIcon}><i className="fab fa-cc-mastercard"></i></span>
              <span className={styles.paymentIcon}><i className="fab fa-cc-paypal"></i></span>
              <span className={styles.paymentIcon}><i className="fab fa-cc-apple-pay"></i></span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

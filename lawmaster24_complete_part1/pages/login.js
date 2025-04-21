// pages/login.js
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import LoginForm from '../components/LoginForm';
import styles from '../styles/Auth.module.css';

export default function Login() {
  return (
    <Layout title="Anmelden">
      <Head>
        <title>Anmelden - lawmaster24.com</title>
        <meta name="description" content="Melden Sie sich bei lawmaster24.com an, um auf Ihre rechtlichen Einschätzungen zuzugreifen." />
      </Head>

      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Willkommen zurück</h1>
          <p className={styles.authSubtitle}>Melden Sie sich an, um auf Ihre rechtlichen Einschätzungen zuzugreifen.</p>
          
          <LoginForm />
          
          <div className={styles.authFooter}>
            <p>Noch kein Konto? <Link href="/register"><a>Jetzt registrieren</a></Link></p>
            <p><Link href="/forgot-password"><a>Passwort vergessen?</a></Link></p>
          </div>
        </div>
        
        <div className={styles.authInfo}>
          <div className={styles.authInfoContent}>
            <h2>Rechtliche Einschätzung für nur 4,99 €</h2>
            <ul className={styles.benefitsList}>
              <li>
                <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                <span>Detaillierte rechtliche Einschätzung</span>
              </li>
              <li>
                <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                <span>Handlungsempfehlungen</span>
              </li>
              <li>
                <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                <span>Relevante Gesetzesgrundlagen</span>
              </li>
              <li>
                <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                <span>Vorabschreiben (wenn sinnvoll)</span>
              </li>
              <li>
                <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                <span>Anwaltsempfehlung (optional)</span>
              </li>
            </ul>
            
            <div className={styles.testimonial}>
              <p>"Die Plattform ist benutzerfreundlich und die rechtliche Einschätzung war sehr hilfreich für meinen Fall. Klare Empfehlung!"</p>
              <div className={styles.testimonialAuthor}>
                <span className={styles.testimonialName}>- Sandra M., Berlin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// pages/register.js
import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import RegisterForm from '../components/RegisterForm';
import styles from '../styles/Auth.module.css';

export default function Register() {
  return (
    <Layout title="Registrieren">
      <Head>
        <title>Registrieren - lawmaster24.com</title>
        <meta name="description" content="Erstellen Sie ein Konto bei lawmaster24.com und erhalten Sie Ihren ersten Fall kostenlos." />
      </Head>

      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Konto erstellen</h1>
          <p className={styles.authSubtitle}>Registrieren Sie sich und erhalten Sie Ihren ersten Fall kostenlos.</p>
          
          <RegisterForm />
          
          <div className={styles.authFooter}>
            <p>Bereits registriert? <Link href="/login"><a>Hier anmelden</a></Link></p>
          </div>
        </div>
        
        <div className={styles.authInfo}>
          <div className={styles.authInfoContent}>
            <h2>Vorteile Ihrer Registrierung</h2>
            <ul className={styles.benefitsList}>
              <li>
                <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                <span>Ein kostenloser Demo-Fall</span>
              </li>
              <li>
                <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                <span>Speichern Ihrer Fälle und Dokumente</span>
              </li>
              <li>
                <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                <span>Zugang zu allen Rechtsgebieten</span>
              </li>
              <li>
                <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                <span>Anwaltsempfehlungen in Ihrer Nähe</span>
              </li>
              <li>
                <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                <span>Einfache Weiterbearbeitung Ihrer Fälle</span>
              </li>
            </ul>
            
            <div className={styles.testimonial}>
              <p>"lawmaster24.com hat mir bei meinem Mietrechtsfall enorm geholfen. Die rechtliche Einschätzung war präzise und verständlich."</p>
              <div className={styles.testimonialAuthor}>
                <span className={styles.testimonialName}>- Michael K., München</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

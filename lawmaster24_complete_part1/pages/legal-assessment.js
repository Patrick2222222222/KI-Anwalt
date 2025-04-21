// pages/legal-assessment.js
import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import LegalAssessmentForm from '../components/LegalAssessmentForm';
import Card from '../components/Card';
import styles from '../styles/LegalAssessment.module.css';

export default function LegalAssessment() {
  // Get legal area from URL query if available
  const [legalArea, setLegalArea] = useState('');
  
  // In a real implementation, we would use useEffect and router.query
  // to get the legal area from the URL
  
  return (
    <Layout title="Rechtliche Einschätzung">
      <Head>
        <title>Rechtliche Einschätzung - lawmaster24.com</title>
        <meta name="description" content="Erhalten Sie eine fundierte rechtliche Einschätzung zu Ihrem Fall für nur 4,99 €." />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Rechtliche Einschätzung anfordern</h1>
          <p>Beschreiben Sie Ihr rechtliches Anliegen und erhalten Sie eine fundierte Einschätzung für nur 4,99 €.</p>
        </div>
        
        <div className={styles.content}>
          <div className={styles.formSection}>
            <LegalAssessmentForm initialLegalArea={legalArea} />
          </div>
          
          <div className={styles.infoSection}>
            <Card className={styles.infoCard}>
              <h2>So funktioniert's</h2>
              <div className={styles.steps}>
                <div className={styles.step}>
                  <div className={styles.stepNumber}>1</div>
                  <div className={styles.stepContent}>
                    <h3>Fall beschreiben</h3>
                    <p>Beschreiben Sie Ihr rechtliches Anliegen und beantworten Sie einige gezielte Fragen.</p>
                  </div>
                </div>
                
                <div className={styles.step}>
                  <div className={styles.stepNumber}>2</div>
                  <div className={styles.stepContent}>
                    <h3>KI-Analyse</h3>
                    <p>Unsere KI analysiert Ihren Fall und erstellt eine fundierte rechtliche Einschätzung.</p>
                  </div>
                </div>
                
                <div className={styles.step}>
                  <div className={styles.stepNumber}>3</div>
                  <div className={styles.stepContent}>
                    <h3>Ergebnis erhalten</h3>
                    <p>Erhalten Sie Ihre rechtliche Einschätzung und bei Bedarf ein Vorabschreiben.</p>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className={styles.infoCard}>
              <h2>Häufig gestellte Fragen</h2>
              <div className={styles.faq}>
                <div className={styles.faqItem}>
                  <h3>Wie genau ist die rechtliche Einschätzung?</h3>
                  <p>Unsere KI wurde mit tausenden von Rechtsfällen trainiert und liefert eine fundierte Einschätzung basierend auf aktueller Rechtsprechung. Für komplexe Fälle empfehlen wir dennoch die Konsultation eines Anwalts.</p>
                </div>
                
                <div className={styles.faqItem}>
                  <h3>Wie lange dauert die Erstellung?</h3>
                  <p>Die rechtliche Einschätzung wird in der Regel innerhalb weniger Minuten erstellt und steht Ihnen sofort zur Verfügung.</p>
                </div>
                
                <div className={styles.faqItem}>
                  <h3>Kann ich meine Dokumente hochladen?</h3>
                  <p>Ja, Sie können relevante Dokumente hochladen, die bei der Erstellung der rechtlichen Einschätzung berücksichtigt werden.</p>
                </div>
                
                <div className={styles.faqItem}>
                  <h3>Wie sicher sind meine Daten?</h3>
                  <p>Ihre Daten werden verschlüsselt übertragen und gespeichert. Wir halten uns strikt an die DSGVO und geben Ihre Daten nicht an Dritte weiter.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

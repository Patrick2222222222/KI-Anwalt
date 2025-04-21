// pages/payment/checkout.js
import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import PaymentForm from '../../components/PaymentForm';
import PayPalButton from '../../components/PayPalButton';
import stripePromise from '../../config/stripe';
import styles from '../../styles/Checkout.module.css';

export default function Checkout() {
  const router = useRouter();
  const { caseId, paymentId } = router.query;
  
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Fixed price for now
  const amount = 4.99;
  
  useEffect(() => {
    // In a real implementation, we would fetch case details from the API
    // For now, we'll use mock data
    if (caseId) {
      // Simulate API call
      setTimeout(() => {
        setCaseDetails({
          id: caseId,
          title: 'Rechtliche Einschätzung #' + caseId,
          description: 'Ihre rechtliche Einschätzung zu Ihrem Fall',
          legalArea: 'Vertragsrecht',
          createdAt: new Date().toISOString()
        });
        setLoading(false);
      }, 1000);
    }
  }, [caseId]);
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  const handlePaymentSuccess = (paymentResult) => {
    console.log('Payment successful:', paymentResult);
    setPaymentSuccess(true);
    
    // In a real implementation, we would redirect to a success page
    // or show a success message and update the UI
    setTimeout(() => {
      router.push('/dashboard/cases/' + caseId);
    }, 3000);
  };
  
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(error.message);
  };
  
  if (loading) {
    return (
      <Layout title="Zahlung wird verarbeitet">
        <Head>
          <title>Zahlung wird verarbeitet - lawmaster24.com</title>
        </Head>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Ihre Zahlungsinformationen werden geladen...</p>
        </div>
      </Layout>
    );
  }
  
  if (paymentSuccess) {
    return (
      <Layout title="Zahlung erfolgreich">
        <Head>
          <title>Zahlung erfolgreich - lawmaster24.com</title>
        </Head>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>
            <i className="fas fa-check-circle"></i>
          </div>
          <h1>Zahlung erfolgreich!</h1>
          <p>Ihre rechtliche Einschätzung wird jetzt erstellt. Sie werden in Kürze weitergeleitet.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Zahlung">
      <Head>
        <title>Zahlung - lawmaster24.com</title>
        <meta name="description" content="Bezahlen Sie Ihre rechtliche Einschätzung sicher und einfach." />
      </Head>
      
      <div className={styles.container}>
        <h1 className={styles.title}>Zahlung</h1>
        
        <div className={styles.checkoutGrid}>
          <div className={styles.paymentSection}>
            <Card className={styles.paymentCard}>
              <h2>Zahlungsmethode auswählen</h2>
              
              <div className={styles.paymentOptions}>
                <div 
                  className={`${styles.paymentOption} ${paymentMethod === 'stripe' ? styles.paymentOptionActive : ''}`}
                  onClick={() => handlePaymentMethodChange('stripe')}
                >
                  <div className={styles.paymentOptionIcon}>
                    <i className="far fa-credit-card"></i>
                  </div>
                  <div className={styles.paymentOptionLabel}>Kreditkarte</div>
                </div>
                
                <div 
                  className={`${styles.paymentOption} ${paymentMethod === 'paypal' ? styles.paymentOptionActive : ''}`}
                  onClick={() => handlePaymentMethodChange('paypal')}
                >
                  <div className={styles.paymentOptionIcon}>
                    <i className="fab fa-paypal"></i>
                  </div>
                  <div className={styles.paymentOptionLabel}>PayPal</div>
                </div>
              </div>
              
              {paymentMethod === 'stripe' ? (
                <Elements stripe={stripePromise}>
                  <PaymentForm 
                    amount={amount} 
                    caseId={caseId}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              ) : (
                <PayPalButton 
                  amount={amount} 
                  caseId={caseId}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </Card>
          </div>
          
          <div className={styles.summarySection}>
            <Card className={styles.summaryCard}>
              <h2>Zusammenfassung</h2>
              
              {caseDetails && (
                <div className={styles.caseDetails}>
                  <h3>{caseDetails.title}</h3>
                  <p className={styles.caseDescription}>{caseDetails.description}</p>
                  <div className={styles.caseInfo}>
                    <span className={styles.caseInfoLabel}>Rechtsgebiet:</span>
                    <span className={styles.caseInfoValue}>{caseDetails.legalArea}</span>
                  </div>
                </div>
              )}
              
              <div className={styles.paymentSummary}>
                <div className={styles.summaryItem}>
                  <span>Rechtliche Einschätzung</span>
                  <span>{amount.toFixed(2)} €</span>
                </div>
                <div className={styles.summaryItem}>
                  <span>Mehrwertsteuer (19%)</span>
                  <span>{(amount * 0.19).toFixed(2)} €</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span>Gesamtbetrag</span>
                  <span>{(amount * 1.19).toFixed(2)} €</span>
                </div>
              </div>
              
              <div className={styles.securityInfo}>
                <div className={styles.securityItem}>
                  <i className="fas fa-lock"></i>
                  <span>Sichere Zahlungsabwicklung</span>
                </div>
                <div className={styles.securityItem}>
                  <i className="fas fa-shield-alt"></i>
                  <span>Datenschutz nach DSGVO</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

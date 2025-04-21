// components/PayPalButton.js
import React, { useState } from 'react';
import Button from './Button';
import styles from '../styles/PaymentForm.module.css';

const PayPalButton = ({ amount, caseId, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayPalCheckout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create PayPal order on the server
      const response = await fetch('/api/payment/create-paypal-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          caseId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Fehler bei der PayPal-Zahlungsabwicklung');
      }
      
      // In a real implementation, we would redirect to PayPal checkout
      // For now, we'll simulate a successful payment
      
      // Simulate a delay for the payment process
      setTimeout(() => {
        onSuccess({
          id: 'paypal_' + Date.now(),
          status: 'succeeded'
        });
        setLoading(false);
      }, 2000);
      
    } catch (err) {
      setError(err.message);
      onError(err);
      setLoading(false);
    }
  };

  return (
    <div className={styles.paypalButton}>
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      
      <Button 
        onClick={handlePayPalCheckout}
        variant="primary" 
        size="large" 
        fullWidth 
        disabled={loading}
      >
        {loading ? 'Wird bearbeitet...' : 'Mit PayPal bezahlen'}
      </Button>
      
      <div className={styles.securePayment}>
        <i className="fas fa-lock"></i> Sichere Zahlungsabwicklung über PayPal
      </div>
    </div>
  );
};

export default PayPalButton;

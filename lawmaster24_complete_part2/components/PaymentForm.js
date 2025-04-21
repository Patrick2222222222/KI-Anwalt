// components/PaymentForm.js
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from './Button';
import styles from '../styles/PaymentForm.module.css';

const PaymentForm = ({ amount, caseId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create payment intent on the server
      const response = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          caseId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Fehler bei der Zahlungsabwicklung');
      }
      
      // Confirm card payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: 'Kunde', // In a real app, get this from the user
            },
          },
        }
      );
      
      if (stripeError) {
        throw new Error(stripeError.message);
      }
      
      if (paymentIntent.status === 'succeeded') {
        // Payment successful
        onSuccess(paymentIntent);
      } else {
        throw new Error('Zahlung fehlgeschlagen');
      }
    } catch (err) {
      setError(err.message);
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.paymentForm}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Kreditkarte</label>
        <div className={styles.cardElementContainer}>
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#333',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#ff5a5f',
                },
              },
            }}
          />
        </div>
      </div>
      
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}
      
      <div className={styles.formActions}>
        <Button 
          type="submit" 
          variant="primary" 
          size="large" 
          fullWidth 
          disabled={!stripe || loading}
        >
          {loading ? 'Wird bearbeitet...' : `${amount.toFixed(2)} € bezahlen`}
        </Button>
      </div>
      
      <div className={styles.securePayment}>
        <i className="fas fa-lock"></i> Sichere Zahlungsabwicklung
      </div>
    </form>
  );
};

export default PaymentForm;

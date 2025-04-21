// pages/api/payment/create-intent.js
import { buffer } from 'micro';
import Stripe from 'stripe';
import authMiddleware from '../../../middleware/auth';
import Payment from '../../../models/Payment';
import LegalCase from '../../../models/LegalCase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { amount, caseId } = req.body;
    const userId = req.user.id;
    
    if (!amount || !caseId) {
      return res.status(400).json({ message: 'Betrag und Fall-ID sind erforderlich' });
    }
    
    // Get case details
    const legalCase = await LegalCase.getById(caseId);
    
    if (!legalCase) {
      return res.status(404).json({ message: 'Fall nicht gefunden' });
    }
    
    // Check if user owns this case
    if (legalCase.user_id !== userId) {
      return res.status(403).json({ message: 'Zugriff verweigert' });
    }
    
    // Check if case is a demo (free) case
    if (legalCase.is_demo) {
      return res.status(400).json({ message: 'Dieser Fall ist ein kostenloser Demo-Fall' });
    }
    
    // Check if payment already exists for this case
    const existingPayment = await Payment.getByCaseId(caseId);
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({ message: 'Dieser Fall wurde bereits bezahlt' });
    }
    
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // amount in cents
      currency: 'eur',
      metadata: {
        caseId,
        userId
      }
    });
    
    // Create payment record
    const paymentData = {
      user_id: userId,
      case_id: caseId,
      amount: amount / 100, // Convert cents to euros
      currency: 'EUR',
      payment_method: 'stripe',
      payment_id: paymentIntent.id,
      status: 'pending'
    };
    
    const paymentId = await Payment.create(paymentData);
    
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentId
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return res.status(500).json({ message: 'Serverfehler bei der Erstellung des Zahlungsvorgangs' });
  }
}

export default authMiddleware(handler);

// Configure body parser for Stripe webhooks
export const config = {
  api: {
    bodyParser: false,
  },
};

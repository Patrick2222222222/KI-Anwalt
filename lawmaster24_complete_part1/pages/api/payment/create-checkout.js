// pages/api/payment/create-checkout.js
import authMiddleware from '../../../middleware/auth';
import Payment from '../../../models/Payment';
import LegalCase from '../../../models/LegalCase';
import User from '../../../models/User';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { caseId, paymentMethod } = req.body;
    const userId = req.user.id;
    
    if (!caseId) {
      return res.status(400).json({ message: 'Fall-ID ist erforderlich' });
    }
    
    if (!paymentMethod || !['stripe', 'paypal'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Gültige Zahlungsmethode ist erforderlich (stripe oder paypal)' });
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
    
    // Get price from settings (hardcoded for now)
    const price = 4.99;
    
    // Create payment record
    const paymentData = {
      user_id: userId,
      case_id: caseId,
      amount: price,
      currency: 'EUR',
      payment_method: paymentMethod,
      payment_id: 'pending', // Will be updated after payment is processed
      status: 'pending'
    };
    
    const paymentId = await Payment.create(paymentData);
    
    // TODO: Integrate with actual payment providers (Stripe/PayPal)
    // For now, we'll simulate a successful payment
    
    // Return checkout information
    return res.status(200).json({
      message: 'Zahlungsvorgang initiiert',
      paymentId,
      amount: price,
      currency: 'EUR',
      checkoutUrl: `/payment/checkout?paymentId=${paymentId}&method=${paymentMethod}`
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    return res.status(500).json({ message: 'Serverfehler bei der Erstellung des Zahlungsvorgangs' });
  }
}

export default authMiddleware(handler);

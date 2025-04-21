// pages/api/payment/create-paypal-order.js
import authMiddleware from '../../../middleware/auth';
import Payment from '../../../models/Payment';
import LegalCase from '../../../models/LegalCase';

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
    
    // In a real implementation, we would create a PayPal order here
    // For now, we'll simulate creating a PayPal order
    const paypalOrderId = 'PAYPAL-ORDER-' + Date.now();
    
    // Create payment record
    const paymentData = {
      user_id: userId,
      case_id: caseId,
      amount: amount,
      currency: 'EUR',
      payment_method: 'paypal',
      payment_id: paypalOrderId,
      status: 'pending'
    };
    
    const paymentId = await Payment.create(paymentData);
    
    return res.status(200).json({
      orderId: paypalOrderId,
      paymentId,
      // In a real implementation, we would return the PayPal approval URL
      approvalUrl: `/payment/paypal-redirect?orderId=${paypalOrderId}&paymentId=${paymentId}`
    });
  } catch (error) {
    console.error('PayPal order creation error:', error);
    return res.status(500).json({ message: 'Serverfehler bei der Erstellung des PayPal-Zahlungsvorgangs' });
  }
}

export default authMiddleware(handler);

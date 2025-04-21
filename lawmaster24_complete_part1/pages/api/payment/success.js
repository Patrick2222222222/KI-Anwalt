// pages/api/payment/success.js
import authMiddleware from '../../../middleware/auth';
import Payment from '../../../models/Payment';
import LegalCase from '../../../models/LegalCase';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { paymentId, paymentProviderId, status } = req.body;
    const userId = req.user.id;
    
    if (!paymentId) {
      return res.status(400).json({ message: 'Zahlungs-ID ist erforderlich' });
    }
    
    // Get payment details
    const payment = await Payment.getById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Zahlung nicht gefunden' });
    }
    
    // Check if user owns this payment
    if (payment.user_id !== userId) {
      return res.status(403).json({ message: 'Zugriff verweigert' });
    }
    
    // Update payment status
    await Payment.updateStatus(paymentId, 'completed');
    
    // Update payment provider ID if provided
    if (paymentProviderId) {
      await Payment.updatePaymentProviderId(paymentId, paymentProviderId);
    }
    
    // Update case status
    await LegalCase.updateStatus(payment.case_id, 'processing');
    
    // Generate invoice
    const invoiceNumber = `INV-${new Date().getFullYear()}-${paymentId.toString().padStart(6, '0')}`;
    const invoiceDate = new Date().toISOString().split('T')[0];
    const invoicePath = `/invoices/${invoiceNumber}.pdf`;
    
    await Payment.createInvoice({
      payment_id: paymentId,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      invoice_path: invoicePath
    });
    
    // TODO: Generate actual PDF invoice
    
    return res.status(200).json({
      message: 'Zahlung erfolgreich abgeschlossen',
      caseId: payment.case_id,
      invoiceNumber
    });
  } catch (error) {
    console.error('Payment success error:', error);
    return res.status(500).json({ message: 'Serverfehler bei der Verarbeitung der erfolgreichen Zahlung' });
  }
}

export default authMiddleware(handler);

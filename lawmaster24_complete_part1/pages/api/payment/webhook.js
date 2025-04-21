// pages/api/payment/webhook.js
import Payment from '../../../models/Payment';
import LegalCase from '../../../models/LegalCase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // In a real implementation, we would verify the webhook signature
    // from Stripe or PayPal to ensure it's legitimate
    
    const { paymentId, paymentProviderId, status } = req.body;
    
    if (!paymentId || !status) {
      return res.status(400).json({ message: 'Zahlungs-ID und Status sind erforderlich' });
    }
    
    // Update payment status
    await Payment.updateStatus(paymentId, status);
    
    // If payment is completed, update case status
    if (status === 'completed') {
      const payment = await Payment.getById(paymentId);
      if (payment) {
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
      }
    }
    
    return res.status(200).json({ message: 'Webhook erfolgreich verarbeitet' });
  } catch (error) {
    console.error('Payment webhook error:', error);
    return res.status(500).json({ message: 'Serverfehler bei der Verarbeitung des Webhooks' });
  }
}

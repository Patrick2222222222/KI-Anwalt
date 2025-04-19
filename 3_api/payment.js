// API routes for payment processing with extended functionality
const express = require('express');
const router = express.Router();
const Payment = require('../../models/Payment');
const PricingPlan = require('../../models/PricingPlan');
const LegalCase = require('../../models/LegalCase');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @route   POST api/payment/create-checkout
// @desc    Create Stripe checkout session
// @access  Private
router.post('/create-checkout', [
  auth,
  check('case_id', 'Case ID is required').isNumeric(),
  check('plan_id', 'Plan ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { case_id, plan_id } = req.body;

  try {
    // Check if case exists and belongs to user
    const legalCase = await LegalCase.getById(case_id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    if (legalCase.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this case' });
    }
    
    // Check if payment already exists for this case
    const existingPayment = await Payment.getByCaseId(case_id);
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already completed for this case' });
    }
    
    // Get pricing plan
    const plan = await PricingPlan.getById(plan_id);
    if (!plan) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${plan.name} - ${legalCase.title}`,
              description: plan.description
            },
            unit_amount: Math.round(plan.price * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        case_id: case_id.toString(),
        plan_id: plan_id.toString(),
        user_id: req.user.id.toString()
      }
    });
    
    // Create payment record
    const paymentId = await Payment.create({
      user_id: req.user.id,
      case_id,
      pricing_plan_id: plan_id,
      amount: plan.price,
      payment_method: 'stripe',
      status: 'pending',
      session_id: session.id
    });
    
    res.json({ 
      session_id: session.id,
      payment_id: paymentId,
      url: session.url
    });
  } catch (err) {
    console.error('Error in create checkout:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/payment/create-paypal-order
// @desc    Create PayPal order
// @access  Private
router.post('/create-paypal-order', [
  auth,
  check('case_id', 'Case ID is required').isNumeric(),
  check('plan_id', 'Plan ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { case_id, plan_id } = req.body;

  try {
    // Check if case exists and belongs to user
    const legalCase = await LegalCase.getById(case_id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    if (legalCase.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this case' });
    }
    
    // Check if payment already exists for this case
    const existingPayment = await Payment.getByCaseId(case_id);
    if (existingPayment && existingPayment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already completed for this case' });
    }
    
    // Get pricing plan
    const plan = await PricingPlan.getById(plan_id);
    if (!plan) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }
    
    // Create PayPal order (mock implementation)
    // In a real implementation, this would call the PayPal API
    const paypalOrderId = `PAYPAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Create payment record
    const paymentId = await Payment.create({
      user_id: req.user.id,
      case_id,
      pricing_plan_id: plan_id,
      amount: plan.price,
      payment_method: 'paypal',
      status: 'pending',
      session_id: paypalOrderId
    });
    
    res.json({ 
      order_id: paypalOrderId,
      payment_id: paymentId
    });
  } catch (err) {
    console.error('Error in create PayPal order:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/payment/webhook
// @desc    Handle Stripe webhook events
// @access  Public
router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      
      // Update payment status
      const payment = await Payment.getBySessionId(session.id);
      if (payment) {
        await Payment.updateStatus(payment.id, 'completed');
        
        // Generate invoice
        const invoicePath = await Payment.generateInvoice(payment.id);
        
        // Send email notification
        const User = require('../../models/User');
        const EmailTemplate = require('../../models/EmailTemplate');
        const user = await User.getById(payment.user_id);
        
        const emailContent = await EmailTemplate.processTemplate('invoice', {
          name: user.first_name,
          invoice_number: payment.invoice_number,
          amount: payment.amount
        });
        
        // In a real implementation, this would send an actual email with the invoice attached
        console.log(`Invoice email to ${user.email}: ${emailContent.subject} - ${emailContent.body}`);
      }
      break;
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      console.log('Payment failed:', paymentIntent.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  
  res.json({ received: true });
});

// @route   GET api/payment/success
// @desc    Handle successful payment
// @access  Private
router.get('/success', auth, async (req, res) => {
  try {
    const { session_id } = req.query;
    
    // Verify session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Update payment status
    const payment = await Payment.getBySessionId(session_id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this payment' });
    }
    
    await Payment.updateStatus(payment.id, 'completed');
    
    // Get case details
    const legalCase = await LegalCase.getById(payment.case_id);
    
    res.json({
      success: true,
      payment_id: payment.id,
      case_id: payment.case_id,
      case_title: legalCase ? legalCase.title : null
    });
  } catch (err) {
    console.error('Error in payment success:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/payment/invoice/:id
// @desc    Get invoice for payment
// @access  Private
router.get('/invoice/:id', auth, async (req, res) => {
  try {
    const paymentId = req.params.id;
    
    // Get payment
    const payment = await Payment.getById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user is authorized to view this invoice
    if (payment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }
    
    // Check if invoice exists
    if (!payment.invoice_path || !fs.existsSync(payment.invoice_path)) {
      // Generate invoice if it doesn't exist
      const invoicePath = await Payment.generateInvoice(paymentId);
      
      if (!invoicePath) {
        return res.status(500).json({ message: 'Failed to generate invoice' });
      }
      
      payment.invoice_path = invoicePath;
    }
    
    const filename = path.basename(payment.invoice_path);
    
    res.download(payment.invoice_path, filename);
  } catch (err) {
    console.error('Error in get invoice:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

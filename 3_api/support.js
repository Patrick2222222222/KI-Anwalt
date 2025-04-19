// API routes for support ticket system
const express = require('express');
const router = express.Router();
const SupportTicket = require('../../models/SupportTicket');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   POST api/support/create
// @desc    Create a new support ticket
// @access  Private
router.post('/create', [
  auth,
  check('subject', 'Subject is required').not().isEmpty(),
  check('message', 'Message is required').not().isEmpty(),
  check('priority', 'Priority is required').optional().isIn(['low', 'medium', 'high'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { subject, message, priority } = req.body;

  try {
    // Create ticket
    const ticketId = await SupportTicket.create({
      user_id: req.user.id,
      subject,
      message,
      priority: priority || 'medium',
      status: 'open'
    });
    
    // Send email notification to support team
    const EmailTemplate = require('../../models/EmailTemplate');
    const User = require('../../models/User');
    const user = await User.getById(req.user.id);
    
    // In a real implementation, this would send an actual email to the support team
    console.log(`New support ticket notification: Ticket #${ticketId} created by ${user.email}: ${subject}`);
    
    res.status(201).json({ ticket_id: ticketId });
  } catch (err) {
    console.error('Error in create support ticket:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/support/tickets
// @desc    Get user's support tickets
// @access  Private
router.get('/tickets', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await SupportTicket.getByUserId(req.user.id, page, limit);
    
    res.json(result);
  } catch (err) {
    console.error('Error in get user tickets:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/support/ticket/:id
// @desc    Get ticket by ID
// @access  Private
router.get('/ticket/:id', auth, async (req, res) => {
  try {
    const ticketId = req.params.id;
    
    // Get ticket
    const ticket = await SupportTicket.getById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check if user is authorized to view this ticket
    if (ticket.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'support') {
      return res.status(403).json({ message: 'Not authorized to access this ticket' });
    }
    
    // Get ticket responses
    const responses = await SupportTicket.getResponses(ticketId);
    
    res.json({
      ticket,
      responses
    });
  } catch (err) {
    console.error('Error in get ticket:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/support/respond
// @desc    Respond to a support ticket
// @access  Private
router.post('/respond', [
  auth,
  check('ticket_id', 'Ticket ID is required').isNumeric(),
  check('message', 'Message is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { ticket_id, message } = req.body;

  try {
    // Check if ticket exists
    const ticket = await SupportTicket.getById(ticket_id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check if user is authorized to respond to this ticket
    const isStaff = req.user.role === 'admin' || req.user.role === 'support';
    if (ticket.user_id !== req.user.id && !isStaff) {
      return res.status(403).json({ message: 'Not authorized to respond to this ticket' });
    }
    
    // Add response
    const responseId = await SupportTicket.addResponse({
      ticket_id,
      user_id: req.user.id,
      message,
      is_from_staff: isStaff
    });
    
    // Update ticket status if staff responded
    if (isStaff && ticket.status === 'open') {
      await SupportTicket.updateStatus(ticket_id, 'in_progress');
    }
    
    // Send email notification
    const EmailTemplate = require('../../models/EmailTemplate');
    const User = require('../../models/User');
    
    if (isStaff) {
      // Notify ticket creator
      const user = await User.getById(ticket.user_id);
      
      // In a real implementation, this would send an actual email
      console.log(`Support response notification to ${user.email}: Your ticket #${ticket_id} has received a response`);
    } else {
      // Notify support team
      console.log(`New response notification: Ticket #${ticket_id} has a new response from user`);
    }
    
    res.status(201).json({ response_id: responseId });
  } catch (err) {
    console.error('Error in respond to ticket:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/support/close-ticket
// @desc    Close a support ticket
// @access  Private
router.post('/close-ticket', [
  auth,
  check('ticket_id', 'Ticket ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { ticket_id } = req.body;

  try {
    // Check if ticket exists
    const ticket = await SupportTicket.getById(ticket_id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Check if user is authorized to close this ticket
    const isStaff = req.user.role === 'admin' || req.user.role === 'support';
    if (ticket.user_id !== req.user.id && !isStaff) {
      return res.status(403).json({ message: 'Not authorized to close this ticket' });
    }
    
    // Close ticket
    await SupportTicket.updateStatus(ticket_id, 'closed');
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error in close ticket:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/support/all-tickets
// @desc    Get all support tickets (for staff)
// @access  Private/Admin/Support
router.get('/all-tickets', auth, async (req, res) => {
  try {
    // Check if user is staff
    if (req.user.role !== 'admin' && req.user.role !== 'support') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || 'all';
    
    const result = await SupportTicket.getAll(page, limit, status);
    
    res.json(result);
  } catch (err) {
    console.error('Error in get all tickets:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

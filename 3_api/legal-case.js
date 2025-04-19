// API routes for legal case management with extended functionality
const express = require('express');
const router = express.Router();
const LegalCase = require('../../models/LegalCase');
const LegalPrompt = require('../../models/LegalPrompt');
const Document = require('../../models/Document');
const Payment = require('../../models/Payment');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const axios = require('axios');

// @route   POST api/legal-assessment/create
// @desc    Create a new legal case
// @access  Private
router.post('/create', [
  auth,
  check('legal_area_id', 'Legal area is required').isNumeric(),
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { legal_area_id, title, description, is_public, priority } = req.body;

  try {
    // Create case
    const caseId = await LegalCase.create({
      user_id: req.user.id,
      legal_area_id,
      title,
      description,
      is_public: is_public || false,
      priority: priority || 'medium',
      status: 'draft'
    });
    
    res.status(201).json({ case_id: caseId });
  } catch (err) {
    console.error('Error in create case:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/legal-assessment/generate
// @desc    Generate legal assessment using AI
// @access  Private
router.post('/generate', [
  auth,
  check('case_id', 'Case ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { case_id } = req.body;

  try {
    // Check if case exists and belongs to user
    const legalCase = await LegalCase.getById(case_id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    if (legalCase.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this case' });
    }
    
    // Check if payment exists for this case
    const payment = await Payment.getByCaseId(case_id);
    if (!payment || payment.status !== 'completed') {
      return res.status(403).json({ message: 'Payment required for this case' });
    }
    
    // Get legal prompt for this legal area
    const prompt = await LegalPrompt.getPrompt(legalCase.legal_area_id, 'assessment');
    if (!prompt) {
      return res.status(404).json({ message: 'Legal prompt not found for this area' });
    }
    
    // Replace placeholders in prompt
    const promptText = prompt.prompt_text.replace('{{case_description}}', legalCase.description);
    
    // Call OpenAI API
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a legal assistant providing assessments.' },
          { role: 'user', content: promptText }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const assessment = openaiResponse.data.choices[0].message.content;
    
    // Update case with assessment
    await LegalCase.updateAssessment(case_id, assessment);
    
    // Update case status
    await LegalCase.updateStatus(case_id, 'completed');
    
    // Create document for the assessment
    const documentId = await Document.create({
      case_id,
      title: `Legal Assessment: ${legalCase.title}`,
      content: assessment,
      document_type: 'assessment'
    });
    
    // Send email notification
    const User = require('../../models/User');
    const EmailTemplate = require('../../models/EmailTemplate');
    const user = await User.getById(req.user.id);
    
    const emailContent = await EmailTemplate.processTemplate('case_completed', {
      name: user.first_name,
      case_title: legalCase.title
    });
    
    // In a real implementation, this would send an actual email
    console.log(`Case completed email to ${user.email}: ${emailContent.subject} - ${emailContent.body}`);
    
    res.json({ 
      assessment,
      document_id: documentId
    });
  } catch (err) {
    console.error('Error in generate assessment:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/legal-case/:id
// @desc    Get case by ID
// @access  Private/Public (depending on case visibility)
router.get('/:id', async (req, res) => {
  try {
    const caseId = req.params.id;
    const legalCase = await LegalCase.getById(caseId);
    
    if (!legalCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    // Check if user is authorized to view this case
    if (!legalCase.is_public) {
      // If not public, check if user is authenticated and is the owner
      if (!req.user || req.user.id !== legalCase.user_id) {
        return res.status(403).json({ message: 'Not authorized to access this case' });
      }
    }
    
    // Increment view count
    await LegalCase.incrementViewCount(caseId);
    
    // Check if case is liked by current user
    let isLiked = false;
    if (req.user) {
      isLiked = await LegalCase.isLiked(caseId, req.user.id);
    }
    
    // Check if case is saved by current user
    let isSaved = false;
    if (req.user) {
      isSaved = await LegalCase.isSaved(caseId, req.user.id);
    }
    
    // Add like and save status to response
    legalCase.is_liked = isLiked;
    legalCase.is_saved = isSaved;
    
    res.json(legalCase);
  } catch (err) {
    console.error('Error in get case:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/legal-case/like
// @desc    Like a case
// @access  Private
router.post('/like', [
  auth,
  check('case_id', 'Case ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { case_id } = req.body;

  try {
    // Like case
    const isLiked = await LegalCase.likeCase(case_id, req.user.id);
    
    res.json({ success: true, is_liked: isLiked });
  } catch (err) {
    console.error('Error in like case:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/legal-case/unlike
// @desc    Unlike a case
// @access  Private
router.post('/unlike', [
  auth,
  check('case_id', 'Case ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { case_id } = req.body;

  try {
    // Unlike case
    await LegalCase.unlikeCase(case_id, req.user.id);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error in unlike case:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/legal-case/toggle-public
// @desc    Toggle case public status
// @access  Private
router.post('/toggle-public', [
  auth,
  check('case_id', 'Case ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { case_id } = req.body;

  try {
    // Check if case belongs to user
    const legalCase = await LegalCase.getById(case_id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    if (legalCase.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this case' });
    }
    
    // Toggle public status
    const isPublic = !legalCase.is_public;
    await LegalCase.updatePublicStatus(case_id, isPublic);
    
    res.json({ success: true, is_public: isPublic });
  } catch (err) {
    console.error('Error in toggle public status:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/legal-case/public
// @desc    Get public cases
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sort = req.query.sort || 'newest';
    
    const result = await LegalCase.getPublicCases(page, limit, sort);
    
    res.json(result);
  } catch (err) {
    console.error('Error in get public cases:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/legal-case/popular
// @desc    Get popular cases
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const result = await LegalCase.getPopularCases(limit);
    
    res.json(result);
  } catch (err) {
    console.error('Error in get popular cases:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/legal-case/refer-lawyer
// @desc    Refer case to lawyer
// @access  Private
router.post('/refer-lawyer', [
  auth,
  check('case_id', 'Case ID is required').isNumeric(),
  check('partner_id', 'Partner ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { case_id, partner_id } = req.body;

  try {
    // Check if case belongs to user
    const legalCase = await LegalCase.getById(case_id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    if (legalCase.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to refer this case' });
    }
    
    // Check if partner exists
    const PartnerFirm = require('../../models/PartnerFirm');
    const partner = await PartnerFirm.getById(partner_id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner firm not found' });
    }
    
    // Refer case to lawyer
    await LegalCase.referToLawyer(case_id, partner_id);
    
    // Send email notification to partner
    const EmailTemplate = require('../../models/EmailTemplate');
    const User = require('../../models/User');
    const user = await User.getById(req.user.id);
    
    // In a real implementation, this would send an actual email to the partner
    console.log(`Case referral email to ${partner.email}: Case "${legalCase.title}" has been referred to your firm by ${user.first_name} ${user.last_name}`);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error in refer to lawyer:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

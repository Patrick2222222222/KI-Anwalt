// API routes for partner firms and lawyer referrals
const express = require('express');
const router = express.Router();
const PartnerFirm = require('../../models/PartnerFirm');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// @route   GET api/partners
// @desc    Get all partner firms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const legal_area = parseInt(req.query.legal_area) || null;
    
    const result = await PartnerFirm.getAll(page, limit, legal_area);
    
    res.json(result);
  } catch (err) {
    console.error('Error in get partner firms:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/partners/featured
// @desc    Get featured partner firms
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const partners = await PartnerFirm.getFeatured(limit);
    
    res.json({ partners });
  } catch (err) {
    console.error('Error in get featured partners:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/partners/:id
// @desc    Get partner firm by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const partnerId = req.params.id;
    
    // Get partner
    const partner = await PartnerFirm.getById(partnerId);
    if (!partner) {
      return res.status(404).json({ message: 'Partner firm not found' });
    }
    
    // Get specializations
    const specializations = await PartnerFirm.getSpecializations(partnerId);
    
    res.json({
      partner,
      specializations
    });
  } catch (err) {
    console.error('Error in get partner:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/partners/apply
// @desc    Apply to become a partner firm
// @access  Private
router.post('/apply', [
  auth,
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Email is required').isEmail(),
  check('phone', 'Phone is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    name, description, logo_url, website, email, phone, 
    address, city, postal_code, country, specializations 
  } = req.body;

  try {
    // Create partner application
    const partnerId = await PartnerFirm.create({
      name,
      description,
      logo_url,
      website,
      email,
      phone,
      address,
      city,
      postal_code,
      country: country || 'Germany',
      is_verified: false,
      is_featured: false
    });
    
    // Add specializations if provided
    if (specializations && Array.isArray(specializations)) {
      await PartnerFirm.addSpecializations(partnerId, specializations);
    }
    
    // Send email notification to admin
    // In a real implementation, this would send an actual email
    console.log(`New partner application from ${name} (${email})`);
    
    res.status(201).json({ 
      success: true,
      message: 'Your application has been submitted and is pending review'
    });
  } catch (err) {
    console.error('Error in partner application:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/partners/search
// @desc    Search partner firms
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const query = req.query.q || '';
    const legal_area = parseInt(req.query.legal_area) || null;
    const city = req.query.city || null;
    
    const result = await PartnerFirm.search(query, legal_area, city, page, limit);
    
    res.json(result);
  } catch (err) {
    console.error('Error in search partners:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/partners/contact
// @desc    Contact a partner firm
// @access  Private
router.post('/contact', [
  auth,
  check('partner_id', 'Partner ID is required').isNumeric(),
  check('message', 'Message is required').not().isEmpty(),
  check('case_id', 'Case ID is required').optional().isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { partner_id, message, case_id } = req.body;

  try {
    // Check if partner exists
    const partner = await PartnerFirm.getById(partner_id);
    if (!partner) {
      return res.status(404).json({ message: 'Partner firm not found' });
    }
    
    // Get user info
    const User = require('../../models/User');
    const user = await User.getById(req.user.id);
    
    // If case_id is provided, check if it exists and belongs to user
    let caseDetails = null;
    if (case_id) {
      const LegalCase = require('../../models/LegalCase');
      const legalCase = await LegalCase.getById(case_id);
      if (!legalCase) {
        return res.status(404).json({ message: 'Case not found' });
      }
      
      if (legalCase.user_id !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to share this case' });
      }
      
      caseDetails = {
        id: legalCase.id,
        title: legalCase.title,
        description: legalCase.description,
        legal_area_id: legalCase.legal_area_id,
        assessment: legalCase.assessment
      };
    }
    
    // Send email to partner
    // In a real implementation, this would send an actual email
    console.log(`Contact request to ${partner.name} from ${user.email}: ${message}`);
    
    // Record contact request
    await PartnerFirm.recordContactRequest(partner_id, req.user.id, message, case_id);
    
    res.json({ 
      success: true,
      message: 'Your message has been sent to the partner firm'
    });
  } catch (err) {
    console.error('Error in contact partner:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

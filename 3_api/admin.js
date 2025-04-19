// API routes for admin functionality with extended features
const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const LegalCase = require('../../models/LegalCase');
const PricingPlan = require('../../models/PricingPlan');
const CmsContent = require('../../models/CmsContent');
const EmailTemplate = require('../../models/EmailTemplate');
const Seo = require('../../models/Seo');
const Analytics = require('../../models/Analytics');
const LegalPrompt = require('../../models/LegalPrompt');
const PartnerFirm = require('../../models/PartnerFirm');
const Payment = require('../../models/Payment');
const auth = require('../../middleware/auth');
const adminAuth = require('../../middleware/adminAuth');
const { check, validationResult } = require('express-validator');

// All routes in this file use both auth and adminAuth middleware
router.use(auth);
router.use(adminAuth);

// @route   GET api/admin/statistics
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/statistics', async (req, res) => {
  try {
    // Get user statistics
    const userStats = await Analytics.getUserStats();
    
    // Get case statistics
    const caseStats = await Analytics.getCaseStats();
    
    // Get payment statistics
    const paymentStats = await Payment.getStatistics('month');
    
    // Get page view statistics
    const pageViewStats = await Analytics.getPageViewStats('month');
    
    res.json({
      users: userStats,
      cases: caseStats,
      payments: paymentStats,
      page_views: pageViewStats
    });
  } catch (err) {
    console.error('Error in admin statistics:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users with pagination
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    
    const result = await User.getAll(page, limit, search);
    
    // Remove password hashes
    result.users = result.users.map(user => {
      delete user.password_hash;
      return user;
    });
    
    res.json(result);
  } catch (err) {
    console.error('Error in get all users:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/user/:id
// @desc    Update user by ID
// @access  Private/Admin
router.put('/user/:id', [
  check('role', 'Role is required').optional().isIn(['user', 'admin', 'lawyer', 'support']),
  check('account_status', 'Account status is required').optional().isIn(['active', 'suspended', 'inactive'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.params.id;
  const { role, account_status } = req.body;

  try {
    // Check if user exists
    const user = await User.getById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user
    await User.updateByAdmin(userId, {
      role,
      account_status
    });
    
    // Get updated user
    const updatedUser = await User.getById(userId);
    delete updatedUser.password_hash;
    
    res.json({ user: updatedUser });
  } catch (err) {
    console.error('Error in update user:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/pricing-plans
// @desc    Get all pricing plans
// @access  Private/Admin
router.get('/pricing-plans', async (req, res) => {
  try {
    const plans = await PricingPlan.getAll();
    
    res.json({ plans });
  } catch (err) {
    console.error('Error in get pricing plans:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/pricing/create
// @desc    Create a new pricing plan
// @access  Private/Admin
router.post('/pricing/create', [
  check('name', 'Name is required').not().isEmpty(),
  check('price', 'Price is required').isNumeric(),
  check('description', 'Description is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description, price, features, is_active } = req.body;

  try {
    // Create pricing plan
    const planId = await PricingPlan.create({
      name,
      description,
      price,
      features: features ? JSON.stringify(features) : null,
      is_active: is_active !== undefined ? is_active : true
    });
    
    res.status(201).json({ plan_id: planId });
  } catch (err) {
    console.error('Error in create pricing plan:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/pricing/:id
// @desc    Update pricing plan
// @access  Private/Admin
router.put('/pricing/:id', [
  check('name', 'Name is required').optional(),
  check('price', 'Price is required').optional().isNumeric(),
  check('description', 'Description is required').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const planId = req.params.id;
  const { name, description, price, features, is_active } = req.body;

  try {
    // Check if plan exists
    const plan = await PricingPlan.getById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Pricing plan not found' });
    }
    
    // Update plan
    await PricingPlan.update(planId, {
      name,
      description,
      price,
      features: features ? JSON.stringify(features) : undefined,
      is_active
    });
    
    // Get updated plan
    const updatedPlan = await PricingPlan.getById(planId);
    
    res.json({ plan: updatedPlan });
  } catch (err) {
    console.error('Error in update pricing plan:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/cms-content
// @desc    Get all CMS content
// @access  Private/Admin
router.get('/cms-content', async (req, res) => {
  try {
    const section = req.query.section;
    
    let content;
    if (section) {
      content = await CmsContent.getBySection(section);
    } else {
      content = await CmsContent.getAll();
    }
    
    res.json({ content });
  } catch (err) {
    console.error('Error in get CMS content:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/cms/update
// @desc    Update CMS content
// @access  Private/Admin
router.post('/cms/update', [
  check('section', 'Section is required').not().isEmpty(),
  check('key_name', 'Key name is required').not().isEmpty(),
  check('content', 'Content is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { section, key_name, content, content_type } = req.body;

  try {
    // Update or create CMS content
    await CmsContent.upsert(section, key_name, content, content_type);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error in update CMS content:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/email-templates
// @desc    Get all email templates
// @access  Private/Admin
router.get('/email-templates', async (req, res) => {
  try {
    const templates = await EmailTemplate.getAll();
    
    res.json({ templates });
  } catch (err) {
    console.error('Error in get email templates:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/email-template/update
// @desc    Update email template
// @access  Private/Admin
router.post('/email-template/update', [
  check('template_type', 'Template type is required').not().isEmpty(),
  check('subject', 'Subject is required').not().isEmpty(),
  check('body', 'Body is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { template_type, subject, body, is_active } = req.body;

  try {
    // Update or create email template
    await EmailTemplate.upsert({
      template_type,
      subject,
      body,
      is_active
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error in update email template:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/seo-settings
// @desc    Get all SEO settings
// @access  Private/Admin
router.get('/seo-settings', async (req, res) => {
  try {
    const settings = await Seo.getAll();
    
    res.json({ settings });
  } catch (err) {
    console.error('Error in get SEO settings:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/seo/update
// @desc    Update SEO settings
// @access  Private/Admin
router.post('/seo/update', [
  check('page_path', 'Page path is required').not().isEmpty(),
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { page_path, title, description, keywords, og_title, og_description, og_image } = req.body;

  try {
    // Update or create SEO settings
    await Seo.upsert({
      page_path,
      title,
      description,
      keywords,
      og_title,
      og_description,
      og_image
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error in update SEO settings:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/legal-prompts
// @desc    Get all legal prompts
// @access  Private/Admin
router.get('/legal-prompts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    
    const result = await LegalPrompt.getAll(page, limit);
    
    res.json(result);
  } catch (err) {
    console.error('Error in get legal prompts:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/legal-prompt/create
// @desc    Create a new legal prompt
// @access  Private/Admin
router.post('/legal-prompt/create', [
  check('legal_area_id', 'Legal area ID is required').isNumeric(),
  check('prompt_type', 'Prompt type is required').isIn(['assessment', 'summary', 'follow_up', 'recommendation']),
  check('prompt_text', 'Prompt text is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { legal_area_id, prompt_type, prompt_text, is_active } = req.body;

  try {
    // Create legal prompt
    const promptId = await LegalPrompt.create({
      legal_area_id,
      prompt_type,
      prompt_text,
      is_active: is_active !== undefined ? is_active : true
    });
    
    res.status(201).json({ prompt_id: promptId });
  } catch (err) {
    console.error('Error in create legal prompt:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/legal-prompt/:id
// @desc    Update legal prompt
// @access  Private/Admin
router.put('/legal-prompt/:id', [
  check('prompt_text', 'Prompt text is required').optional().not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const promptId = req.params.id;
  const { prompt_text, is_active } = req.body;

  try {
    // Check if prompt exists
    const prompt = await LegalPrompt.getById(promptId);
    if (!prompt) {
      return res.status(404).json({ message: 'Legal prompt not found' });
    }
    
    // Update prompt
    await LegalPrompt.update(promptId, {
      prompt_text,
      is_active
    });
    
    // Get updated prompt
    const updatedPrompt = await LegalPrompt.getById(promptId);
    
    res.json({ prompt: updatedPrompt });
  } catch (err) {
    console.error('Error in update legal prompt:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/analytics/report
// @desc    Get analytics report
// @access  Private/Admin
router.get('/analytics/report', async (req, res) => {
  try {
    const period = req.query.period || 'month';
    
    const report = await Analytics.generateReport(period);
    
    res.json(report);
  } catch (err) {
    console.error('Error in get analytics report:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/export-report
// @desc    Export analytics report as CSV
// @access  Private/Admin
router.get('/export-report', async (req, res) => {
  try {
    const period = req.query.period || 'month';
    const reportType = req.query.type || 'users';
    
    let csvData = '';
    
    switch (reportType) {
      case 'users':
        const userStats = await Analytics.getUserStats();
        csvData = 'Month,New Users\n';
        userStats.new_users_by_month.forEach(item => {
          csvData += `${item.month},${item.count}\n`;
        });
        break;
      case 'cases':
        const caseStats = await Analytics.getCaseStats();
        csvData = 'Month,New Cases\n';
        caseStats.cases_by_month.forEach(item => {
          csvData += `${item.month},${item.count}\n`;
        });
        break;
      case 'payments':
        const paymentStats = await Payment.getStatistics(period);
        csvData = 'Month,Revenue\n';
        paymentStats.by_period.forEach(item => {
          csvData += `${item.period},${item.amount}\n`;
        });
        break;
      default:
        return res.status(400).json({ message: 'Invalid report type' });
    }
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${reportType}_report_${period}.csv`);
    res.send(csvData);
  } catch (err) {
    console.error('Error in export report:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/partner/create
// @desc    Create a new partner firm
// @access  Private/Admin
router.post('/partner/create', [
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Email is required').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { 
    name, description, logo_url, website, email, phone, 
    address, city, postal_code, country, 
    is_verified, is_featured, specializations 
  } = req.body;

  try {
    // Create partner firm
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
      is_verified: is_verified !== undefined ? is_verified : false,
      is_featured: is_featured !== undefined ? is_featured : false
    });
    
    // Add specializations if provided
    if (specializations && Array.isArray(specializations)) {
      await PartnerFirm.addSpecializations(partnerId, specializations);
    }
    
    res.status(201).json({ partner_id: partnerId });
  } catch (err) {
    console.error('Error in create partner firm:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/admin/payment/generate-invoice
// @desc    Generate invoice for payment
// @access  Private/Admin
router.post('/payment/generate-invoice', [
  check('payment_id', 'Payment ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { payment_id } = req.body;

  try {
    // Check if payment exists
    const payment = await Payment.getById(payment_id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Generate invoice
    const invoicePath = await Payment.generateInvoice(payment_id);
    
    res.json({ 
      success: true, 
      invoice_path: invoicePath 
    });
  } catch (err) {
    console.error('Error in generate invoice:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

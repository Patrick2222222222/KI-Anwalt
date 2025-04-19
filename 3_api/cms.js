// API routes for CMS content management
const express = require('express');
const router = express.Router();
const CmsContent = require('../../models/CmsContent');
const Seo = require('../../models/Seo');

// @route   GET api/cms/:section
// @desc    Get CMS content by section
// @access  Public
router.get('/:section', async (req, res) => {
  try {
    const section = req.params.section;
    
    const content = await CmsContent.getBySection(section);
    
    // Convert array to object with key_name as keys
    const contentObj = {};
    content.forEach(item => {
      contentObj[item.key_name] = item.content;
    });
    
    res.json(contentObj);
  } catch (err) {
    console.error('Error in get CMS content:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/cms/seo/:page_path
// @desc    Get SEO settings for a page
// @access  Public
router.get('/seo/:page_path', async (req, res) => {
  try {
    const pagePath = req.params.page_path;
    
    const seoSettings = await Seo.getByPath(pagePath);
    
    if (!seoSettings) {
      return res.status(404).json({ message: 'SEO settings not found for this page' });
    }
    
    res.json(seoSettings);
  } catch (err) {
    console.error('Error in get SEO settings:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/cms/legal/:key
// @desc    Get legal content (privacy policy, terms, etc.)
// @access  Public
router.get('/legal/:key', async (req, res) => {
  try {
    const key = req.params.key;
    
    const content = await CmsContent.getByKey('legal', key);
    
    if (!content) {
      return res.status(404).json({ message: 'Legal content not found' });
    }
    
    res.json({ content: content.content });
  } catch (err) {
    console.error('Error in get legal content:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/cms/pricing-plans
// @desc    Get all active pricing plans
// @access  Public
router.get('/pricing-plans', async (req, res) => {
  try {
    const PricingPlan = require('../../models/PricingPlan');
    const plans = await PricingPlan.getActive();
    
    res.json({ plans });
  } catch (err) {
    console.error('Error in get pricing plans:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

// API routes for user management with extended functionality
const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
  check('first_name', 'First name is required').not().isEmpty(),
  check('last_name', 'Last name is required').not().isEmpty(),
  check('terms_accepted', 'You must accept the terms and conditions').equals('true')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password, first_name, last_name, terms_accepted } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.getByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const userId = await User.create({
      email,
      password_hash,
      first_name,
      last_name,
      terms_accepted: true,
      terms_accepted_date: new Date()
    });

    // Create JWT token
    const payload = {
      user: {
        id: userId,
        email: email
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error('Error in register:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.account_status !== 'active') {
      return res.status(403).json({ message: 'Account is not active' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await User.updateLastLogin(user.id);

    // Create JWT token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Error in login:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/auth/verify
// @desc    Verify token & get user data
// @access  Private
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive data
    delete user.password_hash;
    
    res.json({ user });
  } catch (err) {
    console.error('Error in verify:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/password-reset-request
// @desc    Request password reset
// @access  Public
router.post('/password-reset-request', [
  check('email', 'Please include a valid email').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Check if user exists
    const user = await User.getByEmail(email);
    if (!user) {
      // Don't reveal that the user doesn't exist
      return res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
    }

    // Generate reset token
    const resetToken = await User.generatePasswordResetToken(user.id);

    // Send email with reset link
    const EmailTemplate = require('../../models/EmailTemplate');
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    const emailContent = await EmailTemplate.processTemplate('password_reset', {
      name: user.first_name,
      reset_link: resetLink
    });

    // In a real implementation, this would send an actual email
    console.log(`Password reset email to ${email}: ${emailContent.subject} - ${emailContent.body}`);

    res.status(200).json({ message: 'If your email is registered, you will receive a password reset link' });
  } catch (err) {
    console.error('Error in password reset request:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/reset-password
// @desc    Reset password with token
// @access  Public
router.post('/reset-password', [
  check('token', 'Token is required').not().isEmpty(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, password } = req.body;

  try {
    // Verify token and get user ID
    const userId = await User.verifyPasswordResetToken(token);
    if (!userId) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Update password
    await User.updatePassword(userId, password_hash);

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (err) {
    console.error('Error in reset password:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/verify-age
// @desc    Verify user age
// @access  Private
router.post('/verify-age', auth, async (req, res) => {
  try {
    // Update age verification status
    await User.updateAgeVerification(req.user.id, true);
    
    res.status(200).json({ message: 'Age verification successful' });
  } catch (err) {
    console.error('Error in age verification:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive data
    delete user.password_hash;
    
    res.json({ user });
  } catch (err) {
    console.error('Error in get profile:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
  auth,
  check('first_name', 'First name is required').optional(),
  check('last_name', 'Last name is required').optional(),
  check('phone', 'Phone number is invalid').optional().isMobilePhone()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { first_name, last_name, phone, newsletter_subscription } = req.body;

  try {
    // Update user profile
    await User.updateProfile(req.user.id, {
      first_name,
      last_name,
      phone,
      newsletter_subscription
    });
    
    // Get updated user data
    const user = await User.getById(req.user.id);
    delete user.password_hash;
    
    res.json({ user });
  } catch (err) {
    console.error('Error in update profile:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/user/save-case
// @desc    Save a case to user's bookmarks
// @access  Private
router.post('/save-case', [
  auth,
  check('case_id', 'Case ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { case_id } = req.body;

  try {
    // Check if case exists
    const LegalCase = require('../../models/LegalCase');
    const caseExists = await LegalCase.exists(case_id);
    if (!caseExists) {
      return res.status(404).json({ message: 'Case not found' });
    }
    
    // Save case
    const isSaved = await LegalCase.saveCase(case_id, req.user.id);
    
    res.json({ success: true, is_saved: isSaved });
  } catch (err) {
    console.error('Error in save case:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/user/unsave-case
// @desc    Remove a case from user's bookmarks
// @access  Private
router.post('/unsave-case', [
  auth,
  check('case_id', 'Case ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { case_id } = req.body;

  try {
    // Unsave case
    const LegalCase = require('../../models/LegalCase');
    await LegalCase.unsaveCase(case_id, req.user.id);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error in unsave case:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/user/saved-cases
// @desc    Get user's saved cases
// @access  Private
router.get('/saved-cases', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const LegalCase = require('../../models/LegalCase');
    const result = await LegalCase.getSavedCases(req.user.id, page, limit);
    
    res.json(result);
  } catch (err) {
    console.error('Error in get saved cases:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/user/cases
// @desc    Get user's cases
// @access  Private
router.get('/cases', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const LegalCase = require('../../models/LegalCase');
    const result = await LegalCase.getByUserId(req.user.id, page, limit);
    
    res.json(result);
  } catch (err) {
    console.error('Error in get user cases:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/user/payments
// @desc    Get user's payment history
// @access  Private
router.get('/payments', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const Payment = require('../../models/Payment');
    const result = await Payment.getByUserId(req.user.id, page, limit);
    
    res.json(result);
  } catch (err) {
    console.error('Error in get user payments:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/user/documents
// @desc    Get user's documents
// @access  Private
router.get('/documents', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const Document = require('../../models/Document');
    const result = await Document.getByUserId(req.user.id, page, limit);
    
    res.json(result);
  } catch (err) {
    console.error('Error in get user documents:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

// API routes for document generation and PDF export
const express = require('express');
const router = express.Router();
const Document = require('../../models/Document');
const LegalCase = require('../../models/LegalCase');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// @route   GET api/document/:id
// @desc    Get document by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Get document
    const document = await Document.getById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user is authorized to view this document
    const legalCase = await LegalCase.getById(document.case_id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Associated case not found' });
    }
    
    if (legalCase.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }
    
    res.json(document);
  } catch (err) {
    console.error('Error in get document:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/document/generate-pdf
// @desc    Generate PDF document
// @access  Private
router.post('/generate-pdf', [
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
    
    if (legalCase.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this case' });
    }
    
    // Check if case has assessment
    if (!legalCase.assessment) {
      return res.status(400).json({ message: 'Case does not have an assessment yet' });
    }
    
    // Generate PDF
    const pdfPath = await Document.generatePdf(case_id);
    
    // Create document record
    const documentId = await Document.create({
      case_id,
      title: `Legal Assessment: ${legalCase.title}`,
      document_type: 'assessment',
      file_path: pdfPath
    });
    
    res.json({ 
      success: true,
      document_id: documentId,
      file_path: pdfPath
    });
  } catch (err) {
    console.error('Error in generate PDF:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/document/download/:id
// @desc    Download document
// @access  Private
router.get('/download/:id', auth, async (req, res) => {
  try {
    const documentId = req.params.id;
    
    // Get document
    const document = await Document.getById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user is authorized to download this document
    const legalCase = await LegalCase.getById(document.case_id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Associated case not found' });
    }
    
    if (legalCase.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }
    
    // Check if file exists
    if (!document.file_path || !fs.existsSync(document.file_path)) {
      return res.status(404).json({ message: 'Document file not found' });
    }
    
    const filename = path.basename(document.file_path);
    
    res.download(document.file_path, filename);
  } catch (err) {
    console.error('Error in download document:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/document/archive
// @desc    Archive a document
// @access  Private
router.post('/archive', [
  auth,
  check('document_id', 'Document ID is required').isNumeric()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { document_id } = req.body;

  try {
    // Check if document exists
    const document = await Document.getById(document_id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if user is authorized to archive this document
    const legalCase = await LegalCase.getById(document.case_id);
    if (!legalCase) {
      return res.status(404).json({ message: 'Associated case not found' });
    }
    
    if (legalCase.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to archive this document' });
    }
    
    // Archive document
    await Document.archive(document_id);
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error in archive document:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

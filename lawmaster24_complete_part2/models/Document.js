// Document model extension
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

class Document {
  // Get document by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT d.*, lc.title as case_title, u.email as user_email
         FROM documents d
         JOIN legal_cases lc ON d.case_id = lc.id
         JOIN users u ON lc.user_id = u.id
         WHERE d.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting document by ID:', error);
      throw error;
    }
  }

  // Create new document
  static async create(documentData) {
    try {
      const { case_id, title, content, document_type, file_path } = documentData;
      const [result] = await pool.query(
        'INSERT INTO documents (case_id, title, content, document_type, file_path) VALUES (?, ?, ?, ?, ?)',
        [case_id, title, content, document_type, file_path]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  }

  // Get documents by case ID
  static async getByCaseId(caseId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM documents WHERE case_id = ? ORDER BY created_at DESC',
        [caseId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting documents by case ID:', error);
      throw error;
    }
  }

  // Generate PDF document
  static async generatePdf(documentId, templatePath, outputDir) {
    try {
      // Get document data
      const document = await this.getById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }
      
      // Ensure output directory exists
      await mkdirAsync(outputDir, { recursive: true });
      
      // Generate PDF filename
      const filename = `document_${documentId}_${Date.now()}.pdf`;
      const outputPath = path.join(outputDir, filename);
      
      // In a real implementation, this would use a PDF generation library
      // For this example, we'll just create a placeholder file
      const pdfContent = `
        Document ID: ${document.id}
        Title: ${document.title}
        Case: ${document.case_title}
        User: ${document.user_email}
        Content: ${document.content}
        Generated: ${new Date().toISOString()}
      `;
      
      await writeFileAsync(outputPath, pdfContent);
      
      // Update document with file path
      await pool.query(
        'UPDATE documents SET file_path = ? WHERE id = ?',
        [outputPath, documentId]
      );
      
      return outputPath;
    } catch (error) {
      console.error('Error generating PDF document:', error);
      throw error;
    }
  }

  // Get all documents with pagination and filtering
  static async getAll(page = 1, limit = 20, filter = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT d.*, lc.title as case_title, u.email as user_email
        FROM documents d
        JOIN legal_cases lc ON d.case_id = lc.id
        JOIN users u ON lc.user_id = u.id
      `;
      const queryParams = [];
      
      // Add filters if provided
      if (Object.keys(filter).length > 0) {
        const filterConditions = [];
        
        if (filter.document_type) {
          filterConditions.push('d.document_type = ?');
          queryParams.push(filter.document_type);
        }
        
        if (filter.case_id) {
          filterConditions.push('d.case_id = ?');
          queryParams.push(filter.case_id);
        }
        
        if (filter.user_id) {
          filterConditions.push('lc.user_id = ?');
          queryParams.push(filter.user_id);
        }
        
        if (filter.search) {
          filterConditions.push('(d.title LIKE ? OR d.content LIKE ? OR lc.title LIKE ?)');
          const searchTerm = `%${filter.search}%`;
          queryParams.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (filterConditions.length > 0) {
          query += ' WHERE ' + filterConditions.join(' AND ');
        }
      }
      
      // Add pagination
      query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      const [rows] = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM documents d
        JOIN legal_cases lc ON d.case_id = lc.id
        JOIN users u ON lc.user_id = u.id
      `;
      
      if (queryParams.length > 2) { // If we have filters
        countQuery += ' WHERE ' + query.split('WHERE')[1].split('ORDER BY')[0];
      }
      
      const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;
      
      return {
        documents: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  }
}

module.exports = Document;

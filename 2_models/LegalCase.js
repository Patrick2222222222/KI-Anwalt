// LegalCase model extension
const { pool } = require('../config/database');

class LegalCase {
  // Get case by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT lc.*, la.name as legal_area_name, u.email as user_email, 
         u.first_name, u.last_name
         FROM legal_cases lc
         JOIN legal_areas la ON lc.legal_area_id = la.id
         JOIN users u ON lc.user_id = u.id
         WHERE lc.id = ?`,
        [id]
      );
      
      if (rows.length === 0) return null;
      
      // Get case questions and answers
      const [qa] = await pool.query(
        'SELECT * FROM case_qa WHERE case_id = ? ORDER BY order_num',
        [id]
      );
      
      // Get case assessment
      const [assessment] = await pool.query(
        'SELECT * FROM legal_assessments WHERE case_id = ? ORDER BY version DESC LIMIT 1',
        [id]
      );
      
      // Get case documents
      const [documents] = await pool.query(
        'SELECT * FROM documents WHERE case_id = ? ORDER BY created_at DESC',
        [id]
      );
      
      // Get case likes count
      const [likesCount] = await pool.query(
        'SELECT COUNT(*) as count FROM case_likes WHERE case_id = ?',
        [id]
      );
      
      // Get lawyer referrals
      const [referrals] = await pool.query(
        `SELECT lr.*, pf.name as partner_name 
         FROM lawyer_referrals lr
         LEFT JOIN partner_firms pf ON lr.partner_id = pf.id
         WHERE lr.case_id = ?
         ORDER BY lr.created_at DESC`,
        [id]
      );
      
      const caseData = rows[0];
      caseData.qa = qa;
      caseData.assessment = assessment.length > 0 ? assessment[0] : null;
      caseData.documents = documents;
      caseData.likes_count = likesCount[0].count;
      caseData.referrals = referrals;
      
      return caseData;
    } catch (error) {
      console.error('Error getting case by ID:', error);
      throw error;
    }
  }

  // Create new case
  static async create(caseData) {
    try {
      const { user_id, legal_area_id, title, description, is_demo, is_public } = caseData;
      const [result] = await pool.query(
        `INSERT INTO legal_cases 
         (user_id, legal_area_id, title, description, status, is_demo, is_public) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [user_id, legal_area_id, title, description, 'draft', is_demo || false, is_public || false]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating case:', error);
      throw error;
    }
  }

  // Update case
  static async update(id, caseData) {
    try {
      const { title, description, status, is_public, priority_level } = caseData;
      const [result] = await pool.query(
        `UPDATE legal_cases SET 
         title = ?, description = ?, status = ?, is_public = ?, priority_level = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [title, description, status, is_public, priority_level, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating case:', error);
      throw error;
    }
  }

  // Add question and answer to case
  static async addQA(caseId, question, answer, orderNum) {
    try {
      const [result] = await pool.query(
        'INSERT INTO case_qa (case_id, question, answer, order_num) VALUES (?, ?, ?, ?)',
        [caseId, question, answer, orderNum]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error adding case Q&A:', error);
      throw error;
    }
  }

  // Add assessment to case
  static async addAssessment(caseId, content, aiModel) {
    try {
      // Get current version
      const [versionResult] = await pool.query(
        'SELECT MAX(version) as max_version FROM legal_assessments WHERE case_id = ?',
        [caseId]
      );
      
      const currentVersion = versionResult[0].max_version || 0;
      const newVersion = currentVersion + 1;
      
      const [result] = await pool.query(
        'INSERT INTO legal_assessments (case_id, content, ai_model, version) VALUES (?, ?, ?, ?)',
        [caseId, content, aiModel, newVersion]
      );
      
      // Update case status
      await pool.query(
        'UPDATE legal_cases SET status = ? WHERE id = ?',
        ['completed', caseId]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error adding case assessment:', error);
      throw error;
    }
  }

  // Get cases by user ID
  static async getByUserId(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const [rows] = await pool.query(
        `SELECT lc.*, la.name as legal_area_name 
         FROM legal_cases lc
         JOIN legal_areas la ON lc.legal_area_id = la.id
         WHERE lc.user_id = ?
         ORDER BY lc.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM legal_cases WHERE user_id = ?',
        [userId]
      );
      
      return {
        cases: rows,
        pagination: {
          total: countResult[0].total,
          page,
          limit,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user cases:', error);
      throw error;
    }
  }

  // Get public cases with pagination and filtering
  static async getPublicCases(page = 1, limit = 10, filter = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT lc.*, la.name as legal_area_name, 
        (SELECT COUNT(*) FROM case_likes WHERE case_id = lc.id) as likes_count
        FROM legal_cases lc
        JOIN legal_areas la ON lc.legal_area_id = la.id
        WHERE lc.is_public = TRUE
      `;
      const queryParams = [];
      
      // Add filters if provided
      if (Object.keys(filter).length > 0) {
        if (filter.legal_area_id) {
          query += ' AND lc.legal_area_id = ?';
          queryParams.push(filter.legal_area_id);
        }
        
        if (filter.search) {
          query += ' AND (lc.title LIKE ? OR lc.description LIKE ?)';
          const searchTerm = `%${filter.search}%`;
          queryParams.push(searchTerm, searchTerm);
        }
      }
      
      // Add sorting
      if (filter.sort === 'popular') {
        query += ' ORDER BY likes_count DESC, lc.created_at DESC';
      } else {
        query += ' ORDER BY lc.created_at DESC';
      }
      
      // Add pagination
      query += ' LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      const [rows] = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM legal_cases lc WHERE lc.is_public = TRUE';
      
      if (queryParams.length > 2) { // If we have filters
        countQuery += ' AND ' + query.split('AND')[1].split('ORDER BY')[0];
      }
      
      const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;
      
      return {
        cases: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting public cases:', error);
      throw error;
    }
  }

  // Like a case
  static async likeCase(caseId, userId = null, ipAddress = null) {
    try {
      // Check if already liked
      let query = 'SELECT 1 FROM case_likes WHERE case_id = ?';
      const queryParams = [caseId];
      
      if (userId) {
        query += ' AND user_id = ?';
        queryParams.push(userId);
      } else if (ipAddress) {
        query += ' AND ip_address = ?';
        queryParams.push(ipAddress);
      } else {
        throw new Error('Either userId or ipAddress must be provided');
      }
      
      const [existing] = await pool.query(query, queryParams);
      
      if (existing.length > 0) {
        return false; // Already liked
      }
      
      // Add like
      const [result] = await pool.query(
        'INSERT INTO case_likes (case_id, user_id, ip_address) VALUES (?, ?, ?)',
        [caseId, userId, ipAddress]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error liking case:', error);
      throw error;
    }
  }

  // Unlike a case
  static async unlikeCase(caseId, userId = null, ipAddress = null) {
    try {
      let query = 'DELETE FROM case_likes WHERE case_id = ?';
      const queryParams = [caseId];
      
      if (userId) {
        query += ' AND user_id = ?';
        queryParams.push(userId);
      } else if (ipAddress) {
        query += ' AND ip_address = ?';
        queryParams.push(ipAddress);
      } else {
        throw new Error('Either userId or ipAddress must be provided');
      }
      
      const [result] = await pool.query(query, queryParams);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error unliking case:', error);
      throw error;
    }
  }

  // Check if case is liked by user or IP
  static async isLiked(caseId, userId = null, ipAddress = null) {
    try {
      let query = 'SELECT 1 FROM case_likes WHERE case_id = ?';
      const queryParams = [caseId];
      
      if (userId) {
        query += ' AND user_id = ?';
        queryParams.push(userId);
      } else if (ipAddress) {
        query += ' AND ip_address = ?';
        queryParams.push(ipAddress);
      } else {
        throw new Error('Either userId or ipAddress must be provided');
      }
      
      const [rows] = await pool.query(query, queryParams);
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking if case is liked:', error);
      throw error;
    }
  }

  // Get likes count for a case
  static async getLikesCount(caseId) {
    try {
      const [result] = await pool.query(
        'SELECT COUNT(*) as count FROM case_likes WHERE case_id = ?',
        [caseId]
      );
      
      return result[0].count;
    } catch (error) {
      console.error('Error getting case likes count:', error);
      throw error;
    }
  }

  // Set case priority level
  static async setPriorityLevel(caseId, priorityLevel) {
    try {
      const validLevels = ['normal', 'express'];
      if (!validLevels.includes(priorityLevel)) {
        throw new Error('Invalid priority level specified');
      }
      
      const [result] = await pool.query(
        'UPDATE legal_cases SET priority_level = ? WHERE id = ?',
        [priorityLevel, caseId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error setting case priority level:', error);
      throw error;
    }
  }

  // Toggle case public status
  static async togglePublic(caseId) {
    try {
      const [result] = await pool.query(
        'UPDATE legal_cases SET is_public = NOT is_public WHERE id = ?',
        [caseId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error toggling case public status:', error);
      throw error;
    }
  }

  // Mark case as forwarded to lawyer
  static async markForwardedToLawyer(caseId) {
    try {
      const [result] = await pool.query(
        'UPDATE legal_cases SET forwarded_to_lawyer = TRUE WHERE id = ?',
        [caseId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking case as forwarded to lawyer:', error);
      throw error;
    }
  }
}

module.exports = LegalCase;

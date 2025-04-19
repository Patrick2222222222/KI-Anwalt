// Extended User model with new roles and functionality
const { pool } = require('../config/database');

class User {
  // Get user by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  // Get user by email
  static async getByEmail(email) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  // Create new user
  static async create(userData) {
    try {
      const { email, password_hash, first_name, last_name, phone, address, role, verification_token } = userData;
      const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, first_name, last_name, phone, address, role, verification_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [email, password_hash, first_name, last_name, phone, address, role || 'user', verification_token]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      const { first_name, last_name, phone, address } = userData;
      const [result] = await pool.query(
        'UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ? WHERE id = ?',
        [first_name, last_name, phone, address, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Verify user
  static async verify(token) {
    try {
      const [result] = await pool.query(
        'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = ?',
        [token]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  // Set password reset token
  static async setResetToken(email, token, expires) {
    try {
      const [result] = await pool.query(
        'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?',
        [token, expires, email]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error setting reset token:', error);
      throw error;
    }
  }

  // Reset password
  static async resetPassword(token, passwordHash) {
    try {
      const [result] = await pool.query(
        'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = ? AND reset_token_expires > NOW()',
        [passwordHash, token]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }

  // Mark free case as used
  static async markFreeCaseUsed(id) {
    try {
      const [result] = await pool.query(
        'UPDATE users SET free_case_used = TRUE WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error marking free case as used:', error);
      throw error;
    }
  }

  // NEW METHODS FOR EXTENSIONS

  // Check if user has specific role
  static async hasRole(userId, role) {
    try {
      const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) return false;
      return rows[0].role === role;
    } catch (error) {
      console.error('Error checking user role:', error);
      throw error;
    }
  }

  // Check if user has moderator or higher privileges
  static async canModerate(userId) {
    try {
      const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) return false;
      const role = rows[0].role;
      return ['admin', 'moderator'].includes(role);
    } catch (error) {
      console.error('Error checking moderation privileges:', error);
      throw error;
    }
  }

  // Check if user has support privileges
  static async canSupportTickets(userId) {
    try {
      const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
      if (rows.length === 0) return false;
      const role = rows[0].role;
      return ['admin', 'support'].includes(role);
    } catch (error) {
      console.error('Error checking support privileges:', error);
      throw error;
    }
  }

  // Update user role
  static async updateRole(userId, newRole) {
    try {
      const validRoles = ['user', 'lawyer', 'admin', 'moderator', 'support'];
      if (!validRoles.includes(newRole)) {
        throw new Error('Invalid role specified');
      }
      
      const [result] = await pool.query(
        'UPDATE users SET role = ? WHERE id = ?',
        [newRole, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  // Get all users with pagination and filtering
  static async getAll(page = 1, limit = 20, filter = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = 'SELECT id, email, first_name, last_name, role, is_verified, created_at FROM users';
      const queryParams = [];
      
      // Add filters if provided
      if (Object.keys(filter).length > 0) {
        const filterConditions = [];
        
        if (filter.role) {
          filterConditions.push('role = ?');
          queryParams.push(filter.role);
        }
        
        if (filter.search) {
          filterConditions.push('(email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)');
          const searchTerm = `%${filter.search}%`;
          queryParams.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (filterConditions.length > 0) {
          query += ' WHERE ' + filterConditions.join(' AND ');
        }
      }
      
      // Add pagination
      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      const [rows] = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM users';
      if (queryParams.length > 2) { // If we have filters
        countQuery = 'SELECT COUNT(*) as total FROM users WHERE ' + 
                     query.split('WHERE')[1].split('ORDER BY')[0];
      }
      
      const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;
      
      return {
        users: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  }

  // Save a case (bookmark)
  static async saveCase(userId, caseId) {
    try {
      const [result] = await pool.query(
        'INSERT IGNORE INTO saved_cases (user_id, case_id) VALUES (?, ?)',
        [userId, caseId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error saving case:', error);
      throw error;
    }
  }

  // Unsave a case (remove bookmark)
  static async unsaveCase(userId, caseId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM saved_cases WHERE user_id = ? AND case_id = ?',
        [userId, caseId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error unsaving case:', error);
      throw error;
    }
  }

  // Get saved cases for a user
  static async getSavedCases(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const [rows] = await pool.query(
        `SELECT lc.* FROM legal_cases lc
         JOIN saved_cases sc ON lc.id = sc.case_id
         WHERE sc.user_id = ?
         ORDER BY sc.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM saved_cases WHERE user_id = ?',
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
      console.error('Error getting saved cases:', error);
      throw error;
    }
  }

  // Check if a case is saved by user
  static async isCaseSaved(userId, caseId) {
    try {
      const [rows] = await pool.query(
        'SELECT 1 FROM saved_cases WHERE user_id = ? AND case_id = ?',
        [userId, caseId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking if case is saved:', error);
      throw error;
    }
  }
}

module.exports = User;

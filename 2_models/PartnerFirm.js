// PartnerFirm model
const { pool } = require('../config/database');

class PartnerFirm {
  // Get all active partner firms
  static async getAllActive() {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM partner_firms WHERE is_active = TRUE ORDER BY name'
      );
      return rows;
    } catch (error) {
      console.error('Error getting active partner firms:', error);
      throw error;
    }
  }

  // Get partner firm by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM partner_firms WHERE id = ?', [id]);
      
      if (rows.length === 0) return null;
      
      // Get specializations for this partner
      const partner = rows[0];
      const [specializations] = await pool.query(
        `SELECT la.* FROM legal_areas la
         JOIN partner_firm_specializations pfs ON la.id = pfs.legal_area_id
         WHERE pfs.partner_id = ?`,
        [id]
      );
      
      partner.specializations = specializations;
      return partner;
    } catch (error) {
      console.error('Error getting partner firm by ID:', error);
      throw error;
    }
  }

  // Create new partner firm
  static async create(firmData) {
    try {
      const { 
        name, description, logo_path, city, postal_code, 
        address, website, email, phone, is_active 
      } = firmData;
      
      const [result] = await pool.query(
        `INSERT INTO partner_firms 
         (name, description, logo_path, city, postal_code, address, website, email, phone, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, description, logo_path, city, postal_code, address, website, email, phone, is_active !== undefined ? is_active : true]
      );
      
      // Add specializations if provided
      if (firmData.specializations && Array.isArray(firmData.specializations) && firmData.specializations.length > 0) {
        const partnerId = result.insertId;
        const values = firmData.specializations.map(legalAreaId => [partnerId, legalAreaId]);
        
        await pool.query(
          'INSERT INTO partner_firm_specializations (partner_id, legal_area_id) VALUES ?',
          [values]
        );
      }
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating partner firm:', error);
      throw error;
    }
  }

  // Update partner firm
  static async update(id, firmData) {
    try {
      const { 
        name, description, logo_path, city, postal_code, 
        address, website, email, phone, is_active 
      } = firmData;
      
      const [result] = await pool.query(
        `UPDATE partner_firms SET 
         name = ?, description = ?, logo_path = ?, city = ?, postal_code = ?, 
         address = ?, website = ?, email = ?, phone = ?, is_active = ? 
         WHERE id = ?`,
        [name, description, logo_path, city, postal_code, address, website, email, phone, is_active, id]
      );
      
      // Update specializations if provided
      if (firmData.specializations && Array.isArray(firmData.specializations)) {
        // Remove existing specializations
        await pool.query('DELETE FROM partner_firm_specializations WHERE partner_id = ?', [id]);
        
        // Add new specializations
        if (firmData.specializations.length > 0) {
          const values = firmData.specializations.map(legalAreaId => [id, legalAreaId]);
          
          await pool.query(
            'INSERT INTO partner_firm_specializations (partner_id, legal_area_id) VALUES ?',
            [values]
          );
        }
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating partner firm:', error);
      throw error;
    }
  }

  // Delete partner firm
  static async delete(id) {
    try {
      // Delete specializations first (due to foreign key constraint)
      await pool.query('DELETE FROM partner_firm_specializations WHERE partner_id = ?', [id]);
      
      // Then delete the partner firm
      const [result] = await pool.query('DELETE FROM partner_firms WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting partner firm:', error);
      throw error;
    }
  }

  // Toggle partner firm active status
  static async toggleActive(id) {
    try {
      const [result] = await pool.query(
        'UPDATE partner_firms SET is_active = NOT is_active WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error toggling partner firm active status:', error);
      throw error;
    }
  }

  // Get all partner firms with pagination and filtering
  static async getAll(page = 1, limit = 20, filter = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM partner_firms';
      const queryParams = [];
      
      // Add filters if provided
      if (Object.keys(filter).length > 0) {
        const filterConditions = [];
        
        if (filter.is_active !== undefined) {
          filterConditions.push('is_active = ?');
          queryParams.push(filter.is_active);
        }
        
        if (filter.city) {
          filterConditions.push('city = ?');
          queryParams.push(filter.city);
        }
        
        if (filter.legal_area_id) {
          query = `SELECT pf.* FROM partner_firms pf
                   JOIN partner_firm_specializations pfs ON pf.id = pfs.partner_id
                   WHERE pfs.legal_area_id = ?`;
          queryParams.push(filter.legal_area_id);
          
          // Add other conditions if they exist
          if (filterConditions.length > 0) {
            query += ' AND ' + filterConditions.join(' AND ');
          }
        } else if (filterConditions.length > 0) {
          query += ' WHERE ' + filterConditions.join(' AND ');
        }
        
        if (filter.search) {
          const searchCondition = '(name LIKE ? OR description LIKE ? OR city LIKE ?)';
          const searchTerm = `%${filter.search}%`;
          
          if (query.includes('WHERE')) {
            query += ' AND ' + searchCondition;
          } else {
            query += ' WHERE ' + searchCondition;
          }
          
          queryParams.push(searchTerm, searchTerm, searchTerm);
        }
      }
      
      // Add pagination
      query += ' ORDER BY name LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      const [rows] = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM partner_firms';
      
      if (filter.legal_area_id) {
        countQuery = `SELECT COUNT(DISTINCT pf.id) as total FROM partner_firms pf
                      JOIN partner_firm_specializations pfs ON pf.id = pfs.partner_id
                      WHERE pfs.legal_area_id = ?`;
        
        // Add other conditions if they exist
        if (queryParams.length > 3) { // If we have more filters than just legal_area_id
          countQuery += ' AND ' + query.split('WHERE')[1].split('ORDER BY')[0].replace('pfs.legal_area_id = ?', '');
        }
      } else if (queryParams.length > 2) { // If we have filters
        countQuery += ' WHERE ' + query.split('WHERE')[1].split('ORDER BY')[0];
      }
      
      const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;
      
      return {
        partners: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting partner firms:', error);
      throw error;
    }
  }

  // Get cities with partner firms
  static async getCities() {
    try {
      const [rows] = await pool.query(
        'SELECT DISTINCT city FROM partner_firms WHERE city IS NOT NULL AND city != "" ORDER BY city'
      );
      return rows.map(row => row.city);
    } catch (error) {
      console.error('Error getting partner firm cities:', error);
      throw error;
    }
  }

  // Create lawyer referral
  static async createReferral(caseId, partnerId, notes) {
    try {
      const [result] = await pool.query(
        'INSERT INTO lawyer_referrals (case_id, partner_id, notes) VALUES (?, ?, ?)',
        [caseId, partnerId, notes]
      );
      
      // Update case status
      await pool.query(
        'UPDATE legal_cases SET forwarded_to_lawyer = TRUE WHERE id = ?',
        [caseId]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating lawyer referral:', error);
      throw error;
    }
  }

  // Update referral status
  static async updateReferralStatus(id, status) {
    try {
      const validStatuses = ['pending', 'sent', 'accepted', 'declined'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status specified');
      }
      
      const [result] = await pool.query(
        'UPDATE lawyer_referrals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating referral status:', error);
      throw error;
    }
  }

  // Get referrals by case ID
  static async getReferralsByCaseId(caseId) {
    try {
      const [rows] = await pool.query(
        `SELECT lr.*, pf.name as partner_name, pf.email as partner_email
         FROM lawyer_referrals lr
         LEFT JOIN partner_firms pf ON lr.partner_id = pf.id
         WHERE lr.case_id = ?
         ORDER BY lr.created_at DESC`,
        [caseId]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting referrals by case ID:', error);
      throw error;
    }
  }
}

module.exports = PartnerFirm;

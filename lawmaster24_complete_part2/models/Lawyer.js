// Lawyer model
const { pool } = require('../config/database');

class Lawyer {
  // Get lawyer profile by user ID
  static async getByUserId(userId) {
    try {
      const [rows] = await pool.query('SELECT * FROM lawyer_profiles WHERE user_id = ?', [userId]);
      return rows[0];
    } catch (error) {
      console.error('Error getting lawyer profile by user ID:', error);
      throw error;
    }
  }

  // Get lawyer profile by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM lawyer_profiles WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error getting lawyer profile by ID:', error);
      throw error;
    }
  }

  // Create lawyer profile
  static async create(profileData) {
    try {
      const { 
        user_id, 
        license_number, 
        firm_name, 
        specialization, 
        experience_years, 
        bio, 
        hourly_rate,
        latitude,
        longitude,
        address,
        city,
        postal_code,
        country
      } = profileData;
      
      const [result] = await pool.query(
        `INSERT INTO lawyer_profiles (
          user_id, license_number, firm_name, specialization, experience_years, 
          bio, hourly_rate, latitude, longitude, address, city, postal_code, country
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id, license_number, firm_name, specialization, experience_years, 
          bio, hourly_rate, latitude, longitude, address, city, postal_code, country
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating lawyer profile:', error);
      throw error;
    }
  }

  // Update lawyer profile
  static async update(id, profileData) {
    try {
      const { 
        firm_name, 
        specialization, 
        experience_years, 
        bio, 
        hourly_rate,
        latitude,
        longitude,
        address,
        city,
        postal_code,
        country
      } = profileData;
      
      const [result] = await pool.query(
        `UPDATE lawyer_profiles SET 
          firm_name = ?, specialization = ?, experience_years = ?, bio = ?, 
          hourly_rate = ?, latitude = ?, longitude = ?, address = ?, 
          city = ?, postal_code = ?, country = ?
        WHERE id = ?`,
        [
          firm_name, specialization, experience_years, bio, hourly_rate,
          latitude, longitude, address, city, postal_code, country, id
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating lawyer profile:', error);
      throw error;
    }
  }

  // Add legal area to lawyer
  static async addLegalArea(lawyerId, legalAreaId) {
    try {
      const [result] = await pool.query(
        'INSERT INTO lawyer_legal_areas (lawyer_id, legal_area_id) VALUES (?, ?)',
        [lawyerId, legalAreaId]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error adding legal area to lawyer:', error);
      throw error;
    }
  }

  // Remove legal area from lawyer
  static async removeLegalArea(lawyerId, legalAreaId) {
    try {
      const [result] = await pool.query(
        'DELETE FROM lawyer_legal_areas WHERE lawyer_id = ? AND legal_area_id = ?',
        [lawyerId, legalAreaId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error removing legal area from lawyer:', error);
      throw error;
    }
  }

  // Get legal areas for lawyer
  static async getLegalAreas(lawyerId) {
    try {
      const [rows] = await pool.query(
        `SELECT la.* FROM legal_areas la
         JOIN lawyer_legal_areas lla ON la.id = lla.legal_area_id
         WHERE lla.lawyer_id = ?`,
        [lawyerId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting legal areas for lawyer:', error);
      throw error;
    }
  }

  // Search lawyers by criteria
  static async search(criteria) {
    try {
      let query = `
        SELECT lp.*, u.first_name, u.last_name, u.email,
        (SELECT AVG(rating) FROM lawyer_ratings WHERE lawyer_id = lp.id) as average_rating
        FROM lawyer_profiles lp
        JOIN users u ON lp.user_id = u.id
        WHERE lp.is_verified = TRUE
      `;
      
      const params = [];
      
      if (criteria.legalAreaId) {
        query += ` AND lp.id IN (
          SELECT lawyer_id FROM lawyer_legal_areas WHERE legal_area_id = ?
        )`;
        params.push(criteria.legalAreaId);
      }
      
      if (criteria.city) {
        query += ` AND lp.city LIKE ?`;
        params.push(`%${criteria.city}%`);
      }
      
      if (criteria.minRating) {
        query += ` HAVING average_rating >= ?`;
        params.push(criteria.minRating);
      }
      
      query += ` ORDER BY average_rating DESC, lp.experience_years DESC`;
      
      if (criteria.limit) {
        query += ` LIMIT ?`;
        params.push(criteria.limit);
      }
      
      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      console.error('Error searching lawyers:', error);
      throw error;
    }
  }
}

module.exports = Lawyer;

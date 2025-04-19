// SEO model
const { pool } = require('../config/database');

class Seo {
  // Get SEO settings for a page
  static async getByPage(pagePath) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM seo_settings WHERE page_path = ?',
        [pagePath]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting SEO settings by page:', error);
      throw error;
    }
  }

  // Get all SEO settings
  static async getAll() {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM seo_settings ORDER BY page_path'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all SEO settings:', error);
      throw error;
    }
  }

  // Create or update SEO settings
  static async upsert(seoData) {
    try {
      const { page_path, title, description, keywords, og_title, og_description, og_image } = seoData;
      
      // Check if settings exist for this page
      const [existing] = await pool.query(
        'SELECT id FROM seo_settings WHERE page_path = ?',
        [page_path]
      );
      
      if (existing.length > 0) {
        // Update existing settings
        const [result] = await pool.query(
          `UPDATE seo_settings SET 
           title = ?, description = ?, keywords = ?, 
           og_title = ?, og_description = ?, og_image = ?,
           updated_at = CURRENT_TIMESTAMP 
           WHERE page_path = ?`,
          [title, description, keywords, og_title, og_description, og_image, page_path]
        );
        return result.affectedRows > 0;
      } else {
        // Create new settings
        const [result] = await pool.query(
          `INSERT INTO seo_settings 
           (page_path, title, description, keywords, og_title, og_description, og_image) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [page_path, title, description, keywords, og_title, og_description, og_image]
        );
        return result.insertId;
      }
    } catch (error) {
      console.error('Error upserting SEO settings:', error);
      throw error;
    }
  }

  // Delete SEO settings
  static async delete(pagePath) {
    try {
      const [result] = await pool.query(
        'DELETE FROM seo_settings WHERE page_path = ?',
        [pagePath]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting SEO settings:', error);
      throw error;
    }
  }
}

module.exports = Seo;

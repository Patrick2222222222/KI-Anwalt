// CmsContent model
const { pool } = require('../config/database');

class CmsContent {
  // Get content by section and key
  static async getContent(section, key) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM cms_content WHERE section = ? AND key_name = ?',
        [section, key]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting CMS content:', error);
      throw error;
    }
  }

  // Get all content for a section
  static async getBySection(section) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM cms_content WHERE section = ? ORDER BY key_name',
        [section]
      );
      return rows;
    } catch (error) {
      console.error('Error getting CMS content by section:', error);
      throw error;
    }
  }

  // Update or create content
  static async upsert(section, key, content, contentType = 'text') {
    try {
      // Check if content exists
      const [existing] = await pool.query(
        'SELECT id FROM cms_content WHERE section = ? AND key_name = ?',
        [section, key]
      );
      
      if (existing.length > 0) {
        // Update existing content
        const [result] = await pool.query(
          'UPDATE cms_content SET content = ?, content_type = ?, updated_at = CURRENT_TIMESTAMP WHERE section = ? AND key_name = ?',
          [content, contentType, section, key]
        );
        return result.affectedRows > 0;
      } else {
        // Create new content
        const [result] = await pool.query(
          'INSERT INTO cms_content (section, key_name, content, content_type) VALUES (?, ?, ?, ?)',
          [section, key, content, contentType]
        );
        return result.insertId;
      }
    } catch (error) {
      console.error('Error upserting CMS content:', error);
      throw error;
    }
  }

  // Delete content
  static async delete(section, key) {
    try {
      const [result] = await pool.query(
        'DELETE FROM cms_content WHERE section = ? AND key_name = ?',
        [section, key]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting CMS content:', error);
      throw error;
    }
  }

  // Get all sections
  static async getAllSections() {
    try {
      const [rows] = await pool.query(
        'SELECT DISTINCT section FROM cms_content ORDER BY section'
      );
      return rows.map(row => row.section);
    } catch (error) {
      console.error('Error getting CMS sections:', error);
      throw error;
    }
  }

  // Get all content with pagination and filtering
  static async getAll(page = 1, limit = 20, filter = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM cms_content';
      const queryParams = [];
      
      // Add filters if provided
      if (Object.keys(filter).length > 0) {
        const filterConditions = [];
        
        if (filter.section) {
          filterConditions.push('section = ?');
          queryParams.push(filter.section);
        }
        
        if (filter.search) {
          filterConditions.push('(key_name LIKE ? OR content LIKE ?)');
          const searchTerm = `%${filter.search}%`;
          queryParams.push(searchTerm, searchTerm);
        }
        
        if (filterConditions.length > 0) {
          query += ' WHERE ' + filterConditions.join(' AND ');
        }
      }
      
      // Add pagination
      query += ' ORDER BY section, key_name LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      const [rows] = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM cms_content';
      if (queryParams.length > 2) { // If we have filters
        countQuery = 'SELECT COUNT(*) as total FROM cms_content WHERE ' + 
                     query.split('WHERE')[1].split('ORDER BY')[0];
      }
      
      const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;
      
      return {
        content: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting CMS content:', error);
      throw error;
    }
  }
}

module.exports = CmsContent;

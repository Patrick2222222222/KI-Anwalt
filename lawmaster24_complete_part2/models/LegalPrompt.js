// LegalPrompt model
const { pool } = require('../config/database');

class LegalPrompt {
  // Get prompt by legal area and type
  static async getPrompt(legalAreaId, promptType) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM legal_prompts WHERE legal_area_id = ? AND prompt_type = ? AND is_active = TRUE',
        [legalAreaId, promptType]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting legal prompt:', error);
      throw error;
    }
  }

  // Get all prompts for a legal area
  static async getByLegalArea(legalAreaId) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM legal_prompts WHERE legal_area_id = ? ORDER BY prompt_type',
        [legalAreaId]
      );
      return rows;
    } catch (error) {
      console.error('Error getting prompts by legal area:', error);
      throw error;
    }
  }

  // Create new prompt
  static async create(promptData) {
    try {
      const { legal_area_id, prompt_type, prompt_text, is_active } = promptData;
      const [result] = await pool.query(
        'INSERT INTO legal_prompts (legal_area_id, prompt_type, prompt_text, is_active) VALUES (?, ?, ?, ?)',
        [legal_area_id, prompt_type, prompt_text, is_active !== undefined ? is_active : true]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating legal prompt:', error);
      throw error;
    }
  }

  // Update prompt
  static async update(id, promptData) {
    try {
      const { prompt_text, is_active } = promptData;
      const [result] = await pool.query(
        'UPDATE legal_prompts SET prompt_text = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [prompt_text, is_active, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating legal prompt:', error);
      throw error;
    }
  }

  // Delete prompt
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM legal_prompts WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting legal prompt:', error);
      throw error;
    }
  }

  // Toggle prompt active status
  static async toggleActive(id) {
    try {
      const [result] = await pool.query(
        'UPDATE legal_prompts SET is_active = NOT is_active WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error toggling prompt active status:', error);
      throw error;
    }
  }

  // Get all prompts with pagination and filtering
  static async getAll(page = 1, limit = 20, filter = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT lp.*, la.name as legal_area_name 
        FROM legal_prompts lp
        JOIN legal_areas la ON lp.legal_area_id = la.id
      `;
      const queryParams = [];
      
      // Add filters if provided
      if (Object.keys(filter).length > 0) {
        const filterConditions = [];
        
        if (filter.legal_area_id) {
          filterConditions.push('lp.legal_area_id = ?');
          queryParams.push(filter.legal_area_id);
        }
        
        if (filter.prompt_type) {
          filterConditions.push('lp.prompt_type = ?');
          queryParams.push(filter.prompt_type);
        }
        
        if (filter.is_active !== undefined) {
          filterConditions.push('lp.is_active = ?');
          queryParams.push(filter.is_active);
        }
        
        if (filter.search) {
          filterConditions.push('(lp.prompt_text LIKE ? OR la.name LIKE ?)');
          const searchTerm = `%${filter.search}%`;
          queryParams.push(searchTerm, searchTerm);
        }
        
        if (filterConditions.length > 0) {
          query += ' WHERE ' + filterConditions.join(' AND ');
        }
      }
      
      // Add pagination
      query += ' ORDER BY la.name, lp.prompt_type LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      const [rows] = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM legal_prompts lp
        JOIN legal_areas la ON lp.legal_area_id = la.id
      `;
      
      if (queryParams.length > 2) { // If we have filters
        countQuery += ' WHERE ' + query.split('WHERE')[1].split('ORDER BY')[0];
      }
      
      const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;
      
      return {
        prompts: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting legal prompts:', error);
      throw error;
    }
  }

  // Import prompts from the provided data
  static async importPrompts(promptsData) {
    try {
      // Get all legal areas
      const [legalAreas] = await pool.query('SELECT id, name FROM legal_areas');
      const legalAreaMap = {};
      
      legalAreas.forEach(area => {
        legalAreaMap[area.name.toLowerCase()] = area.id;
      });
      
      // Process each prompt
      const results = {
        created: 0,
        errors: []
      };
      
      for (const prompt of promptsData) {
        try {
          const legalAreaName = prompt.legalArea.toLowerCase();
          const legalAreaId = legalAreaMap[legalAreaName];
          
          if (!legalAreaId) {
            // Create the legal area if it doesn't exist
            const [newArea] = await pool.query(
              'INSERT INTO legal_areas (name, description) VALUES (?, ?)',
              [prompt.legalArea, `Rechtsfragen zu ${prompt.legalArea}`]
            );
            
            legalAreaMap[legalAreaName] = newArea.insertId;
            
            // Create assessment prompt
            await this.create({
              legal_area_id: newArea.insertId,
              prompt_type: 'assessment',
              prompt_text: prompt.assessmentPrompt
            });
            
            // Create document prompt
            await this.create({
              legal_area_id: newArea.insertId,
              prompt_type: 'document',
              prompt_text: prompt.documentPrompt
            });
            
            results.created += 2;
          } else {
            // Create or update assessment prompt
            const [existingAssessment] = await pool.query(
              'SELECT id FROM legal_prompts WHERE legal_area_id = ? AND prompt_type = ?',
              [legalAreaId, 'assessment']
            );
            
            if (existingAssessment.length > 0) {
              await this.update(existingAssessment[0].id, {
                prompt_text: prompt.assessmentPrompt,
                is_active: true
              });
            } else {
              await this.create({
                legal_area_id: legalAreaId,
                prompt_type: 'assessment',
                prompt_text: prompt.assessmentPrompt
              });
            }
            
            // Create or update document prompt
            const [existingDocument] = await pool.query(
              'SELECT id FROM legal_prompts WHERE legal_area_id = ? AND prompt_type = ?',
              [legalAreaId, 'document']
            );
            
            if (existingDocument.length > 0) {
              await this.update(existingDocument[0].id, {
                prompt_text: prompt.documentPrompt,
                is_active: true
              });
            } else {
              await this.create({
                legal_area_id: legalAreaId,
                prompt_type: 'document',
                prompt_text: prompt.documentPrompt
              });
            }
            
            results.created += 2;
          }
        } catch (error) {
          console.error(`Error importing prompt for ${prompt.legalArea}:`, error);
          results.errors.push({
            legalArea: prompt.legalArea,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error importing prompts:', error);
      throw error;
    }
  }
}

module.exports = LegalPrompt;

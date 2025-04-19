// EmailTemplate model
const { pool } = require('../config/database');

class EmailTemplate {
  // Get template by type
  static async getByType(templateType) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM email_templates WHERE template_type = ?',
        [templateType]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting email template by type:', error);
      throw error;
    }
  }

  // Get all templates
  static async getAll() {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM email_templates ORDER BY template_type'
      );
      return rows;
    } catch (error) {
      console.error('Error getting all email templates:', error);
      throw error;
    }
  }

  // Create or update template
  static async upsert(templateData) {
    try {
      const { template_type, subject, body, is_active } = templateData;
      
      // Check if template exists
      const [existing] = await pool.query(
        'SELECT id FROM email_templates WHERE template_type = ?',
        [template_type]
      );
      
      if (existing.length > 0) {
        // Update existing template
        const [result] = await pool.query(
          'UPDATE email_templates SET subject = ?, body = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE template_type = ?',
          [subject, body, is_active !== undefined ? is_active : true, template_type]
        );
        return result.affectedRows > 0;
      } else {
        // Create new template
        const [result] = await pool.query(
          'INSERT INTO email_templates (template_type, subject, body, is_active) VALUES (?, ?, ?, ?)',
          [template_type, subject, body, is_active !== undefined ? is_active : true]
        );
        return result.insertId;
      }
    } catch (error) {
      console.error('Error upserting email template:', error);
      throw error;
    }
  }

  // Delete template
  static async delete(templateType) {
    try {
      const [result] = await pool.query(
        'DELETE FROM email_templates WHERE template_type = ?',
        [templateType]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting email template:', error);
      throw error;
    }
  }

  // Toggle template active status
  static async toggleActive(templateType) {
    try {
      const [result] = await pool.query(
        'UPDATE email_templates SET is_active = NOT is_active WHERE template_type = ?',
        [templateType]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error toggling email template active status:', error);
      throw error;
    }
  }

  // Process template with variables
  static async processTemplate(templateType, variables) {
    try {
      const template = await this.getByType(templateType);
      if (!template) {
        throw new Error(`Template not found for type: ${templateType}`);
      }
      
      let subject = template.subject;
      let body = template.body;
      
      // Replace variables in subject and body
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        subject = subject.replace(new RegExp(placeholder, 'g'), value);
        body = body.replace(new RegExp(placeholder, 'g'), value);
      }
      
      return {
        subject,
        body
      };
    } catch (error) {
      console.error('Error processing email template:', error);
      throw error;
    }
  }
}

module.exports = EmailTemplate;

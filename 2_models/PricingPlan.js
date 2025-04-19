// PricingPlan model
const { pool } = require('../config/database');

class PricingPlan {
  // Get all active pricing plans
  static async getAllActive() {
    try {
      const [rows] = await pool.query('SELECT * FROM pricing_plans WHERE is_active = TRUE ORDER BY price ASC');
      return rows;
    } catch (error) {
      console.error('Error getting active pricing plans:', error);
      throw error;
    }
  }

  // Get pricing plan by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query('SELECT * FROM pricing_plans WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error getting pricing plan by ID:', error);
      throw error;
    }
  }

  // Create new pricing plan
  static async create(planData) {
    try {
      const { name, description, price, is_active } = planData;
      const [result] = await pool.query(
        'INSERT INTO pricing_plans (name, description, price, is_active) VALUES (?, ?, ?, ?)',
        [name, description, price, is_active !== undefined ? is_active : true]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating pricing plan:', error);
      throw error;
    }
  }

  // Update pricing plan
  static async update(id, planData) {
    try {
      const { name, description, price, is_active } = planData;
      const [result] = await pool.query(
        'UPDATE pricing_plans SET name = ?, description = ?, price = ?, is_active = ? WHERE id = ?',
        [name, description, price, is_active, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating pricing plan:', error);
      throw error;
    }
  }

  // Delete pricing plan
  static async delete(id) {
    try {
      const [result] = await pool.query('DELETE FROM pricing_plans WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      throw error;
    }
  }

  // Toggle pricing plan active status
  static async toggleActive(id) {
    try {
      const [result] = await pool.query(
        'UPDATE pricing_plans SET is_active = NOT is_active WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error toggling pricing plan active status:', error);
      throw error;
    }
  }

  // Get pricing plan by name
  static async getByName(name) {
    try {
      const [rows] = await pool.query('SELECT * FROM pricing_plans WHERE name = ?', [name]);
      return rows[0];
    } catch (error) {
      console.error('Error getting pricing plan by name:', error);
      throw error;
    }
  }
}

module.exports = PricingPlan;

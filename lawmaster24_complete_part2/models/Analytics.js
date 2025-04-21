// Analytics model
const { pool } = require('../config/database');

class Analytics {
  // Record page view
  static async recordPageView(pageData) {
    try {
      const { page_path, user_id, ip_address, user_agent, referrer } = pageData;
      
      const [result] = await pool.query(
        `INSERT INTO page_views 
         (page_path, user_id, ip_address, user_agent, referrer) 
         VALUES (?, ?, ?, ?, ?)`,
        [page_path, user_id, ip_address, user_agent, referrer]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error recording page view:', error);
      throw error;
    }
  }

  // Record user action
  static async recordUserAction(actionData) {
    try {
      const { user_id, action_type, action_details, ip_address } = actionData;
      
      const [result] = await pool.query(
        `INSERT INTO user_actions 
         (user_id, action_type, action_details, ip_address) 
         VALUES (?, ?, ?, ?)`,
        [user_id, action_type, action_details, ip_address]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error recording user action:', error);
      throw error;
    }
  }

  // Get page view statistics
  static async getPageViewStats(period = 'month', limit = 10) {
    try {
      let dateFormat, groupBy;
      
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          groupBy = 'DATE(created_at)';
          break;
        case 'week':
          dateFormat = '%x-W%v'; // ISO year and week
          groupBy = 'YEARWEEK(created_at)';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          groupBy = 'YEAR(created_at), MONTH(created_at)';
          break;
        case 'year':
          dateFormat = '%Y';
          groupBy = 'YEAR(created_at)';
          break;
        default:
          dateFormat = '%Y-%m';
          groupBy = 'YEAR(created_at), MONTH(created_at)';
      }
      
      // Get page views by period
      const [periodStats] = await pool.query(
        `SELECT 
          DATE_FORMAT(created_at, ?) as period,
          COUNT(*) as count
         FROM page_views
         GROUP BY ${groupBy}
         ORDER BY period DESC`,
        [dateFormat]
      );
      
      // Get top pages
      const [topPages] = await pool.query(
        `SELECT 
          page_path,
          COUNT(*) as count
         FROM page_views
         GROUP BY page_path
         ORDER BY count DESC
         LIMIT ?`,
        [limit]
      );
      
      // Get top referrers
      const [topReferrers] = await pool.query(
        `SELECT 
          referrer,
          COUNT(*) as count
         FROM page_views
         WHERE referrer IS NOT NULL AND referrer != ''
         GROUP BY referrer
         ORDER BY count DESC
         LIMIT ?`,
        [limit]
      );
      
      return {
        by_period: periodStats,
        top_pages: topPages,
        top_referrers: topReferrers
      };
    } catch (error) {
      console.error('Error getting page view statistics:', error);
      throw error;
    }
  }

  // Get user action statistics
  static async getUserActionStats(period = 'month', limit = 10) {
    try {
      let dateFormat, groupBy;
      
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          groupBy = 'DATE(created_at)';
          break;
        case 'week':
          dateFormat = '%x-W%v'; // ISO year and week
          groupBy = 'YEARWEEK(created_at)';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          groupBy = 'YEAR(created_at), MONTH(created_at)';
          break;
        case 'year':
          dateFormat = '%Y';
          groupBy = 'YEAR(created_at)';
          break;
        default:
          dateFormat = '%Y-%m';
          groupBy = 'YEAR(created_at), MONTH(created_at)';
      }
      
      // Get actions by period
      const [periodStats] = await pool.query(
        `SELECT 
          DATE_FORMAT(created_at, ?) as period,
          COUNT(*) as count
         FROM user_actions
         GROUP BY ${groupBy}
         ORDER BY period DESC`,
        [dateFormat]
      );
      
      // Get top action types
      const [topActionTypes] = await pool.query(
        `SELECT 
          action_type,
          COUNT(*) as count
         FROM user_actions
         GROUP BY action_type
         ORDER BY count DESC
         LIMIT ?`,
        [limit]
      );
      
      return {
        by_period: periodStats,
        top_action_types: topActionTypes
      };
    } catch (error) {
      console.error('Error getting user action statistics:', error);
      throw error;
    }
  }

  // Get user statistics
  static async getUserStats() {
    try {
      // Get total users
      const [totalUsers] = await pool.query(
        'SELECT COUNT(*) as count FROM users'
      );
      
      // Get new users by month
      const [newUsersByMonth] = await pool.query(
        `SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as count
         FROM users
         GROUP BY YEAR(created_at), MONTH(created_at)
         ORDER BY month DESC
         LIMIT 12`
      );
      
      // Get users by role
      const [usersByRole] = await pool.query(
        `SELECT 
          role,
          COUNT(*) as count
         FROM users
         GROUP BY role
         ORDER BY count DESC`
      );
      
      return {
        total_users: totalUsers[0].count,
        new_users_by_month: newUsersByMonth,
        users_by_role: usersByRole
      };
    } catch (error) {
      console.error('Error getting user statistics:', error);
      throw error;
    }
  }

  // Get case statistics
  static async getCaseStats() {
    try {
      // Get total cases
      const [totalCases] = await pool.query(
        'SELECT COUNT(*) as count FROM legal_cases'
      );
      
      // Get cases by month
      const [casesByMonth] = await pool.query(
        `SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          COUNT(*) as count
         FROM legal_cases
         GROUP BY YEAR(created_at), MONTH(created_at)
         ORDER BY month DESC
         LIMIT 12`
      );
      
      // Get cases by legal area
      const [casesByLegalArea] = await pool.query(
        `SELECT 
          la.name as legal_area,
          COUNT(*) as count
         FROM legal_cases lc
         JOIN legal_areas la ON lc.legal_area_id = la.id
         GROUP BY lc.legal_area_id
         ORDER BY count DESC`
      );
      
      // Get cases by status
      const [casesByStatus] = await pool.query(
        `SELECT 
          status,
          COUNT(*) as count
         FROM legal_cases
         GROUP BY status
         ORDER BY count DESC`
      );
      
      return {
        total_cases: totalCases[0].count,
        cases_by_month: casesByMonth,
        cases_by_legal_area: casesByLegalArea,
        cases_by_status: casesByStatus
      };
    } catch (error) {
      console.error('Error getting case statistics:', error);
      throw error;
    }
  }

  // Generate comprehensive report
  static async generateReport(period = 'month') {
    try {
      const pageViewStats = await this.getPageViewStats(period);
      const userActionStats = await this.getUserActionStats(period);
      const userStats = await this.getUserStats();
      const caseStats = await this.getCaseStats();
      const paymentStats = await require('./Payment').getStatistics(period);
      
      return {
        page_views: pageViewStats,
        user_actions: userActionStats,
        users: userStats,
        cases: caseStats,
        payments: paymentStats,
        generated_at: new Date().toISOString(),
        period: period
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }
}

module.exports = Analytics;

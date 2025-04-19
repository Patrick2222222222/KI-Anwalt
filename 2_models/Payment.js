// Payment model extension
const { pool } = require('../config/database');

class Payment {
  // Get payment by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, u.email as user_email, lc.title as case_title 
         FROM payments p
         JOIN users u ON p.user_id = u.id
         JOIN legal_cases lc ON p.case_id = lc.id
         WHERE p.id = ?`,
        [id]
      );
      
      if (rows.length === 0) return null;
      
      // Get invoice if exists
      const [invoices] = await pool.query(
        'SELECT * FROM invoices WHERE payment_id = ?',
        [id]
      );
      
      const payment = rows[0];
      payment.invoice = invoices.length > 0 ? invoices[0] : null;
      
      return payment;
    } catch (error) {
      console.error('Error getting payment by ID:', error);
      throw error;
    }
  }

  // Create new payment
  static async create(paymentData) {
    try {
      const { 
        user_id, case_id, amount, currency, payment_method, 
        payment_id, status, service_type 
      } = paymentData;
      
      const [result] = await pool.query(
        `INSERT INTO payments 
         (user_id, case_id, amount, currency, payment_method, payment_id, status, service_type) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, case_id, amount, currency || 'EUR', payment_method, payment_id, status || 'pending', service_type]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  // Update payment status
  static async updateStatus(id, status) {
    try {
      const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status specified');
      }
      
      const [result] = await pool.query(
        'UPDATE payments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
      
      // If payment is completed, update case status
      if (status === 'completed') {
        const [paymentData] = await pool.query(
          'SELECT case_id FROM payments WHERE id = ?',
          [id]
        );
        
        if (paymentData.length > 0) {
          await pool.query(
            'UPDATE legal_cases SET status = ? WHERE id = ?',
            ['processing', paymentData[0].case_id]
          );
        }
      }
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Get payments by user ID
  static async getByUserId(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const [rows] = await pool.query(
        `SELECT p.*, lc.title as case_title, i.invoice_number, i.invoice_path
         FROM payments p
         JOIN legal_cases lc ON p.case_id = lc.id
         LEFT JOIN invoices i ON p.invoice_id = i.id
         WHERE p.user_id = ?
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM payments WHERE user_id = ?',
        [userId]
      );
      
      return {
        payments: rows,
        pagination: {
          total: countResult[0].total,
          page,
          limit,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user payments:', error);
      throw error;
    }
  }

  // Get payments by case ID
  static async getByCaseId(caseId) {
    try {
      const [rows] = await pool.query(
        `SELECT p.*, i.invoice_number, i.invoice_path
         FROM payments p
         LEFT JOIN invoices i ON p.invoice_id = i.id
         WHERE p.case_id = ?
         ORDER BY p.created_at DESC`,
        [caseId]
      );
      
      return rows;
    } catch (error) {
      console.error('Error getting case payments:', error);
      throw error;
    }
  }

  // Create invoice for payment
  static async createInvoice(paymentId, invoiceData) {
    try {
      const { invoice_number, invoice_date, invoice_path } = invoiceData;
      
      // Create invoice
      const [result] = await pool.query(
        'INSERT INTO invoices (payment_id, invoice_number, invoice_date, invoice_path) VALUES (?, ?, ?, ?)',
        [paymentId, invoice_number, invoice_date, invoice_path]
      );
      
      // Update payment with invoice ID
      if (result.insertId) {
        await pool.query(
          'UPDATE payments SET invoice_id = ? WHERE id = ?',
          [result.insertId, paymentId]
        );
      }
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Generate invoice number
  static async generateInvoiceNumber() {
    try {
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Get count of invoices for this year
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as count FROM invoices WHERE YEAR(invoice_date) = ?',
        [currentYear]
      );
      
      const count = countResult[0].count + 1;
      
      // Format: LM-YYYY-XXXXX (e.g., LM-2025-00001)
      return `LM-${currentYear}-${count.toString().padStart(5, '0')}`;
    } catch (error) {
      console.error('Error generating invoice number:', error);
      throw error;
    }
  }

  // Get all payments with pagination and filtering
  static async getAll(page = 1, limit = 20, filter = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT p.*, u.email as user_email, lc.title as case_title, 
        i.invoice_number, i.invoice_path
        FROM payments p
        JOIN users u ON p.user_id = u.id
        JOIN legal_cases lc ON p.case_id = lc.id
        LEFT JOIN invoices i ON p.invoice_id = i.id
      `;
      const queryParams = [];
      
      // Add filters if provided
      if (Object.keys(filter).length > 0) {
        const filterConditions = [];
        
        if (filter.status) {
          filterConditions.push('p.status = ?');
          queryParams.push(filter.status);
        }
        
        if (filter.payment_method) {
          filterConditions.push('p.payment_method = ?');
          queryParams.push(filter.payment_method);
        }
        
        if (filter.service_type) {
          filterConditions.push('p.service_type = ?');
          queryParams.push(filter.service_type);
        }
        
        if (filter.start_date) {
          filterConditions.push('p.created_at >= ?');
          queryParams.push(filter.start_date);
        }
        
        if (filter.end_date) {
          filterConditions.push('p.created_at <= ?');
          queryParams.push(filter.end_date);
        }
        
        if (filter.search) {
          filterConditions.push('(u.email LIKE ? OR lc.title LIKE ? OR i.invoice_number LIKE ?)');
          const searchTerm = `%${filter.search}%`;
          queryParams.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (filterConditions.length > 0) {
          query += ' WHERE ' + filterConditions.join(' AND ');
        }
      }
      
      // Add pagination
      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      const [rows] = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM payments p
        JOIN users u ON p.user_id = u.id
        JOIN legal_cases lc ON p.case_id = lc.id
        LEFT JOIN invoices i ON p.invoice_id = i.id
      `;
      
      if (queryParams.length > 2) { // If we have filters
        countQuery += ' WHERE ' + query.split('WHERE')[1].split('ORDER BY')[0];
      }
      
      const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;
      
      return {
        payments: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting payments:', error);
      throw error;
    }
  }

  // Get payment statistics
  static async getStatistics(period = 'month') {
    try {
      let dateFormat, groupBy;
      
      switch (period) {
        case 'day':
          dateFormat = '%Y-%m-%d';
          groupBy = 'DATE(p.created_at)';
          break;
        case 'week':
          dateFormat = '%x-W%v'; // ISO year and week
          groupBy = 'YEARWEEK(p.created_at)';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          groupBy = 'YEAR(p.created_at), MONTH(p.created_at)';
          break;
        case 'year':
          dateFormat = '%Y';
          groupBy = 'YEAR(p.created_at)';
          break;
        default:
          dateFormat = '%Y-%m';
          groupBy = 'YEAR(p.created_at), MONTH(p.created_at)';
      }
      
      // Get payment totals by period
      const [periodTotals] = await pool.query(
        `SELECT 
          DATE_FORMAT(p.created_at, ?) as period,
          COUNT(*) as count,
          SUM(p.amount) as total_amount,
          p.currency
         FROM payments p
         WHERE p.status = 'completed'
         GROUP BY ${groupBy}, p.currency
         ORDER BY period DESC`,
        [dateFormat]
      );
      
      // Get payment totals by service type
      const [serviceTotals] = await pool.query(
        `SELECT 
          p.service_type,
          COUNT(*) as count,
          SUM(p.amount) as total_amount,
          p.currency
         FROM payments p
         WHERE p.status = 'completed'
         GROUP BY p.service_type, p.currency
         ORDER BY total_amount DESC`
      );
      
      // Get payment totals by payment method
      const [methodTotals] = await pool.query(
        `SELECT 
          p.payment_method,
          COUNT(*) as count,
          SUM(p.amount) as total_amount,
          p.currency
         FROM payments p
         WHERE p.status = 'completed'
         GROUP BY p.payment_method, p.currency
         ORDER BY total_amount DESC`
      );
      
      return {
        by_period: periodTotals,
        by_service: serviceTotals,
        by_method: methodTotals
      };
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      throw error;
    }
  }
}

module.exports = Payment;

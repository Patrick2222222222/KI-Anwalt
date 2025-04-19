// SupportTicket model
const { pool } = require('../config/database');

class SupportTicket {
  // Create a new support ticket
  static async create(ticketData) {
    try {
      const { user_id, subject, message } = ticketData;
      const [result] = await pool.query(
        'INSERT INTO support_tickets (user_id, subject, message) VALUES (?, ?, ?)',
        [user_id, subject, message]
      );
      
      // Create initial response (the ticket message itself)
      if (result.insertId) {
        await pool.query(
          'INSERT INTO ticket_responses (ticket_id, user_id, message, is_from_staff) VALUES (?, ?, ?, ?)',
          [result.insertId, user_id, message, false]
        );
      }
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  }

  // Get ticket by ID
  static async getById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT st.*, u.email, u.first_name, u.last_name 
         FROM support_tickets st
         LEFT JOIN users u ON st.user_id = u.id
         WHERE st.id = ?`,
        [id]
      );
      
      if (rows.length === 0) return null;
      
      // Get responses for this ticket
      const ticket = rows[0];
      const [responses] = await pool.query(
        `SELECT tr.*, u.email, u.first_name, u.last_name, u.role
         FROM ticket_responses tr
         LEFT JOIN users u ON tr.user_id = u.id
         WHERE tr.ticket_id = ?
         ORDER BY tr.created_at ASC`,
        [id]
      );
      
      ticket.responses = responses;
      return ticket;
    } catch (error) {
      console.error('Error getting support ticket:', error);
      throw error;
    }
  }

  // Get all tickets with pagination and filtering
  static async getAll(page = 1, limit = 20, filter = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT st.*, u.email, u.first_name, u.last_name 
        FROM support_tickets st
        LEFT JOIN users u ON st.user_id = u.id
      `;
      const queryParams = [];
      
      // Add filters if provided
      if (Object.keys(filter).length > 0) {
        const filterConditions = [];
        
        if (filter.status) {
          filterConditions.push('st.status = ?');
          queryParams.push(filter.status);
        }
        
        if (filter.user_id) {
          filterConditions.push('st.user_id = ?');
          queryParams.push(filter.user_id);
        }
        
        if (filter.search) {
          filterConditions.push('(st.subject LIKE ? OR st.message LIKE ? OR u.email LIKE ?)');
          const searchTerm = `%${filter.search}%`;
          queryParams.push(searchTerm, searchTerm, searchTerm);
        }
        
        if (filterConditions.length > 0) {
          query += ' WHERE ' + filterConditions.join(' AND ');
        }
      }
      
      // Add pagination
      query += ' ORDER BY st.created_at DESC LIMIT ? OFFSET ?';
      queryParams.push(limit, offset);
      
      const [rows] = await pool.query(query, queryParams);
      
      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM support_tickets st';
      if (filter.user_id || filter.status || filter.search) {
        countQuery += ' LEFT JOIN users u ON st.user_id = u.id';
      }
      
      if (queryParams.length > 2) { // If we have filters
        countQuery += ' WHERE ' + query.split('WHERE')[1].split('ORDER BY')[0];
      }
      
      const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
      const total = countResult[0].total;
      
      return {
        tickets: rows,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting support tickets:', error);
      throw error;
    }
  }

  // Add response to ticket
  static async addResponse(ticketId, userId, message, isFromStaff) {
    try {
      const [result] = await pool.query(
        'INSERT INTO ticket_responses (ticket_id, user_id, message, is_from_staff) VALUES (?, ?, ?, ?)',
        [ticketId, userId, message, isFromStaff]
      );
      
      // Update ticket status based on who responded
      let newStatus = isFromStaff ? 'answered' : 'open';
      await pool.query(
        'UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newStatus, ticketId]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error adding response to ticket:', error);
      throw error;
    }
  }

  // Update ticket status
  static async updateStatus(id, status) {
    try {
      const validStatuses = ['open', 'answered', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status specified');
      }
      
      const [result] = await pool.query(
        'UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  // Get tickets by user ID
  static async getByUserId(userId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      
      const [rows] = await pool.query(
        `SELECT * FROM support_tickets 
         WHERE user_id = ?
         ORDER BY updated_at DESC
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );
      
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM support_tickets WHERE user_id = ?',
        [userId]
      );
      
      return {
        tickets: rows,
        pagination: {
          total: countResult[0].total,
          page,
          limit,
          totalPages: Math.ceil(countResult[0].total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user tickets:', error);
      throw error;
    }
  }
}

module.exports = SupportTicket;

// middleware/auth.js
import jwt from 'jsonwebtoken';

export default function authMiddleware(handler) {
  return async (req, res) => {
    try {
      // Check for token in headers
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Zugriff verweigert. Kein Token vorhanden.' });
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Add user data to request
      req.user = decoded;
      
      // Call the original handler
      return handler(req, res);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Ungültiges Token' });
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token abgelaufen' });
      }
      
      console.error('Auth middleware error:', error);
      return res.status(500).json({ message: 'Serverfehler bei der Authentifizierung' });
    }
  };
}

// Middleware for admin authentication
const adminAuth = (req, res, next) => {
  // Check if user is admin
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  
  next();
};

module.exports = adminAuth;

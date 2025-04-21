// pages/api/lawyer/search.js
import authMiddleware from '../../../middleware/auth';
import Lawyer from '../../../models/Lawyer';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { legalArea, location, radius, minRating } = req.query;
    
    // Prepare search criteria
    const searchCriteria = {};
    
    if (legalArea) {
      searchCriteria.legalAreaId = parseInt(legalArea);
    }
    
    if (location) {
      searchCriteria.city = location;
    }
    
    if (minRating) {
      searchCriteria.minRating = parseFloat(minRating);
    }
    
    // Set default limit
    searchCriteria.limit = 20;
    
    // Search for lawyers
    const lawyers = await Lawyer.search(searchCriteria);
    
    return res.status(200).json({
      message: 'Anwälte erfolgreich gefunden',
      lawyers
    });
  } catch (error) {
    console.error('Lawyer search error:', error);
    return res.status(500).json({ message: 'Serverfehler bei der Anwaltssuche' });
  }
}

export default authMiddleware(handler);

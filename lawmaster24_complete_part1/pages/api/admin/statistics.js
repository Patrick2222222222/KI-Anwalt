// pages/api/admin/statistics.js
import authMiddleware from '../../../middleware/auth';

async function handler(req, res) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Zugriff verweigert' });
  }
  
  const { timeRange = 'month' } = req.query;
  
  try {
    // In a real implementation, this data would be fetched from the database
    // For now, we'll use mock data
    
    // Generate labels based on time range
    let labels = [];
    let dataPoints = 0;
    
    switch(timeRange) {
      case 'week':
        labels = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
        dataPoints = 7;
        break;
      case 'month':
        labels = Array.from({length: 30}, (_, i) => (i + 1).toString());
        dataPoints = 30;
        break;
      case 'year':
        labels = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        dataPoints = 12;
        break;
      default:
        labels = Array.from({length: 30}, (_, i) => (i + 1).toString());
        dataPoints = 30;
    }
    
    // Generate random data for revenue
    const revenueData = Array.from({length: dataPoints}, () => Math.floor(Math.random() * 500) + 100);
    
    // Generate data for cases by legal area
    const legalAreas = [
      'Erbrecht', 
      'Familienrecht', 
      'Mietrecht', 
      'Arbeitsrecht', 
      'Vertragsrecht',
      'Verkehrsrecht',
      'Strafrecht',
      'Sozialrecht',
      'Steuerrecht',
      'Internetrecht'
    ];
    
    const casesByLegalAreaData = Array.from({length: legalAreas.length}, () => Math.floor(Math.random() * 50) + 10);
    
    // Generate data for user activity
    const newUsers = Array.from({length: dataPoints}, () => Math.floor(Math.random() * 20) + 1);
    const activeUsers = Array.from({length: dataPoints}, () => Math.floor(Math.random() * 100) + 50);
    const newCases = Array.from({length: dataPoints}, () => Math.floor(Math.random() * 30) + 5);
    
    // Calculate summary statistics
    const totalUsers = 1250;
    const userChange = 12.5;
    const totalCases = 3750;
    const caseChange = 8.2;
    const totalRevenue = revenueData.reduce((sum, val) => sum + val, 0);
    const revenueChange = 15.3;
    const totalLawyers = 85;
    const lawyerChange = 5.7;
    
    const statisticsData = {
      revenue: {
        labels,
        data: revenueData
      },
      casesByLegalArea: {
        labels: legalAreas,
        data: casesByLegalAreaData
      },
      userActivity: {
        labels,
        newUsers,
        activeUsers,
        newCases
      },
      summary: {
        totalUsers,
        userChange,
        totalCases,
        caseChange,
        totalRevenue,
        revenueChange,
        totalLawyers,
        lawyerChange
      }
    };
    
    return res.status(200).json(statisticsData);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({ message: 'Serverfehler beim Laden der Statistiken' });
  }
}

export default authMiddleware(handler);

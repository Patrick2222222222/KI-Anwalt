// pages/api/auth/verify.js
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verifikationstoken fehlt' });
    }

    // Verify user
    const success = await User.verify(token);
    
    if (!success) {
      return res.status(400).json({ message: 'Ungültiges oder abgelaufenes Token' });
    }

    return res.status(200).json({ message: 'E-Mail erfolgreich verifiziert. Sie können sich jetzt anmelden.' });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ message: 'Serverfehler bei der Verifizierung' });
  }
}

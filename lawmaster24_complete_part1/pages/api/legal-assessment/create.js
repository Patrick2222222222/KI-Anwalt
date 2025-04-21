// pages/api/legal-assessment/create.js
import authMiddleware from '../../../middleware/auth';
import LegalCase from '../../../models/LegalCase';
import User from '../../../models/User';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { legalArea, title, description, questions } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!legalArea || !title || !description) {
      return res.status(400).json({ message: 'Alle Pflichtfelder müssen ausgefüllt werden' });
    }

    // Check if user has used their free case
    const user = await User.getById(userId);
    const isDemo = !user.free_case_used;

    // Create legal case
    const caseData = {
      user_id: userId,
      legal_area_id: legalArea,
      title,
      description,
      is_demo: isDemo,
      status: 'submitted'
    };

    const caseId = await LegalCase.create(caseData);

    // Save questions and answers
    if (questions && Object.keys(questions).length > 0) {
      for (const [index, answer] of Object.entries(questions)) {
        await LegalCase.addQuestionAnswer(caseId, `Question ${parseInt(index) + 1}`, answer, parseInt(index));
      }
    }

    // If this was a free case, mark it as used
    if (isDemo) {
      await User.markFreeCaseUsed(userId);
    }

    // TODO: Generate legal assessment using OpenAI API

    return res.status(201).json({
      message: 'Rechtliche Einschätzung wurde angefordert',
      caseId,
      isDemo
    });
  } catch (error) {
    console.error('Legal assessment creation error:', error);
    return res.status(500).json({ message: 'Serverfehler bei der Erstellung der rechtlichen Einschätzung' });
  }
}

export default authMiddleware(handler);

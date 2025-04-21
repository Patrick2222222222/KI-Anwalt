// pages/api/legal-assessment/generate.js
import authMiddleware from '../../../middleware/auth';
import LegalCase from '../../../models/LegalCase';
import { Configuration, OpenAIApi } from 'openai';

// Initialize OpenAI API
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
});
const openai = new OpenAIApi(configuration);

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { caseId } = req.body;
    
    if (!caseId) {
      return res.status(400).json({ message: 'Fall-ID ist erforderlich' });
    }
    
    // Get case details
    const legalCase = await LegalCase.getById(caseId);
    
    if (!legalCase) {
      return res.status(404).json({ message: 'Fall nicht gefunden' });
    }
    
    // Check if user owns this case
    if (legalCase.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Zugriff verweigert' });
    }
    
    // Get questions and answers
    const questionsAnswers = await LegalCase.getQuestionsAnswers(caseId);
    
    // Prepare prompt for OpenAI
    let prompt = `Erstelle eine rechtliche Einschätzung für folgenden Fall:\n\n`;
    prompt += `Titel: ${legalCase.title}\n`;
    prompt += `Beschreibung: ${legalCase.description}\n\n`;
    
    if (questionsAnswers.length > 0) {
      prompt += `Zusätzliche Informationen:\n`;
      questionsAnswers.forEach(qa => {
        prompt += `Frage: ${qa.question}\n`;
        prompt += `Antwort: ${qa.answer}\n\n`;
      });
    }
    
    prompt += `Bitte gib eine detaillierte rechtliche Einschätzung mit Bezug auf die relevanten Gesetze und möglichen Handlungsoptionen.`;
    
    // Call OpenAI API
    const completion = await openai.createCompletion({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      prompt: prompt,
      max_tokens: 2000,
      temperature: 0.7,
    });
    
    const assessment = completion.data.choices[0].text.trim();
    
    // Save assessment to database
    await LegalCase.createAssessment(caseId, assessment, process.env.OPENAI_MODEL || 'gpt-4');
    
    // Update case status
    await LegalCase.updateStatus(caseId, 'completed');
    
    return res.status(200).json({
      message: 'Rechtliche Einschätzung erfolgreich generiert',
      assessment
    });
  } catch (error) {
    console.error('Legal assessment generation error:', error);
    return res.status(500).json({ message: 'Serverfehler bei der Generierung der rechtlichen Einschätzung' });
  }
}

export default authMiddleware(handler);

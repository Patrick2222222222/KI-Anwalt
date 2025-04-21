// pages/api/auth/register.js
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { firstName, lastName, email, password } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Alle Felder müssen ausgefüllt werden' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Passwort muss mindestens 8 Zeichen lang sein' });
    }

    // Check if user already exists
    const existingUser = await User.getByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Ein Benutzer mit dieser E-Mail existiert bereits' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create user
    const userData = {
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      role: 'user',
      verification_token: verificationToken
    };

    const userId = await User.create(userData);

    // TODO: Send verification email

    return res.status(201).json({ 
      message: 'Benutzer erfolgreich registriert. Bitte überprüfen Sie Ihre E-Mail zur Bestätigung.',
      userId
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Serverfehler bei der Registrierung' });
  }
}

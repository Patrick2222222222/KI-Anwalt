-- Database schema extensions for LawMaster24
-- This file contains all the necessary database schema changes to support the new features

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN role ENUM('user', 'admin', 'lawyer', 'support') NOT NULL DEFAULT 'user',
ADD COLUMN age_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN phone VARCHAR(20),
ADD COLUMN profile_image VARCHAR(255),
ADD COLUMN newsletter_subscription BOOLEAN DEFAULT FALSE,
ADD COLUMN last_login DATETIME,
ADD COLUMN account_status ENUM('active', 'suspended', 'inactive') DEFAULT 'active',
ADD COLUMN terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN terms_accepted_date DATETIME;

-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  features JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create cms_content table
CREATE TABLE IF NOT EXISTS cms_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section VARCHAR(50) NOT NULL,
  key_name VARCHAR(100) NOT NULL,
  content TEXT,
  content_type ENUM('text', 'html', 'json', 'image') DEFAULT 'text',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY section_key (section, key_name)
);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create ticket_responses table
CREATE TABLE IF NOT EXISTS ticket_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  is_from_staff BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create partner_firms table
CREATE TABLE IF NOT EXISTS partner_firms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  logo_url VARCHAR(255),
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'Germany',
  is_verified BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create partner_specializations table
CREATE TABLE IF NOT EXISTS partner_specializations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  partner_id INT NOT NULL,
  legal_area_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (partner_id) REFERENCES partner_firms(id) ON DELETE CASCADE,
  FOREIGN KEY (legal_area_id) REFERENCES legal_areas(id) ON DELETE CASCADE,
  UNIQUE KEY partner_legal_area (partner_id, legal_area_id)
);

-- Create legal_prompts table
CREATE TABLE IF NOT EXISTS legal_prompts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  legal_area_id INT NOT NULL,
  prompt_type ENUM('assessment', 'summary', 'follow_up', 'recommendation') NOT NULL,
  prompt_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (legal_area_id) REFERENCES legal_areas(id) ON DELETE CASCADE,
  UNIQUE KEY legal_area_prompt_type (legal_area_id, prompt_type)
);

-- Add new columns to legal_cases table
ALTER TABLE legal_cases
ADD COLUMN is_public BOOLEAN DEFAULT FALSE,
ADD COLUMN priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
ADD COLUMN status ENUM('draft', 'submitted', 'in_progress', 'completed', 'archived') DEFAULT 'draft',
ADD COLUMN likes_count INT DEFAULT 0,
ADD COLUMN views_count INT DEFAULT 0;

-- Create case_likes table
CREATE TABLE IF NOT EXISTS case_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES legal_cases(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY case_user (case_id, user_id)
);

-- Create saved_cases table
CREATE TABLE IF NOT EXISTS saved_cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES legal_cases(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY case_user (case_id, user_id)
);

-- Add new columns to payments table
ALTER TABLE payments
ADD COLUMN invoice_number VARCHAR(50),
ADD COLUMN invoice_date DATE,
ADD COLUMN invoice_path VARCHAR(255),
ADD COLUMN service_type ENUM('legal_assessment', 'lawyer_referral', 'premium_subscription') DEFAULT 'legal_assessment',
ADD COLUMN pricing_plan_id INT,
ADD CONSTRAINT fk_pricing_plan FOREIGN KEY (pricing_plan_id) REFERENCES pricing_plans(id) ON DELETE SET NULL;

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  case_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  document_type ENUM('assessment', 'summary', 'invoice', 'contract', 'other') NOT NULL,
  file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES legal_cases(id) ON DELETE CASCADE
);

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  template_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY template_type (template_type)
);

-- Create seo_settings table
CREATE TABLE IF NOT EXISTS seo_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_path VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  keywords TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY page_path (page_path)
);

-- Create page_views table for analytics
CREATE TABLE IF NOT EXISTS page_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  page_path VARCHAR(255) NOT NULL,
  user_id INT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  referrer VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create user_actions table for analytics
CREATE TABLE IF NOT EXISTS user_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action_type VARCHAR(50) NOT NULL,
  action_details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default pricing plans
INSERT INTO pricing_plans (name, description, price, features) VALUES
('Basis', 'Grundlegende rechtliche Einschätzung für einen Fall', 4.99, '["Rechtliche Ersteinschätzung", "KI-basierte Analyse", "PDF-Export"]'),
('Premium', 'Umfassende rechtliche Beratung mit erweiterten Funktionen', 9.99, '["Rechtliche Ersteinschätzung", "KI-basierte Analyse", "PDF-Export", "Anwaltsempfehlung", "Prioritäts-Support"]'),
('Business', 'Komplettpaket für Unternehmen mit mehreren Fällen', 29.99, '["5 rechtliche Einschätzungen", "KI-basierte Analyse", "PDF-Export", "Anwaltsempfehlung", "Prioritäts-Support", "Telefonische Beratung"]');

-- Insert default email templates
INSERT INTO email_templates (template_type, subject, body) VALUES
('welcome', 'Willkommen bei LawMaster24', 'Hallo {{name}},\n\nwillkommen bei LawMaster24! Wir freuen uns, dass Sie sich für unseren Service entschieden haben.\n\nMit freundlichen Grüßen,\nIhr LawMaster24-Team'),
('password_reset', 'Passwort zurücksetzen', 'Hallo {{name}},\n\nklicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen: {{reset_link}}\n\nMit freundlichen Grüßen,\nIhr LawMaster24-Team'),
('case_completed', 'Ihre rechtliche Einschätzung ist fertig', 'Hallo {{name}},\n\nIhre rechtliche Einschätzung für den Fall "{{case_title}}" ist jetzt verfügbar. Sie können sie in Ihrem Dashboard einsehen.\n\nMit freundlichen Grüßen,\nIhr LawMaster24-Team'),
('invoice', 'Ihre Rechnung von LawMaster24', 'Hallo {{name}},\n\nvielen Dank für Ihren Kauf. Ihre Rechnung finden Sie im Anhang.\n\nRechnungsnummer: {{invoice_number}}\nBetrag: {{amount}} €\n\nMit freundlichen Grüßen,\nIhr LawMaster24-Team');

-- Insert default SEO settings
INSERT INTO seo_settings (page_path, title, description, keywords) VALUES
('/', 'LawMaster24 - Rechtliche Einschätzungen mit KI-Unterstützung', 'Erhalten Sie schnell und einfach eine rechtliche Ersteinschätzung mit Hilfe von künstlicher Intelligenz.', 'rechtliche einschätzung, rechtsberatung, ki, künstliche intelligenz, anwalt'),
('/legal-assessment', 'Rechtliche Einschätzung - LawMaster24', 'Beschreiben Sie Ihren Fall und erhalten Sie eine fundierte rechtliche Einschätzung.', 'rechtliche einschätzung, rechtsberatung, fallanalyse'),
('/find-lawyer', 'Anwalt finden - LawMaster24', 'Finden Sie den passenden Anwalt für Ihren Fall in unserer Datenbank.', 'anwalt finden, rechtsanwalt, anwaltsuche'),
('/forum', 'Rechtsforum - LawMaster24', 'Diskutieren Sie rechtliche Fragen in unserem öffentlichen Forum.', 'rechtsforum, rechtsfragen, diskussion, rechtsberatung');

-- Insert default CMS content
INSERT INTO cms_content (section, key_name, content, content_type) VALUES
('home', 'hero_title', 'Rechtliche Einschätzungen einfach und schnell', 'text'),
('home', 'hero_subtitle', 'Mit KI-Unterstützung zu einer ersten rechtlichen Einschätzung', 'text'),
('home', 'about_title', 'Über LawMaster24', 'text'),
('home', 'about_content', '<p>LawMaster24 bietet Ihnen schnelle und fundierte rechtliche Ersteinschätzungen mit Hilfe modernster KI-Technologie.</p><p>Unser Service ist kein Ersatz für eine anwaltliche Beratung, kann Ihnen aber helfen, Ihre rechtliche Situation besser einzuschätzen.</p>', 'html'),
('footer', 'disclaimer', 'LawMaster24 bietet keine Rechtsberatung im Sinne des Rechtsdienstleistungsgesetzes (RDG). Die Einschätzungen werden durch KI erstellt und ersetzen nicht die Beratung durch einen Rechtsanwalt.', 'text'),
('legal', 'privacy_policy', '<h1>Datenschutzerklärung</h1><p>Hier steht die vollständige Datenschutzerklärung...</p>', 'html'),
('legal', 'terms_of_service', '<h1>Allgemeine Geschäftsbedingungen</h1><p>Hier stehen die vollständigen AGB...</p>', 'html'),
('legal', 'imprint', '<h1>Impressum</h1><p>Hier steht das vollständige Impressum...</p>', 'html');

-- Insert legal prompts for different areas
INSERT INTO legal_prompts (legal_area_id, prompt_type, prompt_text) VALUES
(1, 'assessment', 'Du bist ein Rechtsexperte für Familienrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(2, 'assessment', 'Du bist ein Rechtsexperte für Arbeitsrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(3, 'assessment', 'Du bist ein Rechtsexperte für Mietrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(4, 'assessment', 'Du bist ein Rechtsexperte für Verkehrsrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(5, 'assessment', 'Du bist ein Rechtsexperte für Vertragsrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(6, 'assessment', 'Du bist ein Rechtsexperte für Erbrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(7, 'assessment', 'Du bist ein Rechtsexperte für Strafrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(8, 'assessment', 'Du bist ein Rechtsexperte für Sozialrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(9, 'assessment', 'Du bist ein Rechtsexperte für Steuerrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(10, 'assessment', 'Du bist ein Rechtsexperte für Internetrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(11, 'assessment', 'Du bist ein Rechtsexperte für Urheberrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(12, 'assessment', 'Du bist ein Rechtsexperte für Versicherungsrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(13, 'assessment', 'Du bist ein Rechtsexperte für Reiserecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}'),
(14, 'assessment', 'Du bist ein Rechtsexperte für Datenschutzrecht in Deutschland. Analysiere den folgenden Fall und gib eine erste rechtliche Einschätzung. Berücksichtige dabei relevante Gesetze und Rechtsprechung. Gib am Ende eine klare Handlungsempfehlung. Beachte: Dies ist keine Rechtsberatung, sondern nur eine erste Einschätzung. Fall: {{case_description}}');

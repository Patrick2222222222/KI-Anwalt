-- lawmaster24.com Database Schema

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('user', 'lawyer', 'admin') DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    free_case_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Legal Areas Table
CREATE TABLE legal_areas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lawyer Profiles Table
CREATE TABLE lawyer_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    firm_name VARCHAR(255),
    specialization TEXT,
    experience_years INT,
    bio TEXT,
    hourly_rate DECIMAL(10, 2),
    is_verified BOOLEAN DEFAULT FALSE,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Lawyer Legal Areas (Many-to-Many)
CREATE TABLE lawyer_legal_areas (
    lawyer_id INT NOT NULL,
    legal_area_id INT NOT NULL,
    PRIMARY KEY (lawyer_id, legal_area_id),
    FOREIGN KEY (lawyer_id) REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (legal_area_id) REFERENCES legal_areas(id) ON DELETE CASCADE
);

-- Legal Cases Table
CREATE TABLE legal_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    legal_area_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('draft', 'submitted', 'processing', 'completed', 'assigned_to_lawyer') DEFAULT 'draft',
    is_demo BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (legal_area_id) REFERENCES legal_areas(id)
);

-- Case Questions and Answers
CREATE TABLE case_qa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    order_num INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES legal_cases(id) ON DELETE CASCADE
);

-- Legal Assessments Table
CREATE TABLE legal_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    content TEXT NOT NULL,
    ai_model VARCHAR(50),
    version INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES legal_cases(id) ON DELETE CASCADE
);

-- Documents Table
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INT,
    is_generated BOOLEAN DEFAULT FALSE,
    document_type ENUM('uploaded', 'assessment', 'letter') DEFAULT 'uploaded',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES legal_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Lawyer Assignments
CREATE TABLE lawyer_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    lawyer_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'completed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (case_id) REFERENCES legal_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (lawyer_id) REFERENCES lawyer_profiles(id)
);

-- Lawyer Ratings
CREATE TABLE lawyer_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lawyer_id INT NOT NULL,
    user_id INT NOT NULL,
    case_id INT,
    rating DECIMAL(3, 1) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lawyer_id) REFERENCES lawyer_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (case_id) REFERENCES legal_cases(id),
    UNIQUE KEY (user_id, lawyer_id, case_id)
);

-- Payments Table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    case_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    payment_method ENUM('stripe', 'paypal') NOT NULL,
    payment_id VARCHAR(255) NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (case_id) REFERENCES legal_cases(id)
);

-- Invoices Table
CREATE TABLE invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payment_id INT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    invoice_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- Messages Table
CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    case_id INT,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    FOREIGN KEY (case_id) REFERENCES legal_cases(id) ON DELETE SET NULL
);

-- System Settings
CREATE TABLE settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial legal areas
INSERT INTO legal_areas (name, description) VALUES 
('Erbrecht', 'Rechtsfragen zu Testamenten, Erbschaften und Nachlässen'),
('Familienrecht', 'Rechtsfragen zu Ehe, Scheidung, Sorgerecht und Unterhalt'),
('Mietrecht', 'Rechtsfragen zu Mietverträgen, Mieterhöhungen und Kündigungen'),
('Arbeitsrecht', 'Rechtsfragen zu Arbeitsverträgen, Kündigungen und Arbeitszeugnis'),
('Verkehrsrecht', 'Rechtsfragen zu Verkehrsunfällen, Bußgeldern und Fahrverboten'),
('Vertragsrecht', 'Rechtsfragen zu Verträgen aller Art'),
('Strafrecht', 'Rechtsfragen zu Strafverfahren und Verteidigung'),
('Sozialrecht', 'Rechtsfragen zu Sozialleistungen und Versicherungen');

-- Insert admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified) 
VALUES ('admin@lawmaster24.com', '$2a$12$1234567890123456789012uqUAL7U2hxA5uVpJn0P2wNlEZ4wfLAK', 'Admin', 'User', 'admin', TRUE);

-- Insert system settings
INSERT INTO settings (setting_key, setting_value, description) VALUES
('case_price', '4.99', 'Price per legal case in EUR'),
('free_case_enabled', 'true', 'Whether free demo cases are enabled'),
('openai_model', 'gpt-4', 'OpenAI model to use for legal assessments'),
('max_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)');

// components/RegisterForm.js
import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import Card from './Card';
import styles from '../styles/Form.module.css';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Vorname ist erforderlich';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nachname ist erforderlich';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Ungültige E-Mail-Adresse';
    }
    
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Passwort muss mindestens 8 Zeichen lang sein';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Form is valid, submit data
      console.log('Form submitted:', formData);
      // Here we would call the API to register the user
    }
  };
  
  return (
    <Card title="Registrieren">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <Input
            label="Vorname"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            error={errors.firstName}
            fullWidth={false}
          />
          <Input
            label="Nachname"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            error={errors.lastName}
            fullWidth={false}
          />
        </div>
        
        <Input
          label="E-Mail"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          error={errors.email}
        />
        
        <Input
          label="Passwort"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          error={errors.password}
        />
        
        <Input
          label="Passwort bestätigen"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          error={errors.confirmPassword}
        />
        
        <div className={styles.formActions}>
          <Button type="submit" variant="primary" size="large" fullWidth>
            Registrieren
          </Button>
        </div>
        
        <p className={styles.formInfo}>
          Bereits registriert? <a href="/login">Hier anmelden</a>
        </p>
      </form>
    </Card>
  );
}

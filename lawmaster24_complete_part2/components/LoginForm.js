// components/LoginForm.js
import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import Card from './Card';
import styles from '../styles/Form.module.css';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'E-Mail ist erforderlich';
    }
    
    if (!formData.password) {
      newErrors.password = 'Passwort ist erforderlich';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Form is valid, submit data
      console.log('Login form submitted:', formData);
      // Here we would call the API to authenticate the user
    }
  };
  
  return (
    <Card title="Anmelden">
      <form className={styles.form} onSubmit={handleSubmit}>
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
        
        <div className={styles.formActions}>
          <Button type="submit" variant="primary" size="large" fullWidth>
            Anmelden
          </Button>
        </div>
        
        <p className={styles.formInfo}>
          Noch kein Konto? <a href="/register">Jetzt registrieren</a>
        </p>
        
        <p className={styles.formInfo}>
          <a href="/forgot-password">Passwort vergessen?</a>
        </p>
      </form>
    </Card>
  );
}

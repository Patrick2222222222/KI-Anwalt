// components/LawyerSearchForm.js
import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import Card from './Card';
import styles from '../styles/Form.module.css';

export default function LawyerSearchForm() {
  const [formData, setFormData] = useState({
    legalArea: '',
    location: '',
    radius: '50',
    minRating: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Lawyer search form submitted:', formData);
    // Here we would call the API to search for lawyers
  };
  
  return (
    <Card title="Anwalt finden">
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Rechtsgebiet</label>
          <select 
            className={styles.select}
            name="legalArea"
            value={formData.legalArea}
            onChange={handleChange}
          >
            <option value="">Alle Rechtsgebiete</option>
            <option value="erbrecht">Erbrecht</option>
            <option value="familienrecht">Familienrecht</option>
            <option value="mietrecht">Mietrecht</option>
            <option value="arbeitsrecht">Arbeitsrecht</option>
            <option value="verkehrsrecht">Verkehrsrecht</option>
            <option value="vertragsrecht">Vertragsrecht</option>
            <option value="strafrecht">Strafrecht</option>
            <option value="sozialrecht">Sozialrecht</option>
          </select>
        </div>
        
        <Input
          label="Standort"
          name="location"
          placeholder="Stadt oder Postleitzahl"
          value={formData.location}
          onChange={handleChange}
        />
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Umkreis</label>
          <select 
            className={styles.select}
            name="radius"
            value={formData.radius}
            onChange={handleChange}
          >
            <option value="10">10 km</option>
            <option value="25">25 km</option>
            <option value="50">50 km</option>
            <option value="100">100 km</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Mindestbewertung</label>
          <select 
            className={styles.select}
            name="minRating"
            value={formData.minRating}
            onChange={handleChange}
          >
            <option value="">Alle Bewertungen</option>
            <option value="5">5 Sterne</option>
            <option value="4">4+ Sterne</option>
            <option value="3">3+ Sterne</option>
            <option value="2">2+ Sterne</option>
          </select>
        </div>
        
        <div className={styles.formActions}>
          <Button type="submit" variant="primary" size="large" fullWidth>
            Anwälte suchen
          </Button>
        </div>
      </form>
    </Card>
  );
}

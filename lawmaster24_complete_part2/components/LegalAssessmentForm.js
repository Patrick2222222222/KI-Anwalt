// components/LegalAssessmentForm.js
import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import Card from './Card';
import styles from '../styles/Form.module.css';

export default function LegalAssessmentForm() {
  const [step, setStep] = useState(1);
  const [legalArea, setLegalArea] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: {}
  });
  
  // Sample questions for different legal areas
  const legalAreaQuestions = {
    'erbrecht': [
      'Wann ist der Erblasser verstorben?',
      'Gibt es ein Testament oder einen Erbvertrag?',
      'Wer sind die gesetzlichen Erben?',
      'Welche Vermögenswerte gehören zum Nachlass?'
    ],
    'familienrecht': [
      'Wie lange besteht die Ehe?',
      'Gibt es gemeinsame Kinder?',
      'Gibt es einen Ehevertrag?',
      'Wie ist die Vermögenssituation der Ehepartner?'
    ],
    'mietrecht': [
      'Wie lange besteht das Mietverhältnis?',
      'Was ist der Grund für die Kündigung?',
      'Gibt es Mängel an der Wohnung?',
      'Wurde die Miete regelmäßig gezahlt?'
    ]
  };
  
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
  
  const handleQuestionChange = (index, value) => {
    setFormData({
      ...formData,
      questions: {
        ...formData.questions,
        [index]: value
      }
    });
  };
  
  const handleLegalAreaChange = (e) => {
    setLegalArea(e.target.value);
  };
  
  const validateStep1 = () => {
    const newErrors = {};
    
    if (!legalArea) {
      newErrors.legalArea = 'Bitte wählen Sie ein Rechtsgebiet aus';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Titel ist erforderlich';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Beschreibung ist erforderlich';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };
  
  const handlePrevStep = () => {
    setStep(1);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if all questions are answered
    const questions = legalAreaQuestions[legalArea] || [];
    const unansweredQuestions = questions.filter((_, index) => !formData.questions[index]);
    
    if (unansweredQuestions.length > 0) {
      alert('Bitte beantworten Sie alle Fragen, um eine genaue rechtliche Einschätzung zu erhalten.');
      return;
    }
    
    // Form is valid, submit data
    console.log('Legal assessment form submitted:', {
      legalArea,
      ...formData
    });
    // Here we would call the API to generate the legal assessment
  };
  
  const renderStep1 = () => (
    <>
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Rechtsgebiet <span className={styles.required}>*</span>
        </label>
        <select 
          className={`${styles.select} ${errors.legalArea ? styles.selectError : ''}`}
          value={legalArea}
          onChange={handleLegalAreaChange}
        >
          <option value="">Bitte wählen</option>
          <option value="erbrecht">Erbrecht</option>
          <option value="familienrecht">Familienrecht</option>
          <option value="mietrecht">Mietrecht</option>
          <option value="arbeitsrecht">Arbeitsrecht</option>
          <option value="verkehrsrecht">Verkehrsrecht</option>
          <option value="vertragsrecht">Vertragsrecht</option>
          <option value="strafrecht">Strafrecht</option>
          <option value="sozialrecht">Sozialrecht</option>
        </select>
        {errors.legalArea && <p className={styles.errorText}>{errors.legalArea}</p>}
      </div>
      
      <Input
        label="Titel Ihres Anliegens"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="z.B. Erbschaftsstreit, Mietminderung, Kündigungsschutz"
        required
        error={errors.title}
      />
      
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Beschreibung Ihres Anliegens <span className={styles.required}>*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Beschreiben Sie Ihr rechtliches Anliegen so detailliert wie möglich..."
          className={`${styles.textarea} ${errors.description ? styles.textareaError : ''}`}
          rows={5}
        />
        {errors.description && <p className={styles.errorText}>{errors.description}</p>}
      </div>
      
      <div className={styles.formActions}>
        <Button type="button" variant="primary" size="large" fullWidth onClick={handleNextStep}>
          Weiter
        </Button>
      </div>
    </>
  );
  
  const renderStep2 = () => {
    const questions = legalAreaQuestions[legalArea] || [];
    
    return (
      <>
        <h3 className={styles.formSubtitle}>Bitte beantworten Sie die folgenden Fragen:</h3>
        
        {questions.map((question, index) => (
          <div key={index} className={styles.formGroup}>
            <label className={styles.label}>
              {question} <span className={styles.required}>*</span>
            </label>
            <textarea
              value={formData.questions[index] || ''}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              className={styles.textarea}
              rows={3}
            />
          </div>
        ))}
        
        <div className={styles.formActions}>
          <div className={styles.formRow}>
            <Button type="button" variant="outline" size="large" onClick={handlePrevStep}>
              Zurück
            </Button>
            <Button type="submit" variant="primary" size="large">
              Rechtliche Einschätzung anfordern (4,99 €)
            </Button>
          </div>
        </div>
        
        <p className={styles.formInfo}>
          Durch Klicken auf "Rechtliche Einschätzung anfordern" stimmen Sie zu, dass für diese Anfrage 4,99 € berechnet werden.
          Neukunden erhalten eine kostenlose Demo-Einschätzung.
        </p>
      </>
    );
  };
  
  return (
    <Card title="Rechtliche Einschätzung anfordern">
      <form className={styles.form} onSubmit={handleSubmit}>
        {step === 1 ? renderStep1() : renderStep2()}
      </form>
    </Card>
  );
}

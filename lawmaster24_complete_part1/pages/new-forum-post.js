import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import styles from '../styles/NewForumPost.module.css';

export default function NewForumPost() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [step, setStep] = useState(1);
  
  // List of legal categories
  const categories = [
    { id: 'Mietrecht', name: 'Mietrecht' },
    { id: 'Arbeitsrecht', name: 'Arbeitsrecht' },
    { id: 'Familienrecht', name: 'Familienrecht' },
    { id: 'Verkehrsrecht', name: 'Verkehrsrecht' },
    { id: 'Vertragsrecht', name: 'Vertragsrecht' },
    { id: 'Erbrecht', name: 'Erbrecht' },
    { id: 'Strafrecht', name: 'Strafrecht' },
    { id: 'Sonstiges', name: 'Sonstiges Rechtsgebiet' }
  ];
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !category || !content) {
      alert('Bitte füllen Sie alle Felder aus.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would be an API call to generate the AI response
      // For demo purposes, we'll simulate a delay and provide a mock response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockAiResponse = `Basierend auf Ihrer Schilderung kann ich folgende rechtliche Einschätzung geben:

Es handelt sich um eine Frage aus dem Bereich ${category}. ${getRandomResponse(category)}

Bitte beachten Sie, dass dies nur eine erste Einschätzung ist und keine vollständige rechtliche Beratung darstellt. Für eine detaillierte Analyse und konkrete Handlungsempfehlungen empfehle ich die Erstellung eines umfassenden Rechtsgutachtens.`;
      
      setAiResponse(mockAiResponse);
      setStep(2);
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsSubmitting(false);
      alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    }
  };
  
  const handlePublish = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would be an API call to publish the post
      // For demo purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to forum page
      window.location.href = '/forum';
    } catch (error) {
      console.error('Error publishing post:', error);
      setIsSubmitting(false);
      alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
    }
  };
  
  const getRandomResponse = (category) => {
    const responses = {
      'Mietrecht': 'Nach § 558 BGB kann der Vermieter die Zustimmung zu einer Erhöhung der Miete bis zur ortsüblichen Vergleichsmiete verlangen, wenn die Miete seit 15 Monaten unverändert ist. Die genaue Höhe der zulässigen Erhöhung hängt von verschiedenen Faktoren ab, wie dem lokalen Mietspiegel und der Kappungsgrenze.',
      'Arbeitsrecht': 'Im Arbeitsrecht gilt grundsätzlich der Kündigungsschutz nach dem Kündigungsschutzgesetz (KSchG), wenn das Arbeitsverhältnis länger als 6 Monate besteht und der Betrieb mehr als 10 Arbeitnehmer beschäftigt. Eine Kündigung muss sozial gerechtfertigt sein.',
      'Familienrecht': 'Im Familienrecht steht das Kindeswohl immer an erster Stelle. Bei Fragen des Umgangsrechts oder des Sorgerechts orientieren sich alle Entscheidungen am Wohl des Kindes gemäß § 1697a BGB.',
      'Verkehrsrecht': 'Im Verkehrsrecht gilt bei Unfällen oft die Betriebsgefahr des Fahrzeugs nach § 7 StVG. Die genaue Haftungsverteilung hängt von den Umständen des Einzelfalls ab.',
      'Vertragsrecht': 'Im Vertragsrecht gilt der Grundsatz der Vertragsfreiheit. Allerdings können Verträge unwirksam sein, wenn sie gegen gesetzliche Verbote verstoßen oder sittenwidrig sind (§§ 134, 138 BGB).',
      'Erbrecht': 'Im Erbrecht haben Pflichtteilsberechtigte (Ehepartner, Kinder, unter Umständen Eltern) einen Anspruch auf den Pflichtteil, der die Hälfte des gesetzlichen Erbteils beträgt (§ 2303 BGB).',
      'Strafrecht': 'Im Strafrecht gilt der Grundsatz "keine Strafe ohne Gesetz" (§ 1 StGB). Eine Handlung kann nur bestraft werden, wenn die Strafbarkeit gesetzlich bestimmt war, bevor die Tat begangen wurde.',
      'Sonstiges': 'Die rechtliche Beurteilung hängt stark von den spezifischen Umständen Ihres Falls ab. Eine pauschale Einschätzung ist in diesem speziellen Bereich schwierig.'
    };
    
    return responses[category] || responses['Sonstiges'];
  };

  return (
    <Layout>
      <Head>
        <title>Neue Rechtsfrage stellen | lawmaster24.com</title>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
          integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </Head>
      
      <div className={styles.newPostContainer}>
        <div className={styles.newPostHeader}>
          <h1>{step === 1 ? 'Neue Rechtsfrage stellen' : 'Ihre KI-Einschätzung'}</h1>
          {step === 1 && (
            <p>Beschreiben Sie Ihr rechtliches Anliegen und erhalten Sie eine kostenlose KI-Einschätzung</p>
          )}
          {step === 2 && (
            <p>Überprüfen Sie die KI-Einschätzung und veröffentlichen Sie Ihre Frage im Forum</p>
          )}
        </div>
        
        {step === 1 && (
          <form className={styles.newPostForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Titel Ihrer Rechtsfrage</label>
              <input 
                type="text" 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="z.B. Mieterhöhung nach Modernisierung - ist das rechtens?"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="category">Rechtsgebiet</label>
              <select 
                id="category" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Bitte wählen Sie ein Rechtsgebiet</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="content">Beschreibung Ihres Anliegens</label>
              <textarea 
                id="content" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Beschreiben Sie Ihr rechtliches Anliegen so detailliert wie möglich. Je mehr Informationen Sie angeben, desto präziser kann die KI-Einschätzung sein."
                rows={10}
                required
              ></textarea>
            </div>
            
            <div className={styles.formDisclaimer}>
              <i className="fas fa-info-circle"></i>
              <p>
                Ihre Frage wird öffentlich im Forum geteilt. Bitte geben Sie keine persönlichen Daten an, 
                die Rückschlüsse auf Ihre Identität zulassen könnten.
              </p>
            </div>
            
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className={styles.spinner}></div>
                  KI-Einschätzung wird erstellt...
                </>
              ) : (
                <>
                  <i className="fas fa-robot"></i>
                  Kostenlose KI-Einschätzung erhalten
                </>
              )}
            </button>
          </form>
        )}
        
        {step === 2 && aiResponse && (
          <div className={styles.aiResponseContainer}>
            <div className={styles.postPreview}>
              <h3>{title}</h3>
              <div className={styles.postMeta}>
                <span className={styles.postCategory}>{category}</span>
                <span className={styles.postAuthor}>Von: Sie</span>
                <span className={styles.postDate}>Heute</span>
              </div>
              <p className={styles.postContent}>{content}</p>
            </div>
            
            <div className={styles.aiResponse}>
              <div className={styles.aiResponseHeader}>
                <div className={styles.aiAvatar}>
                  <i className="fas fa-robot"></i>
                </div>
                <h3>KI-Einschätzung</h3>
              </div>
              
              <div className={styles.aiResponseContent}>
                {aiResponse.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            <div className={styles.actionButtons}>
              <button 
                className={styles.backButton}
                onClick={() => setStep(1)}
                disabled={isSubmitting}
              >
                <i className="fas fa-arrow-left"></i>
                Zurück bearbeiten
              </button>
              
              <button 
                className={styles.publishButton}
                onClick={handlePublish}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner}></div>
                    Wird veröffentlicht...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Im Forum veröffentlichen
                  </>
                )}
              </button>
            </div>
            
            <div className={styles.upgradeContainer}>
              <h3>Möchten Sie eine detaillierte rechtliche Analyse?</h3>
              <p>
                Erhalten Sie ein umfassendes Rechtsgutachten mit konkreten Handlungsempfehlungen 
                und einem Antwortschreiben für nur 4,99€.
              </p>
              <button className={styles.upgradeButton}>
                <i className="fas fa-file-alt"></i>
                Detaillierte Analyse für 4,99€
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

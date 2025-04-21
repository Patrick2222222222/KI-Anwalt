import { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import styles from '../styles/ForumAPI.module.css';

export default function ForumAPI() {
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [requestBody, setRequestBody] = useState(
`{
  "title": "Mieterhöhung nach Modernisierung",
  "category": "Mietrecht",
  "content": "Mein Vermieter hat eine energetische Sanierung durchgeführt und möchte nun die Miete um 15% erhöhen. Ist das rechtens?"
}`);
  const [responseData, setResponseData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!apiKey || !endpoint || !requestBody) {
      alert('Bitte füllen Sie alle Felder aus.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would be an actual API call
      // For demo purposes, we'll simulate a delay and provide a mock response
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponse = {
        success: true,
        data: {
          id: "case_12345",
          title: JSON.parse(requestBody).title,
          category: JSON.parse(requestBody).category,
          content: JSON.parse(requestBody).content,
          aiResponse: "Nach § 559 BGB darf der Vermieter nach Modernisierungsmaßnahmen die jährliche Miete um bis zu 8% der für die Wohnung aufgewendeten Kosten erhöhen. Eine energetische Sanierung gilt als Modernisierung. Die Erhöhung um 15% erscheint daher auf den ersten Blick zu hoch, sofern sie sich auf die Jahresmiete bezieht. Wichtig ist auch, dass der Vermieter die Modernisierung korrekt angekündigt hat und die Berechnung der Umlage nachvollziehbar darlegt.",
          created_at: new Date().toISOString()
        }
      };
      
      setResponseData(mockResponse);
      setIsLoading(false);
    } catch (error) {
      console.error('Error calling API:', error);
      setIsLoading(false);
      setResponseData({
        success: false,
        error: "Ein Fehler ist aufgetreten. Bitte überprüfen Sie Ihre API-Einstellungen."
      });
    }
  };

  return (
    <Layout>
      <Head>
        <title>API-Dokumentation | lawmaster24.com</title>
      </Head>
      
      <div className={styles.apiContainer}>
        <div className={styles.apiHeader}>
          <h1>lawmaster24 API</h1>
          <p>Integrieren Sie unsere KI-gestützte Rechtsberatung in Ihre eigene Anwendung</p>
        </div>
        
        <div className={styles.apiContent}>
          <div className={styles.apiDocs}>
            <h2>API-Dokumentation</h2>
            
            <div className={styles.apiSection}>
              <h3>Authentifizierung</h3>
              <p>
                Alle API-Anfragen erfordern einen API-Schlüssel, der im Header der Anfrage übergeben wird:
              </p>
              <pre className={styles.codeBlock}>
                <code>
                  {`Authorization: Bearer YOUR_API_KEY`}
                </code>
              </pre>
              <p>
                Um einen API-Schlüssel zu erhalten, kontaktieren Sie uns unter <a href="mailto:api@lawmaster24.com">api@lawmaster24.com</a>.
              </p>
            </div>
            
            <div className={styles.apiSection}>
              <h3>Endpunkte</h3>
              
              <div className={styles.endpoint}>
                <div className={styles.endpointHeader}>
                  <span className={styles.method}>POST</span>
                  <span className={styles.path}>/api/legal-assessment/generate</span>
                </div>
                <p>Generiert eine rechtliche Einschätzung basierend auf der Beschreibung eines Falls.</p>
                
                <h4>Request Body</h4>
                <pre className={styles.codeBlock}>
                  <code>
                    {`{
  "title": "Titel des Falls",
  "category": "Rechtsgebiet",
  "content": "Beschreibung des rechtlichen Anliegens"
}`}
                  </code>
                </pre>
                
                <h4>Response</h4>
                <pre className={styles.codeBlock}>
                  <code>
                    {`{
  "success": true,
  "data": {
    "id": "case_12345",
    "title": "Titel des Falls",
    "category": "Rechtsgebiet",
    "content": "Beschreibung des rechtlichen Anliegens",
    "aiResponse": "Rechtliche Einschätzung der KI",
    "created_at": "2025-04-17T14:30:00.000Z"
  }
}`}
                  </code>
                </pre>
              </div>
              
              <div className={styles.endpoint}>
                <div className={styles.endpointHeader}>
                  <span className={styles.method}>POST</span>
                  <span className={styles.path}>/api/legal-assessment/detailed</span>
                </div>
                <p>Generiert eine detaillierte rechtliche Analyse (kostenpflichtig, 4,99€ pro Anfrage).</p>
                
                <h4>Request Body</h4>
                <pre className={styles.codeBlock}>
                  <code>
                    {`{
  "case_id": "case_12345",
  "payment_token": "payment_token_from_stripe"
}`}
                  </code>
                </pre>
                
                <h4>Response</h4>
                <pre className={styles.codeBlock}>
                  <code>
                    {`{
  "success": true,
  "data": {
    "id": "detailed_12345",
    "case_id": "case_12345",
    "detailedAnalysis": "Ausführliche rechtliche Analyse",
    "recommendations": "Handlungsempfehlungen",
    "documentTemplate": "Vorlage für ein Antwortschreiben",
    "created_at": "2025-04-17T14:35:00.000Z"
  }
}`}
                  </code>
                </pre>
              </div>
            </div>
            
            <div className={styles.apiSection}>
              <h3>Fehlerbehandlung</h3>
              <p>
                Bei Fehlern gibt die API einen entsprechenden HTTP-Statuscode und eine Fehlermeldung zurück:
              </p>
              <pre className={styles.codeBlock}>
                <code>
                  {`{
  "success": false,
  "error": "Fehlermeldung",
  "code": "ERROR_CODE"
}`}
                </code>
              </pre>
              
              <h4>Häufige Fehlercodes</h4>
              <ul className={styles.errorCodes}>
                <li><strong>INVALID_API_KEY</strong>: Ungültiger API-Schlüssel</li>
                <li><strong>MISSING_PARAMETERS</strong>: Fehlende Parameter in der Anfrage</li>
                <li><strong>PAYMENT_FAILED</strong>: Zahlungsvorgang fehlgeschlagen</li>
                <li><strong>RATE_LIMIT_EXCEEDED</strong>: Rate Limit überschritten</li>
                <li><strong>SERVER_ERROR</strong>: Interner Serverfehler</li>
              </ul>
            </div>
            
            <div className={styles.apiSection}>
              <h3>Rate Limits</h3>
              <p>
                Die API unterliegt folgenden Rate Limits:
              </p>
              <ul>
                <li>Kostenlose Einschätzungen: 10 Anfragen pro Tag</li>
                <li>Detaillierte Analysen: Unbegrenzt (kostenpflichtig)</li>
              </ul>
            </div>
          </div>
          
          <div className={styles.apiTester}>
            <h2>API-Tester</h2>
            <p>Testen Sie die API direkt in Ihrem Browser</p>
            
            <form className={styles.apiForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="apiKey">API-Schlüssel</label>
                <input 
                  type="text" 
                  id="apiKey" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Ihr API-Schlüssel"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="endpoint">Endpunkt</label>
                <select 
                  id="endpoint" 
                  value={endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                >
                  <option value="">Endpunkt auswählen</option>
                  <option value="/api/legal-assessment/generate">Rechtliche Einschätzung generieren</option>
                  <option value="/api/legal-assessment/detailed">Detaillierte Analyse generieren</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="requestBody">Request Body (JSON)</label>
                <textarea 
                  id="requestBody" 
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={10}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Anfrage wird gesendet...' : 'Anfrage senden'}
              </button>
            </form>
            
            {responseData && (
              <div className={styles.apiResponse}>
                <h3>API-Antwort</h3>
                <pre className={styles.codeBlock}>
                  <code>
                    {JSON.stringify(responseData, null, 2)}
                  </code>
                </pre>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.apiPricing}>
          <h2>API-Preise</h2>
          
          <div className={styles.pricingCards}>
            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <h3>Starter</h3>
                <div className={styles.price}>
                  <span className={styles.amount}>49€</span>
                  <span className={styles.period}>/Monat</span>
                </div>
              </div>
              <ul className={styles.pricingFeatures}>
                <li>500 kostenlose Einschätzungen pro Monat</li>
                <li>Detaillierte Analysen für 3,99€ pro Anfrage</li>
                <li>E-Mail-Support</li>
                <li>API-Dokumentation</li>
              </ul>
              <button className={styles.pricingButton}>Jetzt starten</button>
            </div>
            
            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <h3>Professional</h3>
                <div className={styles.price}>
                  <span className={styles.amount}>199€</span>
                  <span className={styles.period}>/Monat</span>
                </div>
              </div>
              <ul className={styles.pricingFeatures}>
                <li>2.500 kostenlose Einschätzungen pro Monat</li>
                <li>Detaillierte Analysen für 2,99€ pro Anfrage</li>
                <li>Prioritäts-Support</li>
                <li>Anpassbare Antwortvorlagen</li>
                <li>Webhook-Integrationen</li>
              </ul>
              <button className={styles.pricingButton}>Jetzt starten</button>
            </div>
            
            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <h3>Enterprise</h3>
                <div className={styles.price}>
                  <span className={styles.amount}>Individuell</span>
                </div>
              </div>
              <ul className={styles.pricingFeatures}>
                <li>Unbegrenzte kostenlose Einschätzungen</li>
                <li>Individuelle Preise für detaillierte Analysen</li>
                <li>Dedizierter Account Manager</li>
                <li>SLA mit garantierter Verfügbarkeit</li>
                <li>Anpassbare KI-Modelle</li>
                <li>On-Premise-Lösungen möglich</li>
              </ul>
              <button className={styles.pricingButton}>Kontakt aufnehmen</button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

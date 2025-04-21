// pages/admin/reports.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';
import styles from '../../styles/Admin.module.css';
import reportStyles from '../../styles/AdminReports.module.css';

export default function AdminReports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [reportType, setReportType] = useState('revenue');
  const [exportFormat, setExportFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleExportReport = async () => {
    setGenerating(true);
    
    try {
      // In a real implementation, this would be an API call
      // For demo purposes, we'll simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate download by showing an alert
      alert(`Bericht wurde als ${exportFormat.toUpperCase()} exportiert!`);
      
      setGenerating(false);
    } catch (error) {
      console.error('Error exporting report:', error);
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.adminLayout}>
        <Head>
          <title>Berichte | lawmaster24.com</title>
          <link 
            rel="stylesheet" 
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
            integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA==" 
            crossOrigin="anonymous" 
            referrerPolicy="no-referrer" 
          />
        </Head>
        
        <AdminSidebar />
        
        <main className={styles.adminMain}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Berichte werden geladen...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <Head>
        <title>Berichte | lawmaster24.com</title>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" 
          integrity="sha512-Fo3rlrZj/k7ujTnHg4CGR2D7kSs0v4LLanw2qksYuRlEzO+tcaEPQogQ0KaoGN26/zrn20ImR1DfuLWnOo7aBA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </Head>
      
      <AdminSidebar />
      
      <main className={styles.adminMain}>
        <div className={styles.adminHeader}>
          <h1>Berichte</h1>
        </div>
        
        <div className={reportStyles.reportControls}>
          <div className={reportStyles.controlGroup}>
            <label>Zeitraum</label>
            <div className={reportStyles.buttonGroup}>
              <button 
                className={timeRange === 'week' ? reportStyles.active : ''}
                onClick={() => setTimeRange('week')}
              >
                Woche
              </button>
              <button 
                className={timeRange === 'month' ? reportStyles.active : ''}
                onClick={() => setTimeRange('month')}
              >
                Monat
              </button>
              <button 
                className={timeRange === 'year' ? reportStyles.active : ''}
                onClick={() => setTimeRange('year')}
              >
                Jahr
              </button>
            </div>
          </div>
          
          <div className={reportStyles.controlGroup}>
            <label>Berichtstyp</label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="revenue">Umsatzbericht</option>
              <option value="users">Benutzerbericht</option>
              <option value="cases">Fallbericht</option>
              <option value="lawyers">Anwaltsbericht</option>
              <option value="comprehensive">Umfassender Bericht</option>
            </select>
          </div>
          
          <div className={reportStyles.controlGroup}>
            <label>Exportformat</label>
            <div className={reportStyles.buttonGroup}>
              <button 
                className={exportFormat === 'pdf' ? reportStyles.active : ''}
                onClick={() => setExportFormat('pdf')}
              >
                PDF
              </button>
              <button 
                className={exportFormat === 'csv' ? reportStyles.active : ''}
                onClick={() => setExportFormat('csv')}
              >
                CSV
              </button>
            </div>
          </div>
          
          <button 
            className={reportStyles.exportButton}
            onClick={handleExportReport}
            disabled={generating}
          >
            {generating ? (
              <>
                <div className={reportStyles.smallSpinner}></div>
                Wird generiert...
              </>
            ) : (
              <>
                <i className="fas fa-download"></i>
                Bericht exportieren
              </>
            )}
          </button>
        </div>
        
        <div className={reportStyles.reportPreview}>
          <div className={reportStyles.previewHeader}>
            <h2>Berichtsvorschau: {getReportTypeName(reportType)}</h2>
            <span>Zeitraum: {getTimeRangeName(timeRange)}</span>
          </div>
          
          <div className={reportStyles.previewContent}>
            {reportType === 'revenue' && (
              <div className={reportStyles.revenuePreview}>
                <div className={reportStyles.summaryCards}>
                  <div className={reportStyles.summaryCard}>
                    <div className={reportStyles.summaryIcon}>
                      <i className="fas fa-euro-sign"></i>
                    </div>
                    <div className={reportStyles.summaryContent}>
                      <span className={reportStyles.summaryValue}>8.235,00 €</span>
                      <span className={reportStyles.summaryLabel}>Gesamtumsatz</span>
                    </div>
                    <div className={`${reportStyles.summaryChange} ${reportStyles.positive}`}>
                      <i className="fas fa-arrow-up"></i>
                      <span>15,3%</span>
                    </div>
                  </div>
                  
                  <div className={reportStyles.summaryCard}>
                    <div className={reportStyles.summaryIcon}>
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div className={reportStyles.summaryContent}>
                      <span className={reportStyles.summaryValue}>1.650</span>
                      <span className={reportStyles.summaryLabel}>Bezahlte Fälle</span>
                    </div>
                    <div className={`${reportStyles.summaryChange} ${reportStyles.positive}`}>
                      <i className="fas fa-arrow-up"></i>
                      <span>8,2%</span>
                    </div>
                  </div>
                  
                  <div className={reportStyles.summaryCard}>
                    <div className={reportStyles.summaryIcon}>
                      <i className="fas fa-calculator"></i>
                    </div>
                    <div className={reportStyles.summaryContent}>
                      <span className={reportStyles.summaryValue}>4,99 €</span>
                      <span className={reportStyles.summaryLabel}>Durchschnittspreis</span>
                    </div>
                    <div className={`${reportStyles.summaryChange} ${reportStyles.neutral}`}>
                      <i className="fas fa-minus"></i>
                      <span>0,0%</span>
                    </div>
                  </div>
                </div>
                
                <div className={reportStyles.chartContainer}>
                  <h3>Umsatzentwicklung</h3>
                  <div className={reportStyles.chartPlaceholder}>
                    <div className={reportStyles.barChart}>
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className={reportStyles.barContainer}>
                          <div 
                            className={reportStyles.bar} 
                            style={{ height: `${Math.floor(Math.random() * 70) + 30}%` }}
                          ></div>
                          <span>{getMonthLabel(i)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className={reportStyles.tableContainer}>
                  <h3>Top 5 Rechtsgebiete nach Umsatz</h3>
                  <table className={reportStyles.dataTable}>
                    <thead>
                      <tr>
                        <th>Rechtsgebiet</th>
                        <th>Fälle</th>
                        <th>Umsatz</th>
                        <th>Anteil</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Familienrecht</td>
                        <td>412</td>
                        <td>2.055,88 €</td>
                        <td>25%</td>
                      </tr>
                      <tr>
                        <td>Mietrecht</td>
                        <td>380</td>
                        <td>1.896,20 €</td>
                        <td>23%</td>
                      </tr>
                      <tr>
                        <td>Arbeitsrecht</td>
                        <td>298</td>
                        <td>1.487,02 €</td>
                        <td>18%</td>
                      </tr>
                      <tr>
                        <td>Verkehrsrecht</td>
                        <td>245</td>
                        <td>1.222,55 €</td>
                        <td>15%</td>
                      </tr>
                      <tr>
                        <td>Erbrecht</td>
                        <td>215</td>
                        <td>1.072,85 €</td>
                        <td>13%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {reportType === 'users' && (
              <div className={reportStyles.usersPreview}>
                <div className={reportStyles.summaryCards}>
                  <div className={reportStyles.summaryCard}>
                    <div className={reportStyles.summaryIcon}>
                      <i className="fas fa-users"></i>
                    </div>
                    <div className={reportStyles.summaryContent}>
                      <span className={reportStyles.summaryValue}>1.250</span>
                      <span className={reportStyles.summaryLabel}>Gesamtnutzer</span>
                    </div>
                    <div className={`${reportStyles.summaryChange} ${reportStyles.positive}`}>
                      <i className="fas fa-arrow-up"></i>
                      <span>12,5%</span>
                    </div>
                  </div>
                  
                  <div className={reportStyles.summaryCard}>
                    <div className={reportStyles.summaryIcon}>
                      <i className="fas fa-user-plus"></i>
                    </div>
                    <div className={reportStyles.summaryContent}>
                      <span className={reportStyles.summaryValue}>185</span>
                      <span className={reportStyles.summaryLabel}>Neue Nutzer</span>
                    </div>
                    <div className={`${reportStyles.summaryChange} ${reportStyles.positive}`}>
                      <i className="fas fa-arrow-up"></i>
                      <span>8,7%</span>
                    </div>
                  </div>
                  
                  <div className={reportStyles.summaryCard}>
                    <div className={reportStyles.summaryIcon}>
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <div className={reportStyles.summaryContent}>
                      <span className={reportStyles.summaryValue}>85</span>
                      <span className={reportStyles.summaryLabel}>Anwälte</span>
                    </div>
                    <div className={`${reportStyles.summaryChange} ${reportStyles.positive}`}>
                      <i className="fas fa-arrow-up"></i>
                      <span>5,7%</span>
                    </div>
                  </div>
                </div>
                
                <div className={reportStyles.chartContainer}>
                  <h3>Nutzerentwicklung</h3>
                  <div className={reportStyles.chartPlaceholder}>
                    <div className={reportStyles.lineChart}>
                      <div className={reportStyles.lineChartInner}>
                        {Array.from({ length: 12 }, (_, i) => (
                          <div key={i} className={reportStyles.dataPoint} style={{ 
                            left: `${(i / 11) * 100}%`, 
                            bottom: `${Math.floor(Math.random() * 50) + 30}%` 
                          }}>
                            <span className={reportStyles.dataPointValue}></span>
                          </div>
                        ))}
                      </div>
                      <div className={reportStyles.lineChartLabels}>
                        {Array.from({ length: 12 }, (_, i) => (
                          <span key={i} style={{ left: `${(i / 11) * 100}%` }}>
                            {getMonthLabel(i)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className={reportStyles.tableContainer}>
                  <h3>Nutzeraktivität</h3>
                  <table className={reportStyles.dataTable}>
                    <thead>
                      <tr>
                        <th>Metrik</th>
                        <th>Wert</th>
                        <th>Änderung</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Durchschnittliche Sitzungsdauer</td>
                        <td>8:45 Minuten</td>
                        <td className={reportStyles.positive}>+1:12</td>
                      </tr>
                      <tr>
                        <td>Fälle pro Nutzer</td>
                        <td>3,2</td>
                        <td className={reportStyles.positive}>+0,4</td>
                      </tr>
                      <tr>
                        <td>Wiederkehrende Nutzer</td>
                        <td>68%</td>
                        <td className={reportStyles.positive}>+5%</td>
                      </tr>
                      <tr>
                        <td>Absprungrate</td>
                        <td>22%</td>
                        <td className={reportStyles.negative}>-3%</td>
                      </tr>
                      <tr>
                        <td>Konversionsrate</td>
                        <td>15%</td>
                        <td className={reportStyles.positive}>+2%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {(reportType !== 'revenue' && reportType !== 'users') && (
              <div className={reportStyles.placeholderMessage}>
                <i className="fas fa-chart-bar"></i>
                <p>Vorschau für {getReportTypeName(reportType)} wird geladen...</p>
                <p className={reportStyles.smallText}>Vollständige Daten sind im exportierten Bericht verfügbar.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className={reportStyles.savedReports}>
          <h3>Gespeicherte Berichte</h3>
          <table className={reportStyles.savedReportsTable}>
            <thead>
              <tr>
                <th>Berichtsname</th>
                <th>Typ</th>
                <th>Zeitraum</th>
                <th>Erstellt am</th>
                <th>Format</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Monatlicher Umsatzbericht - März 2025</td>
                <td>Umsatz</td>
                <td>Monat</td>
                <td>01.04.2025</td>
                <td>PDF</td>
                <td>
                  <div className={reportStyles.reportActions}>
                    <button className={reportStyles.downloadButton}>
                      <i className="fas fa-download"></i>
                    </button>
                    <button className={reportStyles.deleteButton}>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Quartalsbericht Q1 2025</td>
                <td>Umfassend</td>
                <td>Quartal</td>
                <td>05.04.2025</td>
                <td>PDF</td>
                <td>
                  <div className={reportStyles.reportActions}>
                    <button className={reportStyles.downloadButton}>
                      <i className="fas fa-download"></i>
                    </button>
                    <button className={reportStyles.deleteButton}>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr>
                <td>Nutzerwachstum - Q1 2025</td>
                <td>Benutzer</td>
                <td>Quartal</td>
                <td>05.04.2025</td>
                <td>CSV</td>
                <td>
                  <div className={reportStyles.reportActions}>
                    <button className={reportStyles.downloadButton}>
                      <i className="fas fa-download"></i>
                    </button>
                    <button className={reportStyles.deleteButton}>
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function getReportTypeName(type) {
  switch(type) {
    case 'revenue':
      return 'Umsatzbericht';
    case 'users':
      return 'Benutzerbericht';
    case 'cases':
      return 'Fallbericht';
    case 'lawyers':
      return 'Anwaltsbericht';
    case 'comprehensive':
      return 'Umfassender Bericht';
    default:
      return 'Bericht';
  }
}

function getTimeRangeName(range) {
  switch(range) {
    case 'week':
      return 'Letzte Woche';
    case 'month':
      return 'Letzter Monat';
    case 'year':
      return 'Letztes Jahr';
    default:
      return 'Benutzerdefiniert';
  }
}

function getMonthLabel(index) {
  const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
  return months[index];
}

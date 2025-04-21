// pages/admin/legal-areas.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AdminSidebar from '../../components/AdminSidebar';
import styles from '../../styles/Admin.module.css';
import legalAreaStyles from '../../styles/AdminLegalAreas.module.css';

export default function AdminLegalAreas() {
  const router = useRouter();
  const [legalAreas, setLegalAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingArea, setEditingArea] = useState(null);
  const [newArea, setNewArea] = useState({
    name: '',
    description: '',
    icon: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Fetch legal areas data
    async function fetchLegalAreas() {
      try {
        // In a real implementation, this would be an API call
        // For demo purposes, we'll use mock data
        const mockLegalAreas = [
          { id: 1, name: 'Erbrecht', description: 'Rechtliche Fragen zu Testamenten, Erbschaften und Nachlässen', icon: 'scroll', caseCount: 125 },
          { id: 2, name: 'Familienrecht', description: 'Rechtliche Fragen zu Ehe, Scheidung, Sorgerecht und Unterhalt', icon: 'users', caseCount: 210 },
          { id: 3, name: 'Mietrecht', description: 'Rechtliche Fragen zu Mietverträgen, Mieterhöhungen und Kündigungen', icon: 'home', caseCount: 180 },
          { id: 4, name: 'Arbeitsrecht', description: 'Rechtliche Fragen zu Arbeitsverträgen, Kündigungen und Arbeitszeugnis', icon: 'briefcase', caseCount: 150 },
          { id: 5, name: 'Vertragsrecht', description: 'Rechtliche Fragen zu Verträgen aller Art', icon: 'file-contract', caseCount: 95 },
          { id: 6, name: 'Verkehrsrecht', description: 'Rechtliche Fragen zu Verkehrsunfällen und Bußgeldern', icon: 'car', caseCount: 120 },
          { id: 7, name: 'Strafrecht', description: 'Rechtliche Fragen zu Strafverfahren und Verteidigung', icon: 'gavel', caseCount: 75 },
          { id: 8, name: 'Sozialrecht', description: 'Rechtliche Fragen zu Sozialleistungen und Rente', icon: 'hand-holding-heart', caseCount: 60 },
          { id: 9, name: 'Steuerrecht', description: 'Rechtliche Fragen zu Steuern und Steuerverfahren', icon: 'file-invoice-dollar', caseCount: 85 },
          { id: 10, name: 'Internetrecht', description: 'Rechtliche Fragen zu Internet, Datenschutz und IT', icon: 'globe', caseCount: 110 }
        ];
        
        setLegalAreas(mockLegalAreas);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching legal areas:', error);
        setLoading(false);
      }
    }
    
    fetchLegalAreas();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEditClick = (area) => {
    setEditingArea({...area});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingArea(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSave = () => {
    // In a real implementation, this would be an API call
    setLegalAreas(prev => 
      prev.map(area => 
        area.id === editingArea.id ? editingArea : area
      )
    );
    setEditingArea(null);
  };

  const handleEditCancel = () => {
    setEditingArea(null);
  };

  const handleNewAreaChange = (e) => {
    const { name, value } = e.target;
    setNewArea(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddArea = () => {
    // In a real implementation, this would be an API call
    const newId = Math.max(...legalAreas.map(area => area.id)) + 1;
    const areaToAdd = {
      ...newArea,
      id: newId,
      caseCount: 0
    };
    
    setLegalAreas(prev => [...prev, areaToAdd]);
    setNewArea({
      name: '',
      description: '',
      icon: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteArea = (id) => {
    if (confirm('Sind Sie sicher, dass Sie dieses Rechtsgebiet löschen möchten?')) {
      // In a real implementation, this would be an API call
      setLegalAreas(prev => prev.filter(area => area.id !== id));
    }
  };

  // Filter legal areas based on search term
  const filteredLegalAreas = legalAreas.filter(area => 
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={styles.adminLayout}>
        <Head>
          <title>Rechtsgebiete verwalten | lawmaster24.com</title>
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
            <p>Rechtsgebiete werden geladen...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.adminLayout}>
      <Head>
        <title>Rechtsgebiete verwalten | lawmaster24.com</title>
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
          <h1>Rechtsgebiete verwalten</h1>
          <div className={styles.adminActions}>
            <button 
              className={legalAreaStyles.addButton} 
              onClick={() => setShowAddForm(true)}
            >
              <i className="fas fa-plus"></i> Rechtsgebiet hinzufügen
            </button>
          </div>
        </div>
        
        <div className={legalAreaStyles.controls}>
          <div className={legalAreaStyles.searchBox}>
            <input 
              type="text" 
              placeholder="Rechtsgebiete durchsuchen..." 
              value={searchTerm}
              onChange={handleSearch}
            />
            <i className="fas fa-search"></i>
          </div>
          
          <div className={legalAreaStyles.summary}>
            <span>{legalAreas.length} Rechtsgebiete</span>
            <span>{legalAreas.reduce((sum, area) => sum + area.caseCount, 0)} Fälle insgesamt</span>
          </div>
        </div>
        
        {showAddForm && (
          <div className={legalAreaStyles.addForm}>
            <h3>Neues Rechtsgebiet hinzufügen</h3>
            <div className={legalAreaStyles.formGrid}>
              <div className={legalAreaStyles.formGroup}>
                <label>Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={newArea.name} 
                  onChange={handleNewAreaChange}
                  placeholder="z.B. Urheberrecht"
                />
              </div>
              <div className={legalAreaStyles.formGroup}>
                <label>Icon</label>
                <input 
                  type="text" 
                  name="icon" 
                  value={newArea.icon} 
                  onChange={handleNewAreaChange}
                  placeholder="z.B. copyright"
                />
              </div>
              <div className={legalAreaStyles.formGroup + ' ' + legalAreaStyles.fullWidth}>
                <label>Beschreibung</label>
                <textarea 
                  name="description" 
                  value={newArea.description} 
                  onChange={handleNewAreaChange}
                  placeholder="Kurze Beschreibung des Rechtsgebiets..."
                  rows="3"
                ></textarea>
              </div>
            </div>
            <div className={legalAreaStyles.formActions}>
              <button 
                className={legalAreaStyles.cancelButton}
                onClick={() => setShowAddForm(false)}
              >
                Abbrechen
              </button>
              <button 
                className={legalAreaStyles.saveButton}
                onClick={handleAddArea}
                disabled={!newArea.name || !newArea.description}
              >
                Hinzufügen
              </button>
            </div>
          </div>
        )}
        
        <div className={legalAreaStyles.legalAreaGrid}>
          {filteredLegalAreas.map(area => (
            <div key={area.id} className={legalAreaStyles.legalAreaCard}>
              {editingArea && editingArea.id === area.id ? (
                // Edit mode
                <div className={legalAreaStyles.editForm}>
                  <div className={legalAreaStyles.formGroup}>
                    <label>Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={editingArea.name} 
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className={legalAreaStyles.formGroup}>
                    <label>Icon</label>
                    <input 
                      type="text" 
                      name="icon" 
                      value={editingArea.icon} 
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className={legalAreaStyles.formGroup}>
                    <label>Beschreibung</label>
                    <textarea 
                      name="description" 
                      value={editingArea.description} 
                      onChange={handleEditChange}
                      rows="3"
                    ></textarea>
                  </div>
                  <div className={legalAreaStyles.editActions}>
                    <button 
                      className={legalAreaStyles.cancelButton}
                      onClick={handleEditCancel}
                    >
                      Abbrechen
                    </button>
                    <button 
                      className={legalAreaStyles.saveButton}
                      onClick={handleEditSave}
                    >
                      Speichern
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className={legalAreaStyles.legalAreaHeader}>
                    <div className={legalAreaStyles.legalAreaIcon}>
                      <i className={`fas fa-${area.icon}`}></i>
                    </div>
                    <div className={legalAreaStyles.legalAreaActions}>
                      <button 
                        className={legalAreaStyles.editButton}
                        onClick={() => handleEditClick(area)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className={legalAreaStyles.deleteButton}
                        onClick={() => handleDeleteArea(area.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                  <h3>{area.name}</h3>
                  <p>{area.description}</p>
                  <div className={legalAreaStyles.legalAreaStats}>
                    <div className={legalAreaStyles.statItem}>
                      <span className={legalAreaStyles.statValue}>{area.caseCount}</span>
                      <span className={legalAreaStyles.statLabel}>Fälle</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {filteredLegalAreas.length === 0 && (
            <div className={legalAreaStyles.noResults}>
              <i className="fas fa-search"></i>
              <p>Keine Rechtsgebiete gefunden.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

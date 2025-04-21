// pages/admin/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Layout from '../../components/Layout';
import AdminSidebar from '../../components/AdminSidebar';
import AdminStats from '../../components/AdminStats';
import styles from '../../styles/Admin.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Überprüfen, ob der Benutzer Admin-Rechte hat
    async function checkAdminStatus() {
      try {
        // In einer realen Implementierung würde hier eine API-Anfrage erfolgen
        // Für Demo-Zwecke setzen wir isAdmin auf true
        setIsAdmin(true);
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        router.push('/login');
      }
    }
    
    checkAdminStatus();
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <Head>
          <title>Admin Dashboard | lawmaster24.com</title>
        </Head>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Wird geladen...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null; // Router wird den Benutzer umleiten
  }

  return (
    <div className={styles.adminLayout}>
      <Head>
        <title>Admin Dashboard | lawmaster24.com</title>
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
          <h1>Dashboard</h1>
          <div className={styles.adminActions}>
            <button className={styles.refreshButton}>
              <i className="fas fa-sync-alt"></i> Aktualisieren
            </button>
            <div className={styles.adminSearch}>
              <input type="text" placeholder="Suchen..." />
              <button><i className="fas fa-search"></i></button>
            </div>
            <div className={styles.adminNotifications}>
              <button><i className="fas fa-bell"></i></button>
              <span className={styles.notificationBadge}>3</span>
            </div>
          </div>
        </div>
        
        <div className={styles.adminContent}>
          <AdminStats />
          
          <div className={styles.quickActions}>
            <h2>Schnellzugriff</h2>
            <div className={styles.actionGrid}>
              <div className={styles.actionCard} onClick={() => router.push('/admin/users')}>
                <i className="fas fa-users"></i>
                <span>Benutzer verwalten</span>
              </div>
              <div className={styles.actionCard} onClick={() => router.push('/admin/legal-areas')}>
                <i className="fas fa-balance-scale"></i>
                <span>Rechtsgebiete</span>
              </div>
              <div className={styles.actionCard} onClick={() => router.push('/admin/content')}>
                <i className="fas fa-edit"></i>
                <span>Inhalte bearbeiten</span>
              </div>
              <div className={styles.actionCard} onClick={() => router.push('/admin/media')}>
                <i className="fas fa-images"></i>
                <span>Medien verwalten</span>
              </div>
              <div className={styles.actionCard} onClick={() => router.push('/admin/payments')}>
                <i className="fas fa-euro-sign"></i>
                <span>Zahlungen</span>
              </div>
              <div className={styles.actionCard} onClick={() => router.push('/admin/reports')}>
                <i className="fas fa-chart-bar"></i>
                <span>Berichte</span>
              </div>
            </div>
          </div>
          
          <div className={styles.recentActivity}>
            <h2>Neueste Aktivitäten</h2>
            <div className={styles.activityList}>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <i className="fas fa-user-plus"></i>
                </div>
                <div className={styles.activityContent}>
                  <p>Neuer Benutzer registriert: <strong>Max Mustermann</strong></p>
                  <span className={styles.activityTime}>Vor 2 Stunden</span>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className={styles.activityContent}>
                  <p>Neuer Rechtsfall erstellt: <strong>Mietrecht - Kündigung</strong></p>
                  <span className={styles.activityTime}>Vor 3 Stunden</span>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <i className="fas fa-euro-sign"></i>
                </div>
                <div className={styles.activityContent}>
                  <p>Neue Zahlung eingegangen: <strong>4,99 €</strong></p>
                  <span className={styles.activityTime}>Vor 5 Stunden</span>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <i className="fas fa-user-tie"></i>
                </div>
                <div className={styles.activityContent}>
                  <p>Neuer Anwalt registriert: <strong>Dr. Anna Schmidt</strong></p>
                  <span className={styles.activityTime}>Vor 8 Stunden</span>
                </div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <i className="fas fa-star"></i>
                </div>
                <div className={styles.activityContent}>
                  <p>Neue Bewertung: <strong>5 Sterne</strong> für Anwalt <strong>Dr. Thomas Müller</strong></p>
                  <span className={styles.activityTime}>Vor 1 Tag</span>
                </div>
              </div>
            </div>
            <button className={styles.viewAllButton}>Alle Aktivitäten anzeigen</button>
          </div>
        </div>
      </main>
    </div>
  );
}

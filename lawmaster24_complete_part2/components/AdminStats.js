// components/AdminStats.js
import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import styles from '../styles/AdminStats.module.css';

// Register Chart.js components
Chart.register(...registerables);

const AdminStats = () => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/admin/statistics?timeRange=${timeRange}`);
        const data = await response.json();
        
        if (response.ok) {
          setStatsData(data);
        } else {
          setError(data.message || 'Fehler beim Laden der Statistiken');
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError('Fehler beim Laden der Statistiken');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    setLoading(true);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Statistiken werden geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => {
            setLoading(true);
            setError(null);
          }}
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  // Prepare data for revenue chart
  const revenueData = {
    labels: statsData.revenue.labels,
    datasets: [
      {
        label: 'Umsatz (€)',
        data: statsData.revenue.data,
        fill: false,
        backgroundColor: 'rgba(58, 134, 255, 0.2)',
        borderColor: 'rgba(58, 134, 255, 1)',
        tension: 0.4
      }
    ]
  };

  // Prepare data for cases by legal area chart
  const casesByLegalAreaData = {
    labels: statsData.casesByLegalArea.labels,
    datasets: [
      {
        data: statsData.casesByLegalArea.data,
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(199, 199, 199, 0.6)',
          'rgba(83, 102, 255, 0.6)',
          'rgba(40, 159, 64, 0.6)',
          'rgba(210, 199, 199, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)',
          'rgba(40, 159, 64, 1)',
          'rgba(210, 199, 199, 1)',
        ],
        borderWidth: 1
      }
    ]
  };

  // Prepare data for user activity chart
  const userActivityData = {
    labels: statsData.userActivity.labels,
    datasets: [
      {
        label: 'Neue Benutzer',
        data: statsData.userActivity.newUsers,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
      {
        label: 'Aktive Benutzer',
        data: statsData.userActivity.activeUsers,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Neue Fälle',
        data: statsData.userActivity.newCases,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      }
    ]
  };

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statsHeader}>
        <h2>Dashboard-Übersicht</h2>
        <div className={styles.timeRangeSelector}>
          <button 
            className={`${styles.timeRangeButton} ${timeRange === 'week' ? styles.active : ''}`}
            onClick={() => handleTimeRangeChange('week')}
          >
            Woche
          </button>
          <button 
            className={`${styles.timeRangeButton} ${timeRange === 'month' ? styles.active : ''}`}
            onClick={() => handleTimeRangeChange('month')}
          >
            Monat
          </button>
          <button 
            className={`${styles.timeRangeButton} ${timeRange === 'year' ? styles.active : ''}`}
            onClick={() => handleTimeRangeChange('year')}
          >
            Jahr
          </button>
        </div>
      </div>

      <div className={styles.statsSummary}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-users"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>Benutzer</h3>
            <div className={styles.statValue}>{statsData.summary.totalUsers}</div>
            <div className={styles.statChange}>
              <span className={statsData.summary.userChange >= 0 ? styles.positive : styles.negative}>
                {statsData.summary.userChange >= 0 ? '+' : ''}{statsData.summary.userChange}%
              </span>
              <span className={styles.changePeriod}>seit letztem {timeRange === 'week' ? 'Woche' : timeRange === 'month' ? 'Monat' : 'Jahr'}</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-file-alt"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>Fälle</h3>
            <div className={styles.statValue}>{statsData.summary.totalCases}</div>
            <div className={styles.statChange}>
              <span className={statsData.summary.caseChange >= 0 ? styles.positive : styles.negative}>
                {statsData.summary.caseChange >= 0 ? '+' : ''}{statsData.summary.caseChange}%
              </span>
              <span className={styles.changePeriod}>seit letztem {timeRange === 'week' ? 'Woche' : timeRange === 'month' ? 'Monat' : 'Jahr'}</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-euro-sign"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>Umsatz</h3>
            <div className={styles.statValue}>{statsData.summary.totalRevenue.toFixed(2)} €</div>
            <div className={styles.statChange}>
              <span className={statsData.summary.revenueChange >= 0 ? styles.positive : styles.negative}>
                {statsData.summary.revenueChange >= 0 ? '+' : ''}{statsData.summary.revenueChange}%
              </span>
              <span className={styles.changePeriod}>seit letztem {timeRange === 'week' ? 'Woche' : timeRange === 'month' ? 'Monat' : 'Jahr'}</span>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <i className="fas fa-balance-scale"></i>
          </div>
          <div className={styles.statInfo}>
            <h3>Anwälte</h3>
            <div className={styles.statValue}>{statsData.summary.totalLawyers}</div>
            <div className={styles.statChange}>
              <span className={statsData.summary.lawyerChange >= 0 ? styles.positive : styles.negative}>
                {statsData.summary.lawyerChange >= 0 ? '+' : ''}{statsData.summary.lawyerChange}%
              </span>
              <span className={styles.changePeriod}>seit letztem {timeRange === 'week' ? 'Woche' : timeRange === 'month' ? 'Monat' : 'Jahr'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.chartsContainer}>
        <div className={styles.chartCard}>
          <h3>Umsatzentwicklung</h3>
          <div className={styles.chartContainer}>
            <Line 
              data={revenueData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.dataset.label}: ${context.raw.toFixed(2)} €`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return value + ' €';
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Fälle nach Rechtsgebiet</h3>
          <div className={styles.chartContainer}>
            <Pie 
              data={casesByLegalAreaData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'right',
                  }
                }
              }}
            />
          </div>
        </div>

        <div className={styles.chartCard}>
          <h3>Benutzeraktivität</h3>
          <div className={styles.chartContainer}>
            <Bar 
              data={userActivityData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.exportSection}>
        <h3>Berichte exportieren</h3>
        <div className={styles.exportButtons}>
          <button className={styles.exportButton} onClick={() => window.location.href = `/api/admin/export-report?format=csv&timeRange=${timeRange}`}>
            <i className="fas fa-file-csv"></i> CSV exportieren
          </button>
          <button className={styles.exportButton} onClick={() => window.location.href = `/api/admin/export-report?format=pdf&timeRange=${timeRange}`}>
            <i className="fas fa-file-pdf"></i> PDF exportieren
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;

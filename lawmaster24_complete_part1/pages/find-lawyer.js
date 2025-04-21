// pages/find-lawyer.js
import React, { useState } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import LawyerSearchForm from '../components/LawyerSearchForm';
import Card from '../components/Card';
import Button from '../components/Button';
import styles from '../styles/FindLawyer.module.css';

export default function FindLawyer() {
  // Mock data for lawyer results
  const [lawyers] = useState([
    {
      id: 1,
      name: 'Dr. Anna Schmidt',
      specialization: 'Familienrecht, Erbrecht',
      location: 'Berlin',
      rating: 4.9,
      reviewCount: 127,
      image: '/images/lawyer1.jpg'
    },
    {
      id: 2,
      name: 'Thomas Müller',
      specialization: 'Mietrecht, Vertragsrecht',
      location: 'München',
      rating: 4.7,
      reviewCount: 98,
      image: '/images/lawyer2.jpg'
    },
    {
      id: 3,
      name: 'Julia Weber',
      specialization: 'Arbeitsrecht, Sozialrecht',
      location: 'Hamburg',
      rating: 4.8,
      reviewCount: 112,
      image: '/images/lawyer3.jpg'
    }
  ]);

  return (
    <Layout title="Anwalt finden">
      <Head>
        <title>Anwalt finden - lawmaster24.com</title>
        <meta name="description" content="Finden Sie den passenden Anwalt für Ihren Fall in Ihrer Nähe." />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Finden Sie den passenden Anwalt</h1>
          <p>Suchen Sie nach spezialisierten Anwälten in Ihrer Nähe und vereinbaren Sie einen Termin.</p>
        </div>
        
        <div className={styles.content}>
          <div className={styles.searchSection}>
            <LawyerSearchForm />
            
            <Card className={styles.infoCard}>
              <h2>Warum einen Anwalt über lawmaster24.com finden?</h2>
              <ul className={styles.benefitsList}>
                <li>
                  <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                  <span>Geprüfte und spezialisierte Anwälte</span>
                </li>
                <li>
                  <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                  <span>Transparente Bewertungen von Mandanten</span>
                </li>
                <li>
                  <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                  <span>Einfache Terminvereinbarung</span>
                </li>
                <li>
                  <span className={styles.benefitIcon}><i className="fas fa-check-circle"></i></span>
                  <span>Nahtlose Übergabe Ihrer Falldaten</span>
                </li>
              </ul>
            </Card>
          </div>
          
          <div className={styles.resultsSection}>
            <h2 className={styles.resultsTitle}>Empfohlene Anwälte</h2>
            
            <div className={styles.lawyerResults}>
              {lawyers.map(lawyer => (
                <Card key={lawyer.id} className={styles.lawyerCard}>
                  <div className={styles.lawyerInfo}>
                    <div className={styles.lawyerImage}>
                      <div className={styles.lawyerImagePlaceholder}>
                        <i className="fas fa-user-tie"></i>
                      </div>
                    </div>
                    <div className={styles.lawyerDetails}>
                      <h3>{lawyer.name}</h3>
                      <p className={styles.lawyerSpecialization}>{lawyer.specialization}</p>
                      <p className={styles.lawyerLocation}>
                        <i className="fas fa-map-marker-alt"></i> {lawyer.location}
                      </p>
                      <div className={styles.lawyerRating}>
                        <div className={styles.stars}>
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fas fa-star ${i < Math.floor(lawyer.rating) ? styles.starFilled : i < lawyer.rating ? styles.starHalf : styles.starEmpty}`}></i>
                          ))}
                        </div>
                        <span className={styles.ratingValue}>{lawyer.rating}</span>
                        <span className={styles.reviewCount}>({lawyer.reviewCount} Bewertungen)</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.lawyerActions}>
                    <Button variant="outline" size="small">
                      <i className="fas fa-user"></i> Profil ansehen
                    </Button>
                    <Button variant="primary" size="small">
                      <i className="fas fa-calendar-alt"></i> Termin vereinbaren
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            
            <div className={styles.pagination}>
              <button className={styles.paginationButton} disabled>
                <i className="fas fa-chevron-left"></i> Zurück
              </button>
              <div className={styles.paginationPages}>
                <button className={styles.paginationPage + ' ' + styles.paginationPageActive}>1</button>
                <button className={styles.paginationPage}>2</button>
                <button className={styles.paginationPage}>3</button>
              </div>
              <button className={styles.paginationButton}>
                Weiter <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Navigation.module.css';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          lawmaster<span>24</span>.com
        </Link>
        
        <button 
          className={styles.menuToggle} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}>
          <Link href="/legal-assessment" className={styles.navLink}>
            Rechtliche Einschätzung
          </Link>
          <Link href="/find-lawyer" className={styles.navLink}>
            Anwalt finden
          </Link>
          <Link href="/forum" className={styles.navLink}>
            Rechtsforum
          </Link>
          <Link href="/api-docs" className={styles.navLink}>
            API
          </Link>
          <div className={styles.authButtons}>
            <Link href="/login" className={styles.loginButton}>
              Anmelden
            </Link>
            <Link href="/register" className={styles.registerButton}>
              Registrieren
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

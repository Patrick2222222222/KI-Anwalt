// components/AdminSidebar.js
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/AdminSidebar.module.css';

const AdminSidebar = () => {
  const router = useRouter();
  
  const isActive = (path) => {
    return router.pathname === path ? styles.active : '';
  };
  
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
        <Link href="/">
          <a>
            <h2>lawmaster24</h2>
            <span>Admin-Bereich</span>
          </a>
        </Link>
      </div>
      
      <nav className={styles.navigation}>
        <ul>
          <li>
            <Link href="/admin">
              <a className={isActive('/admin')}>
                <i className="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/users">
              <a className={isActive('/admin/users')}>
                <i className="fas fa-users"></i>
                <span>Benutzer</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/legal-areas">
              <a className={isActive('/admin/legal-areas')}>
                <i className="fas fa-balance-scale"></i>
                <span>Rechtsgebiete</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/cases">
              <a className={isActive('/admin/cases')}>
                <i className="fas fa-file-alt"></i>
                <span>Rechtsfälle</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/lawyers">
              <a className={isActive('/admin/lawyers')}>
                <i className="fas fa-user-tie"></i>
                <span>Anwälte</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/payments">
              <a className={isActive('/admin/payments')}>
                <i className="fas fa-euro-sign"></i>
                <span>Zahlungen</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/content">
              <a className={isActive('/admin/content')}>
                <i className="fas fa-edit"></i>
                <span>Inhalte</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/media">
              <a className={isActive('/admin/media')}>
                <i className="fas fa-images"></i>
                <span>Medien</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/reports">
              <a className={isActive('/admin/reports')}>
                <i className="fas fa-chart-bar"></i>
                <span>Berichte</span>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/admin/settings">
              <a className={isActive('/admin/settings')}>
                <i className="fas fa-cog"></i>
                <span>Einstellungen</span>
              </a>
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className={styles.userSection}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>
            <i className="fas fa-user-circle"></i>
          </div>
          <div className={styles.userName}>
            <span>Admin</span>
            <small>Administrator</small>
          </div>
        </div>
        <button className={styles.logoutButton} onClick={() => router.push('/api/auth/logout')}>
          <i className="fas fa-sign-out-alt"></i>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;

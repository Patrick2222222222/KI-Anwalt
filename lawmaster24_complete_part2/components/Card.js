// components/Card.js
import React from 'react';
import styles from '../styles/Card.module.css';

export default function Card({ children, title, footer, className = '' }) {
  return (
    <div className={`${styles.card} ${className}`}>
      {title && <div className={styles.cardHeader}>{title}</div>}
      <div className={styles.cardBody}>{children}</div>
      {footer && <div className={styles.cardFooter}>{footer}</div>}
    </div>
  );
}

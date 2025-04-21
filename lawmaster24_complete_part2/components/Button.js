// components/Button.js
import React from 'react';
import styles from '../styles/Button.module.css';

export default function Button({ children, variant = 'primary', size = 'medium', onClick, type = 'button', fullWidth = false, disabled = false }) {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    disabled ? styles.disabled : ''
  ].join(' ');

  return (
    <button 
      className={buttonClasses}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

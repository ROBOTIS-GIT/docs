import React, {type ComponentPropsWithoutRef} from 'react';
import styles from './styles.module.css';

export default function SectionCard({className = '', ...props}: ComponentPropsWithoutRef<'section'>) {
  return <section {...props} className={`${styles.card} ${className}`} />;
}

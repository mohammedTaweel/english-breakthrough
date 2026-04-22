import type { ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeVariant = 'default' | 'accent' | 'success' | 'error' | 'warn';
type BadgeSize = 'sm' | 'md';

type BadgeProps = {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
};

export function Badge({
  variant = 'default',
  size = 'sm',
  children,
}: BadgeProps) {
  const classes = [styles.badge, styles[variant], styles[size]].join(' ');

  return <span className={classes}>{children}</span>;
}

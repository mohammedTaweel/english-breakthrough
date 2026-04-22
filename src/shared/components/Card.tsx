import type { HTMLAttributes, ReactNode } from 'react';
import styles from './Card.module.css';

type CardVariant = 'default' | 'accent' | 'success' | 'warn';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

const paddingMap: Record<CardPadding, string> = {
  none: styles.padNone,
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
};

type CardProps = {
  variant?: CardVariant;
  padding?: CardPadding;
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'>;

export function Card({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...rest
}: CardProps) {
  const classes = [
    styles.card,
    styles[variant],
    paddingMap[padding],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}

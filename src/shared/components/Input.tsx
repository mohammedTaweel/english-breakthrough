import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

type InputProps = {
  label: string;
  error?: string;
  hint?: string;
  dir?: 'rtl' | 'ltr';
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'dir'>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, dir = 'rtl', className, id: idProp, ...rest }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    const inputClasses = [
      styles.input,
      error ? styles.inputError : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.wrapper}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          dir={dir}
          className={inputClasses}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...rest}
        />
        {hint && !error && (
          <span id={`${id}-hint`} className={styles.hint}>
            {hint}
          </span>
        )}
        {error && (
          <span id={`${id}-error`} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

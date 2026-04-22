import type { FC } from 'react';

interface Props {
  title: string;
  feature: string;
}

/**
 * Temporary screen shown for routes whose feature hasn't been migrated yet.
 * Delete this component once all features are ported from legacy.
 */
export const PlaceholderScreen: FC<Props> = ({ title, feature }) => {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--sp-6)',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: 'var(--fs-2xl)', margin: 0 }}>{title}</h1>
      <p style={{ color: 'var(--c-text-secondary)', marginTop: 'var(--sp-3)' }}>
        Feature: <code>{feature}</code> — قيد التطوير
      </p>
    </main>
  );
};
